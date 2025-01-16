import { fromUserKey, type PendingInvitation } from '@ethos/domain';
import { z } from 'zod';
import { prisma } from '../../data/db.js';
import { getLatestScoreOrCalculate } from '../../data/score/calculate.js';
import { simulateAcceptInvitation } from '../../data/score/simulate.js';
import { Service } from '../service.base.js';
import { type AnyRecord } from '../service.types.js';
import { validators } from '../service.validator.js';
import { scoreImpact } from './invitation.service.js';

const schema = z.object({
  address: validators.address,
});

type Input = z.infer<typeof schema>;
type Output = PendingInvitation[];

/**
 * Retrieves a list of profileIds that have an active invitation sent to the given address
 */
export class PendingInvitations extends Service<typeof schema, Output> {
  validate(params: AnyRecord): Input {
    return this.validator(params, schema);
  }

  async execute({ address }: Input): Promise<Output> {
    const profiles = await prisma.profile.findMany({
      select: {
        id: true,
      },
      where: {
        invitesSent: {
          has: address.toLowerCase(),
        },
      },
    });

    const invitedAddressScore = await getLatestScoreOrCalculate(fromUserKey(`address:${address}`));

    const invitationsList: PendingInvitation[] = await Promise.all(
      profiles.map(async (p) => {
        const invitationScore = await simulateAcceptInvitation({ profileId: p.id });
        const newScore = invitedAddressScore.score + invitationScore.score;
        const impact = scoreImpact(invitedAddressScore.score, Math.round(newScore));

        return {
          id: p.id,
          impact,
        };
      }),
    );

    // Order by relative impact ascending
    return invitationsList.sort(
      (a, b) => b.impact.adjustedRecipientScore - a.impact.adjustedRecipientScore,
    );
  }
}
