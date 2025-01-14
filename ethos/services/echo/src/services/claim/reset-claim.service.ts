import { z } from 'zod';
import { prisma } from '../../data/db.js';
import { Service } from '../service.base.js';
import { type AnyRecord } from '../service.types.js';

const schema = z.object({
  twitterUserId: z.string().optional(),
});

type Input = z.infer<typeof schema>;
type Output = undefined;

export class ResetClaim extends Service<typeof schema, Output> {
  validate(params: AnyRecord): Input {
    return this.validator(params, schema);
  }

  async execute({ twitterUserId }: Input): Promise<Output> {
    if (!twitterUserId) {
      this.logger.warn('No Twitter user ID found in context');

      return;
    }

    await prisma.$transaction([
      prisma.claim.update({
        data: {
          claimed: false,
          claimedAt: null,
        },
        where: {
          twitterUserId,
        },
      }),
      prisma.claimReferral.deleteMany({
        where: {
          toTwitterUserId: twitterUserId,
        },
      }),
    ]);

    this.logger.info('Claim reset successfully');
  }
}
