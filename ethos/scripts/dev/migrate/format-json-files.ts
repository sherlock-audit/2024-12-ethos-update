/* eslint-disable no-console */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';

const INPUT_PATH = './.cache/migrate-input';
const OUTPUT_PATH = './.cache/migrate-output';

const IDENTIFIER_TO_PROFILE_ID_FILE = 'identifier-to-profile-id';
const USERKEY_BY_PROFILE_ID_FILE = 'userkey-by-profile-id';
const REVIEWS_FILE = 'reviews';
const VOUCHES_FILE = 'vouches';

console.log('⏳ Parsing the following JSONL files:\n');
console.log(
  [IDENTIFIER_TO_PROFILE_ID_FILE, USERKEY_BY_PROFILE_ID_FILE, REVIEWS_FILE, VOUCHES_FILE]
    .map((file) => `${INPUT_PATH}/${file}.jsonl`)
    .join('\n'),
);

// Make sure the output directory exists
if (!existsSync(OUTPUT_PATH)) {
  mkdirSync(OUTPUT_PATH, { recursive: true });
}

// Parse JSONL file into an array of parsed objects
function formatJsonl<T>(filename: string): T[] {
  const content = readFileSync(`${INPUT_PATH}/${filename}.jsonl`, 'utf8');
  const lines = content.trim().split('\n');

  return lines.map((line) => JSON.parse(line));
}

const activityByProfileId = new Map<
  number,
  Array<{ type: 'review' | 'vouch'; id: number; ts: number }>
>();

function addActivity(
  profileId: number,
  activity: 'review' | 'vouch',
  id: number,
  ts: number,
): void {
  const profileActivity = activityByProfileId.get(profileId) ?? [];

  profileActivity.push({ type: activity, id, ts });
  activityByProfileId.set(profileId, profileActivity);
}

// Normalized address/username to profile ID
const userIdentifierByProfileIdMap = new Map<string, number>();
const identifierToProfile = formatJsonl<{ profileId: number; identifier: string }>(
  IDENTIFIER_TO_PROFILE_ID_FILE,
);

for (const { identifier, profileId } of identifierToProfile) {
  userIdentifierByProfileIdMap.set(identifier.toLocaleLowerCase(), profileId);
}

writeFileSync(
  `${OUTPUT_PATH}/identifier-to-profile-id.json`,
  JSON.stringify(Object.fromEntries(userIdentifierByProfileIdMap.entries())),
);

// Normalize profileId to userkeys
const userkeysByProfileIdMap = new Map<number, string[]>();
const userkeyByProfileId = formatJsonl<{ profileId: number; userkey: string }>(
  USERKEY_BY_PROFILE_ID_FILE,
);

for (const { profileId, userkey } of userkeyByProfileId) {
  const existingUserkeys = userkeysByProfileIdMap.get(profileId) ?? [];

  userkeysByProfileIdMap.set(profileId, [...existingUserkeys, userkey]);
}

writeFileSync(
  `${OUTPUT_PATH}/userkeys-by-profile-id.json`,
  JSON.stringify(Object.fromEntries(userkeysByProfileIdMap.entries())),
);

// Normalize reviews
type Review = {
  id: number;
  authorProfileId: number;
  subjectUserkey: string;
  score: number;
  comment: string;
  metadata: string;
  createdAt: string;
};

const reviewsMap = new Map<number, Review>();
const reviews = formatJsonl<Review>(REVIEWS_FILE);

for (const review of reviews) {
  reviewsMap.set(review.id, review);
  addActivity(review.authorProfileId, 'review', review.id, new Date(review.createdAt).valueOf());
}

writeFileSync(
  `${OUTPUT_PATH}/reviews.json`,
  JSON.stringify(Object.fromEntries(reviewsMap.entries())),
);

// Normalize vouches
type Vouch = {
  id: number;
  authorProfileId: number;
  subjectProfileId: number;
  deposited: number;
  comment: string;
  metadata: string;
  vouchedAt: string;
};

const vouchesMap = new Map<number, Vouch>();
const vouches = formatJsonl<Vouch>(VOUCHES_FILE);

for (const vouch of vouches) {
  vouchesMap.set(vouch.id, vouch);
  addActivity(vouch.authorProfileId, 'vouch', vouch.id, new Date(vouch.vouchedAt).valueOf());
}

writeFileSync(
  `${OUTPUT_PATH}/vouches.json`,
  JSON.stringify(Object.fromEntries(vouchesMap.entries())),
);

// Store the activity by profile ID
for (const activityMap of activityByProfileId.keys()) {
  const activity = activityByProfileId.get(activityMap);

  // Type guard
  if (!activity) {
    throw new Error(`Activity not found for profile ID: ${activityMap}`);
  }

  const sortedActivities = [...activity].sort((a, b) => b.ts - a.ts);

  activityByProfileId.set(activityMap, sortedActivities);
}

writeFileSync(
  `${OUTPUT_PATH}/activity-by-profile-id.json`,
  JSON.stringify(Object.fromEntries(activityByProfileId.entries())),
);

const outputFiles = readdirSync(OUTPUT_PATH);

console.log('\n✅ Successfully formatted the following files:\n');
console.log(outputFiles.map((file) => `${OUTPUT_PATH}/${file}`).join('\n'));
