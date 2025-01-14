import { getApi } from '@ethos/helpers';
import {
  type IdentifierToProfileId,
  type ProfileIdToActivities,
  type ProfileIdToUserkey,
  type ReviewMap,
  type VouchMap,
} from './google-cloud-storage.types.js';

const request = getApi('https://storage.googleapis.com');

const SNAPSHOT_NAME = 'snapshot-2025-01-09';

async function getMigrationFile<T>(file: string): Promise<T> {
  const r = await request<T>(`/migrate-from-testnet/${SNAPSHOT_NAME}/${file}`);

  return r;
}

let identifierByProfileIdMap: IdentifierToProfileId = {};
let profileIdToUserkeyMap: ProfileIdToUserkey = {};
let reviewMap: ReviewMap = {};
let vouchMap: VouchMap = {};
let profileIdToActivities: ProfileIdToActivities = {};

async function getIdentifierByProfileIdMap(): Promise<void> {
  if (Object.keys(identifierByProfileIdMap).length) {
    return;
  }

  identifierByProfileIdMap = await getMigrationFile<IdentifierToProfileId>(
    'identifier-to-profile-id.json',
  );
}

async function getProfileIdToUserkeyMap(): Promise<void> {
  if (Object.keys(profileIdToUserkeyMap).length) {
    return;
  }

  profileIdToUserkeyMap = await getMigrationFile<ProfileIdToUserkey>('userkeys-by-profile-id.json');
}

async function getReviewMap(): Promise<void> {
  if (Object.keys(reviewMap).length) {
    return;
  }

  reviewMap = await getMigrationFile<ReviewMap>('reviews.json');
}

async function getVouchMap(): Promise<void> {
  if (Object.keys(vouchMap).length) {
    return;
  }

  vouchMap = await getMigrationFile<VouchMap>('vouches.json');
}

async function getProfileIdToActivities(): Promise<void> {
  if (Object.keys(profileIdToActivities).length) {
    return;
  }

  profileIdToActivities = await getMigrationFile<ProfileIdToActivities>(
    'activity-by-profile-id.json',
  );
}

async function getMigrationData(): Promise<{
  identifierByProfileIdMap: IdentifierToProfileId;
  profileIdToUserkeyMap: ProfileIdToUserkey;
  reviewMap: ReviewMap;
  vouchMap: VouchMap;
  profileIdToActivities: ProfileIdToActivities;
}> {
  await Promise.all([
    getIdentifierByProfileIdMap(),
    getProfileIdToUserkeyMap(),
    getReviewMap(),
    getVouchMap(),
    getProfileIdToActivities(),
  ]);

  return {
    identifierByProfileIdMap,
    profileIdToUserkeyMap,
    reviewMap,
    vouchMap,
    profileIdToActivities,
  };
}

export const gcpCloudStorageClient = {
  getMigrationData,
};
