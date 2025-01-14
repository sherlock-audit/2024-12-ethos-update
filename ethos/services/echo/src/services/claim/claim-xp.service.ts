import { hashServiceAndAccount } from '@ethos/blockchain-manager';
import {
  claimReferralId,
  MAX_REFERRAL_USES,
  REFERRAL_BONUS_PERCENTAGE,
  X_SERVICE,
} from '@ethos/domain';
import { z } from 'zod';
import { prisma } from '../../data/db.js';
import { xpPointsHistory } from '../../data/xp-points-history/index.js';
import { Service } from '../service.base.js';
import { ServiceError } from '../service.error.js';
import { type AnyRecord } from '../service.types.js';
import { TwitterUser } from '../twitter/user.service.js';

export const REFERRER_NOT_FOUND = 'REFERRER_NOT_FOUND';
export const REFERRAL_LIMIT_REACHED = 'REFERRAL_LIMIT_REACHED';

const schema = z.object({
  twitterUser: z.object({
    id: z.string(),
    username: z.string(),
    name: z.string(),
    avatar: z.string().optional(),
  }),
  referrerId: z.string().optional(),
});

type Input = z.infer<typeof schema>;
type Output = undefined;

export class ClaimXpService extends Service<typeof schema, Output> {
  validate(params: AnyRecord): Input {
    return this.validator(params, schema);
  }

  async execute({ twitterUser, referrerId }: Input): Promise<Output> {
    await this.updateTwitterUserCache(twitterUser);

    const twitterUserId = twitterUser.id;

    const claim = await prisma.claim.findUnique({
      where: { twitterUserId },
    });

    await prisma.$transaction(async (tx) => {
      if (!claim) {
        // Create a claim if it doesn't exist
        await tx.claim.create({
          data: {
            twitterUserId: twitterUser.id,
            initialAmount: 0,
            claimed: true,
            claimedAt: new Date(),
          },
        });
      } else if (!claim.claimed) {
        // Mark it as claimed if it hasn't been claimed yet.
        // Likely, for influencers pre-selected for XP claim.
        await tx.claim.update({
          where: {
            twitterUserId,
          },
          data: {
            claimed: true,
            claimedAt: new Date(),
          },
        });

        await xpPointsHistory.recordXpByAttestation(
          X_SERVICE,
          twitterUserId,
          claim.initialAmount,
          'CLAIM',
        );
      }

      const referrerTwitterUserId = referrerId ? claimReferralId.decode(referrerId) : null;

      if (referrerTwitterUserId) {
        const [referrerClaim, claimedReferral, timesReferralWasUsed] = await Promise.all([
          tx.claim.findUnique({
            where: {
              twitterUserId: referrerTwitterUserId,
              // Ensure referrer has claimed their XP. This is to prevent users
              // guessing who might be on the list and use the referral link
              // before the influencer shares it.
              claimed: true,
            },
          }),
          tx.claimReferral.findFirst({
            where: {
              toTwitterUserId: twitterUserId,
            },
          }),
          tx.claimReferral.count({
            where: {
              fromTwitterUserId: referrerTwitterUserId,
            },
          }),
        ]);

        // Check if referrer exists
        if (!referrerClaim) {
          throw ServiceError.BadRequest('Referrer not found', { code: REFERRER_NOT_FOUND });
        }

        if (timesReferralWasUsed >= MAX_REFERRAL_USES) {
          this.logger.info(
            { data: { twitterUserId, referrerTwitterUserId, timesReferralWasUsed } },
            'Referral link already used maximum number of times',
          );

          throw ServiceError.BadRequest('Referral limit reached', {
            code: REFERRAL_LIMIT_REACHED,
          });
        }

        if (claimedReferral) {
          this.logger.info(
            { data: { twitterUserId, referrerTwitterUserId } },
            'Referral already claimed',
          );

          return;
        }

        // Referrer (sender) gets a 20% bonus from the receiver's initial
        // bonus for referring the new user (receiver).
        const bonusAmountForSender = Math.floor(
          (claim?.initialAmount ?? 0) * REFERRAL_BONUS_PERCENTAGE,
        );

        // Receiver (current user) gets a 20% bonus from the referrer's
        // initial bonus for using referral link.
        const bonusAmountForReceiver = Math.floor(
          referrerClaim.initialAmount * REFERRAL_BONUS_PERCENTAGE,
        );

        await tx.claimReferral.create({
          data: {
            fromTwitterUserId: referrerTwitterUserId,
            toTwitterUserId: twitterUserId,
            bonusAmountForSender,
            bonusAmountForReceiver,
          },
        });

        await Promise.all([
          xpPointsHistory.recordXpByAttestation(
            X_SERVICE,
            referrerTwitterUserId,
            bonusAmountForSender,
            'CLAIM_REFERRAL',
          ),
          xpPointsHistory.recordXpByAttestation(
            X_SERVICE,
            twitterUserId,
            bonusAmountForReceiver,
            'CLAIM_REFERRAL',
          ),
        ]);
      }
    });
  }

  private async updateTwitterUserCache(twitterUser: Input['twitterUser']): Promise<void> {
    const cached = await this.useService(TwitterUser)
      .run({ username: twitterUser.username })
      .catch(() => null);

    if (!cached) {
      const data = {
        ...twitterUser,
        attestationHash: hashServiceAndAccount(X_SERVICE, twitterUser.id),
      };

      await prisma.twitterProfileCache.upsert({
        create: data,
        update: data,
        where: { id: twitterUser.id },
      });
    }
  }
}
