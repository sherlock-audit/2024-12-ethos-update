import { fromUserKey, toUserKey } from '@ethos/domain';
import { type PaginatedResponse } from '@ethos/helpers';
import { type Prisma } from '@prisma-pg/client';
import { z } from 'zod';
import { prisma } from '../../data/db.js';
import { user } from '../../data/user/lookup/index.js';
import { Service } from '../service.base.js';
import { ServiceError } from '../service.error.js';
import { type AnyRecord } from '../service.types.js';
import { validators } from '../service.validator.js';

export type XpPointsHistory = Prisma.XpPointsHistoryGetPayload<{
  select: {
    id: true;
    userkey: true;
    type: true;
    points: true;
    metadata: true;
    createdAt: true;
  };
}>;

export const schema = z
  .object({
    userkey: validators.ethosUserKey(),
  })
  .merge(validators.paginationSchema());

type Input = z.infer<typeof schema>;
type Output = PaginatedResponse<XpPointsHistory>;

export class XpHistoryService extends Service<typeof schema, Output> {
  validate(params: AnyRecord): Input {
    return this.validator(params, schema);
  }

  async execute({ userkey, pagination }: z.infer<typeof schema>): Promise<Output> {
    const { limit = 10, offset = 0 } = pagination ?? {};

    const profileId = await user.getProfileId(fromUserKey(userkey));

    if (!profileId) {
      throw ServiceError.NotFound('Profile not found');
    }

    const targets = await user.getTargetsByProfileId(profileId);
    const userkeys = targets.map((x) => toUserKey(x));
    const where: Prisma.XpPointsHistoryWhereInput = {
      userkey: {
        in: userkeys,
      },
    };

    const [total, values] = await Promise.all([
      prisma.xpPointsHistory.count({
        where,
      }),
      prisma.xpPointsHistory.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
    ]);

    return {
      total,
      limit,
      offset,
      values,
    };
  }
}
