import { type BlockchainEvent, type VouchActivityInfo } from '@ethos/domain';
import { Prisma } from '@prisma-pg/client';
import { blockchainManager } from '../../../common/blockchain-manager.js';
import { convert } from '../../../data/conversion.js';
import { prisma } from '../../../data/db.js';
import { user } from '../../../data/user/lookup/index.js';
import { getActor, joinOrEmpty, type ActivityQuery } from '../utility.js';
import { activityQuery } from './activity-query.js';

type VouchInfo = Prisma.VouchGetPayload<{ select: null }>;

export const vouchActivityQuery: ActivityQuery<VouchInfo, VouchActivityInfo> = {
  query: async ({
    target,
    direction,
    ids,
    currentUserProfileId,
    minimumAuthorScore,
    pagination,
    excludeHistorical,
    orderBy,
  }) => {
    const whereFilter: Prisma.Sql[] = [];

    if (target) {
      const profileId = await user.getProfileId(target);

      if (profileId === null) return { results: [], totalCount: 0 };

      const userFilters: Prisma.Sql[] = [];

      if (direction === 'author' || direction === undefined) {
        userFilters.push(Prisma.sql`"authorProfileId" = ${profileId}`);
      }
      if (direction === 'subject' || direction === undefined) {
        userFilters.push(Prisma.sql`"subjectProfileId" = ${profileId}`);
      }

      whereFilter.push(joinOrEmpty(userFilters, ' OR ', '(', ')'));
    }

    if (excludeHistorical) {
      whereFilter.push(Prisma.sql`archived = false`);
    }

    if (ids && ids.length > 0) {
      whereFilter.push(Prisma.sql`id in (${Prisma.join(ids)})`);
    }

    const where = joinOrEmpty(whereFilter, ' AND ', 'WHERE ');

    const query = Prisma.sql`
      SELECT vouches.*
      FROM vouches
      ${where}
    `;

    const results = await activityQuery<VouchInfo>({
      data: {
        query,
        contract: blockchainManager.getContractAddress('vouch'),
        id: Prisma.sql`id`,
        authorProfileId: Prisma.sql`"authorProfileId"`,
        timestamp: Prisma.sql`"vouchedAt"`,
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

    const events = await prisma.vouchEvent.findMany({
      where: { vouchId: { in: ids } },
      include: {
        event: true,
      },
    });

    const eventLookup = events.reduce<Partial<Record<number, BlockchainEvent[]>>>((acc, value) => {
      acc[value.vouchId] ??= [];
      acc[value.vouchId]?.push(convert.toBlockchainEvent(value.event));

      return acc;
    }, {});

    const activities = await Promise.all(
      results.map(async ({ data: vouch, metadata }) => {
        const data = convert.toVouch(vouch);

        const [author, subject] = await Promise.all([
          getActor({ profileId: vouch.authorProfileId }),
          getActor({ profileId: vouch.subjectProfileId }),
        ]);

        const info: VouchActivityInfo = {
          type: 'vouch',
          data,
          timestamp: data.activityCheckpoints.vouchedAt,
          votes: metadata.votes,
          replySummary: metadata.replySummary,
          author,
          subject,
          events: eventLookup[vouch.id] ?? [],
        };

        return { activityInfo: info, sortWeight: metadata.sortWeight };
      }),
    );

    return activities;
  },
};
