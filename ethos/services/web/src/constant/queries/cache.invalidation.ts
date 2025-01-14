import { type EthosUserTarget } from '@ethos/domain';
import { type QueryKey, type QueryClient } from '@tanstack/react-query';
import { INVALIDATE_ALL, type InvalidateAllOption } from './key.generator';
import { cacheKeys } from './queries.constant';

export type Keys = QueryKey;

/**
 * Invalidates the tanstack query cache for the given keys.
 *
 * @param queryClient - The QueryClient instance to invalidate queries on.
 * @param keys - An array of query key arrays to invalidate (get from cacheKeys)
 *
 * This function performs the following steps:
 * 1. Waits for 75 seconds to allow the database to pull new values.
 * 2. Invalidates all queries matching the provided keys.
 *
 * Note: The invalidation process runs asynchronously in the background.
 * Don't `await` this function.
 */
export async function invalidate(queryClient: QueryClient, keys: Keys[]) {
  // Invalidate queries asynchronously
  Promise.all(
    keys.map(async (key) => {
      await queryClient.invalidateQueries({
        queryKey: key,
        refetchType: 'all',
      });

      await queryClient.refetchQueries({
        queryKey: key,
      });
    }),
  );
}

function reviewChange(author: EthosUserTarget, subject: EthosUserTarget | InvalidateAllOption) {
  const keys: Keys[] = [
    cacheKeys.review.bySubject(subject),
    cacheKeys.review.byAuthor(author),
    cacheKeys.review.stats.byTarget(subject),
    cacheKeys.review.stats.byTarget(author),
    cacheKeys.score.byTarget(INVALIDATE_ALL),
    cacheKeys.activities.unifiedInfinite(INVALIDATE_ALL),
  ];

  return keys;
}

function vouchChange(
  author: EthosUserTarget,
  subject: EthosUserTarget | InvalidateAllOption,
  id?: number,
) {
  const keys: Keys[] = [
    cacheKeys.vouch.byAuthor(author),
    cacheKeys.vouch.bySubject(subject),
    cacheKeys.vouch.stats.byTarget(subject),
    cacheKeys.vouch.stats.byTarget(author),
    cacheKeys.score.byTarget(INVALIDATE_ALL),
    cacheKeys.activities.unifiedInfinite(INVALIDATE_ALL),
  ];

  if (id) {
    keys.push(cacheKeys.vouch.byId(id));
  }

  return keys;
}

function profileChange(target: EthosUserTarget | InvalidateAllOption) {
  const keys: Keys[] = [cacheKeys.profile.byTarget(target)];

  if ('address' in target) {
    keys.push(cacheKeys.profile.byAddress(target.address));
  }
  if ('profileId' in target) {
    keys.push(cacheKeys.profile.byProfileId(target.profileId));
  }

  return keys;
}

function invitationChange(target: EthosUserTarget | InvalidateAllOption) {
  const keys: Keys[] = [cacheKeys.invitation.byTarget(target)];

  if ('address' in target) {
    keys.push(cacheKeys.invitation.bySubject(target));
  }

  return keys;
}

function scoreChange(target: EthosUserTarget) {
  const keys: Keys[] = [cacheKeys.score.byTarget(target)];

  return keys;
}

function attestationChange(target: EthosUserTarget) {
  const keys: Keys[] = [
    cacheKeys.attestation.byTarget(target),
    cacheKeys.attestation.extendedByTarget(target),
    cacheKeys.score.byTarget(target),
    cacheKeys.name.byTarget(target),
    cacheKeys.avatar.byTarget(target),
    cacheKeys.description.byTarget(target),
    cacheKeys.activities.unifiedInfinite(INVALIDATE_ALL),
    cacheKeys.activities.actor(target),
  ];

  return keys;
}

function voteChange() {
  const keys: Keys[] = [
    cacheKeys.activities.votes,
    cacheKeys.activities.unifiedInfinite(INVALIDATE_ALL),
  ];

  return keys;
}

function profileAddressesChange(target: EthosUserTarget) {
  const keys: Keys[] = [cacheKeys.profile.addresses.byTarget(target)];

  return keys;
}

export const cacheKeysFor = {
  ReviewChange: reviewChange,
  VouchChange: vouchChange,
  ScoreChange: scoreChange,
  ProfileChange: profileChange,
  InvitationChange: invitationChange,
  AttestationChange: attestationChange,
  VoteChange: voteChange,
  ProfileAddressesChange: profileAddressesChange,
};
