import { type AttestationActivityInfo, type BlockchainEvent, X_SERVICE } from '@ethos/domain';
import { Prisma } from '@prisma-pg/client';
import { convert } from '../../../data/conversion.js';
import { prisma } from '../../../data/db.js';
import { user } from '../../../data/user/lookup/index.js';
import { type PrismaTwitterProfileCache } from '../../../data/user/twitter-profile.js';
import { type ActivityQuery, getActor, joinOrEmpty } from '../utility.js';
import { activityQuery } from './activity-query.js';

type AttestationInfo = Prisma.AttestationGetPayload<{ select: null }> & {
  logData: Prisma.JsonValue;
};

export const attestationActivityQuery: ActivityQuery<AttestationInfo, AttestationActivityInfo> = {
  query: async ({ target, ids, currentUserProfileId, minimumAuthorScore, orderBy, pagination }) => {
    const whereFilter: Prisma.Sql[] = [];

    if (target) {
      const profileId = await user.getProfileId(target);

      if (profileId === null) return { results: [], totalCount: 0 };

      whereFilter.push(Prisma.sql`"profileId" = ${profileId}`);
    }

    if (ids && ids.length > 0) {
      whereFilter.push(Prisma.sql`id in (${Prisma.join(ids)})`);
    }

    const query = Prisma.sql`
      SELECT attestations.*
      FROM attestations
      ${joinOrEmpty(whereFilter, ' AND ', 'WHERE ')}
    `;

    const results = await activityQuery<AttestationInfo>({
      data: {
        query,
        contract: null,
        id: Prisma.sql`id`,
        authorProfileId: Prisma.sql`"profileId"`,
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

    const events = await prisma.attestationEvent.findMany({
      where: { attestationId: { in: ids } },
      include: {
        event: true,
      },
    });

    const eventLookup = events.reduce<Partial<Record<number, BlockchainEvent[]>>>((acc, value) => {
      acc[value.attestationId] ??= [];
      acc[value.attestationId]?.push(convert.toBlockchainEvent(value.event));

      return acc;
    }, {});

    const xComAttestationAccounts = results
      .filter((a) => a.data.service === X_SERVICE)
      .map((a) => a.data.account);

    const xComAccounts = xComAttestationAccounts.length
      ? await prisma.twitterProfileCache.findMany({
          where: {
            id: { in: xComAttestationAccounts },
          },
        })
      : [];

    const xComAccountsMap = xComAccounts.reduce<Map<string, PrismaTwitterProfileCache>>(
      (acc, x) => {
        if (!acc.has(x.id)) {
          acc.set(x.id, x);
        }

        return acc;
      },
      new Map(),
    );

    const activities = await Promise.all(
      results.map(async ({ data: attestation, metadata }) => {
        const xComAccount = xComAccountsMap.get(attestation.account);
        const data = convert.toAttestationFromPrisma(attestation);

        const author = await getActor({ profileId: attestation.profileId });

        const info: AttestationActivityInfo = {
          type: 'attestation',
          data: {
            ...data,
            username: xComAccount?.username ?? '',
          },
          timestamp: data.createdAt,
          votes: metadata.votes,
          replySummary: metadata.replySummary,
          author,
          subject: author,
          events: eventLookup[attestation.id] ?? [],
        };

        return { activityInfo: info, sortWeight: metadata.sortWeight };
      }),
    );

    return activities;
  },
};
