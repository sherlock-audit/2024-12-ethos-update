import { claimReferralId } from '@ethos/domain';
import { webUrlMap } from '@ethos/env';
import { getEnvironment } from 'config/environment';

/**
 * Get referral URL for a Twitter user ID
 */
export function getReferralUrl(twitterUserId: string) {
  return new URL(
    `/claim?referral=${claimReferralId.encode(twitterUserId)}`,
    webUrlMap[getEnvironment()],
  ).toString();
}
