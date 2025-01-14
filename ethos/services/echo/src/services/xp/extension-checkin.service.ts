import { createHmac } from 'node:crypto';
import { X_SERVICE } from '@ethos/domain';
import { duration } from '@ethos/helpers';
import { XpPointsHistoryItemType } from '@prisma-pg/client';
import { z } from 'zod';
import { getTargetScoreXpMultiplier } from '../../data/score/xp.js';
import { xpPointsHistory } from '../../data/xp-points-history/index.js';
import { Service } from '../service.base.js';
import { ServiceError } from '../service.error.js';
import { type AnyRecord } from '../service.types.js';
import { TwitterUser } from '../twitter/user.service.js';

const DAILY_CHECK_IN_XP = 100;

const schema = z.object({
  twitterHandle: z.string(),
  timestamp: z.number(),
  installationId: z.string(),
  signature: z.string(),
});

type Input = z.infer<typeof schema>;
type Output = { success: boolean };

export class ExtensionCheckInService extends Service<typeof schema, Output> {
  validate(params: AnyRecord): Input {
    return this.validator(params, schema);
  }

  async execute({ twitterHandle, timestamp, installationId, signature }: Input): Promise<Output> {
    // Verify the signature
    const dataToVerify = `${twitterHandle}:${timestamp}:${installationId}`;

    // Create HMAC using installationId as key
    const expectedSignature = createHmac('sha256', installationId)
      .update(dataToVerify)
      .digest('base64');

    if (signature !== expectedSignature) {
      throw ServiceError.Unauthorized('Invalid signature', { code: 'INVALID_SIGNATURE' });
    }

    // Verify timestamp is recent (within last 5 minutes)
    const now = Date.now();

    if (now - timestamp > duration(5, 'minutes').toMilliseconds()) {
      this.logger.info(
        { data: { reason: 'TIMESTAMP_TOO_OLD' } },
        'extension_daily_checkin.invalid_request',
      );
      throw ServiceError.Unauthorized('Unauthorized', { code: 'UNAUTHORIZED' });
    }

    // Get Twitter user ID from handle
    const twitterUser = await this.useService(TwitterUser)
      .run({ username: twitterHandle })
      .catch((_err) => {
        throw ServiceError.BadRequest('Twitter user not found', { code: 'TWITTER_USER_NOT_FOUND' });
      });

    // Check if already checked in today
    const existingCheckIn = await xpPointsHistory.getExistingCheckIn(X_SERVICE, twitterUser.id);

    if (existingCheckIn) {
      throw ServiceError.BadRequest('Already checked in today', { code: 'ALREADY_CHECKED_IN' });
    }

    // Calculate points with multiplier
    const pointsMultiplier = await getTargetScoreXpMultiplier({
      service: X_SERVICE,
      account: twitterUser.id,
    });
    const points = Math.floor(DAILY_CHECK_IN_XP * pointsMultiplier);

    // Award XP using the helper
    await xpPointsHistory.recordXpByAttestation(
      X_SERVICE,
      twitterUser.id,
      points,
      XpPointsHistoryItemType.EXTENSION_CHECK_IN,
      {
        type: 'extensionCheckIn',
        installationId,
        multiplier: pointsMultiplier,
      },
    );

    return { success: true };
  }
}
