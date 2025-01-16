import { type ActivityActor, X_SERVICE } from '@ethos/domain';
import { type PaginatedResponse } from '@ethos/helpers';
import { type z } from 'zod';
import { prisma } from '../../data/db.js';
import { getActors } from '../activity/utility.js';
import { Service } from '../service.base.js';
import { ServiceError } from '../service.error.js';
import { type AnyRecord } from '../service.types.js';
import { validators } from '../service.validator.js';

const schema = validators.paginationSchema();

type Input = z.infer<typeof schema>;
type Output = PaginatedResponse<{
  actor: ActivityActor;
  bonusAmountForSender: number;
  twitterUserId: string;
}>;

export class AcceptedReferralsService extends Service<typeof schema, Output> {
  validate(params: AnyRecord): Input {
    return this.validator(params, schema);
  }

  async execute({ pagination }: Input): Promise<Output> {
    const { twitterUserId } = this.context();

    if (!twitterUserId) {
      throw ServiceError.Unauthorized('Not authorized');
    }

    const [referrals, totalLength] = await Promise.all([
      prisma.claimReferral.findMany({
        where: { fromTwitterUserId: twitterUserId },
        select: {
          bonusAmountForSender: true,
          toTwitterUserId: true,
          createdAt: true,
        },
        orderBy: {
          bonusAmountForSender: 'desc',
        },
        skip: pagination.offset,
        take: pagination.limit,
      }),
      prisma.claimReferral.count({
        where: { fromTwitterUserId: twitterUserId },
      }),
    ]);

    const receiverActors = await getActors(
      referrals.map((r) => ({ service: X_SERVICE, account: r.toTwitterUserId })),
    );

    return {
      total: totalLength,
      limit: pagination.limit,
      offset: pagination.offset,
      values: referrals.map((r, index) => ({
        actor: receiverActors[index],
        bonusAmountForSender: r.bonusAmountForSender,
        twitterUserId: r.toTwitterUserId,
      })),
    };
  }
}
