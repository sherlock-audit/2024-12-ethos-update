export type ExtensionIdentity = {
  installationId: string;
  installDate: string;
  version: string;
};

export type DailyCheckIn = {
  twitterHandle: string;
  timestamp: number;
  installationId: string;
  signature: string;
};

// Storage key for chrome.storage.local
export const EXTENSION_IDENTITY_KEY = 'ethos_extension_identity';
