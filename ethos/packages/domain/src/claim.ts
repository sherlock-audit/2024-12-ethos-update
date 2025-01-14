export const claimReferralId = {
  /**
   * Convert Twitter user ID to referral ID
   */
  encode(twitterUserId: string) {
    // Remove padding at the end such as == in asdfsdfsd==
    return btoa(twitterUserId).replace(/=*$/g, '');
  },
  /**
   * Extract Twitter user ID from referral ID
   */
  decode(referralId: string) {
    // Add padding back if needed
    const padding = '='.repeat((4 - (referralId.length % 4)) % 4);

    return atob(referralId + padding);
  },
};

export const REFERRAL_BONUS_PERCENTAGE = 0.2;
export const MAX_REFERRAL_USES = 10;

export const claimErrors = {
  accessDenied: 'access_denied',
  noUser: 'no_user',
  invalidReferrer: 'invalid_referrer',
  referralLimitReached: 'referral_limit_reached',
  failedToClaim: 'failed_to_claim',
  unknown: 'unknown',
} as const;

export type ClaimError = (typeof claimErrors)[keyof typeof claimErrors];
