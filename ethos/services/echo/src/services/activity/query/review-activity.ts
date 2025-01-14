import { type BlockchainEvent, type EthosUserTarget, type ReviewActivityInfo } from '@ethos/domain';
import { isValidAddress } from '@ethos/helpers';
import { Prisma } from '@prisma-pg/client';
import { getAddress } from 'viem';
import { blockchainManager } from '../../../common/blockchain-manager.js';
import { convert } from '../../../data/conversion.js';
import { prisma } from '../../../data/db.js';
import { user } from '../../../data/user/lookup/index.js';
import { getActor, joinOrEmpty, type ActivityQuery } from '../utility.js';
import { activityQuery } from './activity-query.js';

type ReviewInfo = Prisma.ReviewGetPayload<{ select: null }>;

export const reviewActivityQuery: ActivityQuery<ReviewInfo, ReviewActivityInfo> = {
  query: async ({
    target,
    direction,
    ids,
    excludeHistorical,
    currentUserProfileId,
    minimumAuthorScore,
    orderBy,
    pagination,
  }) => {
    const whereFilter: Prisma.Sql[] = [];

    if (target) {
      const targetFilters: Prisma.Sql[] = [];

      if (direction === 'author') {
        const profileId = await user.getProfileId(target);

        // authors must have a profile
        if (profileId === null) return { results: [], totalCount: 0 };

        targetFilters.push(Prisma.sql`"authorProfileId" = ${profileId}`);
      }
      if (direction === undefined) {
        const profileId = await user.getProfileId(target);

        // if we found a profile id, use for author lookup, otherwise skip
        if (profileId !== null) {
          targetFilters.push(Prisma.sql`"authorProfileId" = ${profileId}`);
        }
      }

      const subjectAddresses = [];
      const subjectServiceAccounts = [];

      if (direction === 'subject' || direction === undefined) {
        if ('address' in target) subjectAddresses.push(target.address);
        if ('service' in target) {
          subjectServiceAccounts.push({ service: target.service, account: target.account });
        }
      }
      if (direction === 'subject' && 'profileId' in target) {
        const [profileAddresses, attestations] = await Promise.all([
          user.getAddresses(target),
          user.getAttestations(target.profileId),
        ]);

        for (const address of profileAddresses.allAddresses) {
          subjectAddresses.push(address);
        }

        for (const attestation of attestations) {
          subjectServiceAccounts.push({
            service: attestation.service,
            account: attestation.account,
          });
        }
      }

      for (const address of subjectAddresses) {
        targetFilters.push(Prisma.sql`"subject" = ${address}`);
      }

      for (const serviceAccount of subjectServiceAccounts) {
        targetFilters.push(
          Prisma.sql`("service" = ${serviceAccount.service} AND "account" = ${serviceAccount.account})`,
        );
      }

      if (targetFilters.length > 0) {
        whereFilter.push(joinOrEmpty(targetFilters, ' OR ', '(', ')'));
      }
    }

    if (ids && ids.length > 0) {
      whereFilter.push(Prisma.sql`id in (${Prisma.join(ids)})`);
    }

    if (excludeHistorical) {
      whereFilter.push(Prisma.sql`archived = false`);
    }

    const query = Prisma.sql`
      SELECT reviews.*
      FROM reviews
      ${joinOrEmpty(whereFilter, ' AND ', 'WHERE ')}
    `;

    const results = await activityQuery<ReviewInfo>({
      data: {
        query,
        contract: blockchainManager.getContractAddress('review'),
        id: Prisma.sql`id`,
        authorProfileId: Prisma.sql`"authorProfileId"`,
        timestamp: Prisma.sql`"createdAt"`,
      },
      currentUserProfileId,
      minimumAuthorScore,
      orderBy,
      pagination,
    });

    return results;
  },
  hydrate: async (results) => {
    const ids = results.map((x) => x.data.id);

    if (ids.length === 0) return [];

    const events = await prisma.reviewEvent.findMany({
      where: { reviewId: { in: ids } },
      include: {
        event: true,
      },
    });

    const eventLookup = events.reduce<Partial<Record<number, BlockchainEvent[]>>>((acc, value) => {
      acc[value.reviewId] ??= [];
      acc[value.reviewId]?.push(convert.toBlockchainEvent(value.event));

      return acc;
    }, {});

    const activities = await Promise.all(
      results.map(async ({ data: review, metadata }) => {
        const data = convert.toReview(review);
        const reviewTarget: EthosUserTarget =
          !isValidAddress(review.subject) && review.account && review.service
            ? { service: review.service, account: review.account }
            : { address: getAddress(review.subject) };

        const [author, subject] = await Promise.all([
          getActor({ address: getAddress(review.author) }),
          getActor(reviewTarget),
        ]);

        const info: ReviewActivityInfo = {
          type: 'review',
          data,
          timestamp: data.createdAt,
          votes: metadata.votes,
          replySummary: metadata.replySummary,
          author,
          subject,
          events: eventLookup[review.id] ?? [],
        };

        return { activityInfo: info, sortWeight: metadata.sortWeight };
      }),
    );

    return activities;
  },
};
