import { fromUserKey, type ActivityActorWithXp } from '@ethos/domain';
import { notEmpty } from '@ethos/helpers';
import { z } from 'zod';
import { prisma } from '../../data/db.js';
import { getActors } from '../activity/utility.js';
import { Service } from '../service.base.js';
import { type AnyRecord } from '../service.types.js';

const schema = z.object({});

type XPLeaderboardQueryParams = z.infer<typeof schema>;

export class XPLeaderboardQuery extends Service<typeof schema, ActivityActorWithXp[]> {
  validate(params: AnyRecord): XPLeaderboardQueryParams {
    return this.validator(params, schema);
  }

  async execute(): Promise<ActivityActorWithXp[]> {
    const leaderboard = await prisma.xpPointsHistory.groupBy({
      by: ['userkey'],
      _sum: {
        points: true,
      },
      orderBy: {
        _sum: {
          points: 'desc',
        },
      },
      take: 50, // Temporary until we support pagination
    });

    const leaderboardByProfileId = leaderboard
      .map((entry) => {
        return [entry.userkey, entry._sum.points ?? 0] as const;
      })
      .filter(notEmpty);

    const leaderboardMap = new Map(leaderboardByProfileId);
    const targets = Array.from(leaderboardMap.keys()).map((userkey) => fromUserKey(userkey));

    const actors = await getActors(targets);

    const actorsWithXp: ActivityActorWithXp[] = actors.map((actor) => ({ ...actor, totalXp: 0 }));

    for (const actor of actorsWithXp) {
      actor.totalXp = leaderboardMap.get(actor.userkey) ?? 0;
    }

    return actorsWithXp;
  }
}
