export const featureGates = {
  isAdminPageEnabled: 'show_admin_page',
  showExpClaimPage: 'show_exp_claim_page',
  useSmartWalletForReview: 'use_smart_wallet_for_review',
  showSocialSlashing: 'show_social_slashing',
} as const;

/**
 * Add any feature gates to this list that should not be visible to end users prior to release.
 * For Example, the dev modal lists feature gates even in public testnet releases.
 */
export const sensitiveFeatureGates = new Set<(typeof featureGates)[keyof typeof featureGates]>([]);

export const dynamicConfigs = {
  activityCtaDefaultProfiles: 'activity_cta_default_profiles',
  profilesToReview: 'profiles_to_review',
  reactQueryCache: 'react-query-cache',
} as const;

export type DynamicConfigValues = (typeof dynamicConfigs)[keyof typeof dynamicConfigs];
