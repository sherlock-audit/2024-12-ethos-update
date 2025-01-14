import { z } from 'zod';
import { prisma } from '../../data/db.js';
import { Service } from '../service.base.js';
import { ServiceError } from '../service.error.js';
import { type AnyRecord } from '../service.types.js';

const schema = z.object({
  token: z.string(),
  deviceIdentifier: z.string(),
  userAgent: z.string().optional().default('unknown'),
});

type Input = z.infer<typeof schema>;
type Output = {
  result: string;
};

const MAX_TOKENS_PER_PROFILE = 10;

export class UpdateUserFCMTokenService extends Service<typeof schema, Output> {
  validate(params: AnyRecord): Input {
    return this.validator(params, schema);
  }

  async execute({ deviceIdentifier, token, userAgent }: Input): Promise<Output> {
    const { privyUser } = this.context();
    const profileId = privyUser?.profile?.id;

    if (!profileId) {
      throw ServiceError.Forbidden('No Ethos profile');
    }

    const userFcmToken = await prisma.userFcmToken.findFirst({
      where: {
        profileId,
        deviceIdentifier,
      },
    });

    // If the token already linked to the profile-device pair, return unchanged, otherwise update the token
    // for the profile-device pair
    if (userFcmToken?.fcmToken === token) {
      return { result: 'unchanged' };
    } else if (userFcmToken) {
      await prisma.userFcmToken.update({
        where: { id: userFcmToken.id },
        data: { fcmToken: token },
      });

      return { result: 'updated' };
    }

    const existingTokens = await prisma.userFcmToken.findMany({
      where: { profileId },
      orderBy: { createdAt: 'asc' },
    });

    // If the profile has reached the maximum allowed devices, delete the oldest ones
    if (existingTokens.length >= MAX_TOKENS_PER_PROFILE) {
      const tokensToDelete = existingTokens.slice(
        0,
        existingTokens.length - MAX_TOKENS_PER_PROFILE,
      );

      const deleteIds = tokensToDelete.map((token) => token.id);

      await prisma.userFcmToken.deleteMany({
        where: {
          id: { in: deleteIds },
        },
      });
    }

    // register new device for this profile
    await prisma.userFcmToken.create({
      data: {
        profileId,
        fcmToken: token,
        deviceIdentifier,
        userAgent,
      },
    });

    return {
      result: 'created',
    };
  }
}
