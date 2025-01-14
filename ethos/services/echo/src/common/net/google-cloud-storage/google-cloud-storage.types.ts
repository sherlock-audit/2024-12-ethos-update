import { type ProfileId } from '@ethos/blockchain-manager';

/**
 * @example { "0x123": 1, "ethos_network": 2 }
 */
export type IdentifierToProfileId = Record<string, ProfileId>;

/**
 * @example { 1: ["address:0x123"], 2: ["service:x.com:123", "address:0x987"] }
 */
export type ProfileIdToUserkey = Record<ProfileId, string[]>;

export type ReviewMap = Record<
  number,
  {
    id: number;
    authorProfileId: ProfileId;
    subjectUserkey: string;
    score: number;
    comment: string;
    metadata: string;
    createdAt: string;
  }
>;

export type VouchMap = Record<
  number,
  {
    id: number;
    authorProfileId: ProfileId;
    subjectProfileId: ProfileId;
    deposited: number;
    comment: string;
    metadata: string;
    vouchedAt: string;
  }
>;

export type ProfileIdToActivities = Record<
  ProfileId,
  Array<{ type: 'review' | 'vouch'; id: number; ts: number }>
>;
