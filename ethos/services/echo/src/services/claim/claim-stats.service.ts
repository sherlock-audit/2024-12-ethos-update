import { z } from 'zod';
import { prisma } from '../../data/db.js';
import { Service } from '../service.base.js';
import { ServiceError } from '../service.error.js';

const schema = z.void();

type Input = z.infer<typeof schema>;
type Output = {
  /**
   * Initial bonus defined by Ethos
   */
  initialBonus: number;
  /**
   * Total amount of XP claimed, including the initial and referral bonuses
   */
  totalAmount: number;
  /**
   * Bonus from accepting someone's referral
   */
  acceptedReferralBonus: number;
  /**
   * Bonus from someone accepting your referral
   */
  receivedReferralBonus: number;
};

export class ClaimStatsService extends Service<typeof schema, Output> {
  validate(): Input {}

  async execute(): Promise<Output> {
    const { twitterUserId } = this.context();

    if (!twitterUserId) {
      throw ServiceError.Unauthorized('Not authorized');
    }

    const [claim, referralsForSender, referralsForReceiver] = await Promise.all([
      prisma.claim.findUnique({
        where: { twitterUserId },
      }),
      prisma.claimReferral.aggregate({
        _sum: {
          bonusAmountForSender: true,
        },
        where: {
          fromTwitterUserId: twitterUserId,
        },
      }),
      prisma.claimReferral.aggregate({
        _sum: {
          bonusAmountForReceiver: true,
        },
        where: {
          toTwitterUserId: twitterUserId,
        },
      }),
    ]);

    const initialBonus = claim?.claimed ? claim.initialAmount : 0;
    const receivedReferralBonus = referralsForSender._sum.bonusAmountForSender ?? 0;
    const acceptedReferralBonus = referralsForReceiver._sum.bonusAmountForReceiver ?? 0;

    return {
      initialBonus,
      totalAmount: initialBonus + acceptedReferralBonus + receivedReferralBonus,
      acceptedReferralBonus,
      receivedReferralBonus,
    };
  }
}
