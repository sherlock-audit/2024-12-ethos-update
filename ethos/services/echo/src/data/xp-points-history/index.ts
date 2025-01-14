import { type ProfileId } from '@ethos/blockchain-manager';
import { toUserKey, type X_SERVICE } from '@ethos/domain';
import { XpPointsHistoryItemType, type Prisma } from '@prisma-pg/client';
import { getDailyRange } from '../../services/contribution/utils.js';
import { prisma } from '../db.js';
import { user } from '../user/lookup/index.js';

type AttestationService = typeof X_SERVICE;

/**
 * Checks if the user has already checked in with Twitter Chrome extension today.
 */
async function getExistingCheckIn(
  service: AttestationService,
  account: string,
): Promise<Prisma.XpPointsHistoryGetPayload<Record<string, never>> | null> {
  const profileId = await user.getProfileIdByAttestation(service, account);
  const userkey = profileId ? toUserKey({ profileId }) : toUserKey({ service, account });
  const dailyRange = getDailyRange();

  return await prisma.xpPointsHistory.findFirst({
    where: {
      userkey,
      type: XpPointsHistoryItemType.EXTENSION_CHECK_IN,
      createdAt: {
        gte: dailyRange.start,
        lt: dailyRange.end,
      },
    },
  });
}

async function recordXpByAttestation(
  service: AttestationService,
  account: string,
  points: number,
  type: XpPointsHistoryItemType,
  customMetadata?: Record<string, unknown>,
): Promise<void> {
  const profileId = await user.getProfileIdByAttestation(service, account);
  const userkey = profileId ? toUserKey({ profileId }) : toUserKey({ service, account });

  await prisma.xpPointsHistory.create({
    data: {
      userkey,
      points,
      createdAt: new Date(),
      type,
      metadata: {
        service,
        account,
        ...customMetadata,
      },
    },
  });
}

async function convertAttestationToProfileId(
  profileId: ProfileId,
  service: AttestationService,
  account: string,
): Promise<void> {
  const foundProfileId = await user.getProfileIdByAttestation(service, account);

  if (profileId !== foundProfileId) {
    throw new Error('Profile ID does not match');
  }

  await prisma.xpPointsHistory.updateMany({
    where: {
      userkey: toUserKey({ service, account }),
      type: {
        in: [XpPointsHistoryItemType.CLAIM, XpPointsHistoryItemType.CLAIM_REFERRAL],
      },
    },
    data: {
      userkey: toUserKey({ profileId }),
    },
  });
}

async function convertProfileIdToAttestation(
  profileId: ProfileId,
  service: AttestationService,
  account: string,
): Promise<void> {
  const claims = await prisma.xpPointsHistory.findMany({
    where: {
      userkey: toUserKey({ profileId }),
      type: {
        in: [XpPointsHistoryItemType.CLAIM, XpPointsHistoryItemType.CLAIM_REFERRAL],
      },
    },
  });

  const claimsToUpdate = claims
    .filter(
      (c) =>
        typeof c.metadata === 'object' &&
        !Array.isArray(c.metadata) &&
        c.metadata?.service === service &&
        c.metadata?.account === account,
    )
    .map((c) => c.id);

  await prisma.xpPointsHistory.updateMany({
    where: {
      id: {
        in: claimsToUpdate,
      },
    },
    data: {
      userkey: toUserKey({ service, account }),
    },
  });
}

export const xpPointsHistory = {
  recordXpByAttestation,
  convertAttestationToProfileId,
  convertProfileIdToAttestation,
  getExistingCheckIn,
};
