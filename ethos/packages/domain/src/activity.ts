import {
  type Attestation,
  type Profile,
  type ProfileId,
  type Review,
  type Vouch,
  type VouchFunds,
} from '@ethos/blockchain-manager';
import { JsonHelper } from '@ethos/helpers';
import { type Address } from 'viem';
import { z } from 'zod';
import { type BlockchainEvent } from './blockchain-event.js';
import { type ReplySummary } from './reply.js';
import { type Relationship } from './transaction.js';

export const BASE_REVIEW_XP_GAIN = 5;
export const INVITE_ACCEPTED_XP_GAIN = 25_000;
export const BASE_VOUCH_DAY_XP_GAIN = 500;

export const attestationActivity = 'attestation';
export const invitationAcceptedActivity = 'invitation-accepted';
export const reviewActivity = 'review';
export const vouchActivity = 'vouch';
export const unvouchActivity = 'unvouch';

export const activities = [
  attestationActivity,
  invitationAcceptedActivity,
  reviewActivity,
  vouchActivity,
  unvouchActivity,
] as const;

export type ActivityType = (typeof activities)[number];

type ActivityInfoBase<T extends ActivityType, D extends Record<string, any>> = {
  type: T;
  data: D;
  timestamp: number;
  votes: VoteInfo;
  replySummary: ReplySummary;
  author: ActivityActor;
  subject: ActivityActor;
  events: BlockchainEvent[];
};

export type AttestationActivityInfo = ActivityInfoBase<
  'attestation',
  Attestation & {
    username: string;
  }
>;
export type InvitationAcceptedActivityInfo = ActivityInfoBase<'invitation-accepted', Profile>;
export type ReviewActivityInfo = ActivityInfoBase<'review', Review>;
export type VouchActivityInfo = ActivityInfoBase<'vouch', Vouch & VouchFunds>;
export type UnvouchActivityInfo = ActivityInfoBase<'unvouch', Vouch & VouchFunds>;

export type ActivityInfo =
  | AttestationActivityInfo
  | InvitationAcceptedActivityInfo
  | ReviewActivityInfo
  | VouchActivityInfo
  | UnvouchActivityInfo;

export type ActivityActor = {
  userkey: string;
  profileId?: ProfileId;
  name: string | null;
  username?: string | null;
  avatar: string | null;
  description: string | null;
  score: number;
  scoreXpMultiplier: number;
  primaryAddress: Address;
};

export type ActivityActorWithXp = ActivityActor & {
  totalXp: number;
};

export type RecentInteractionActivityActor = ActivityActor & {
  interaction: Relationship | undefined;
};

export type VoteInfo = {
  upvotes: number;
  downvotes: number;
};

// Parse activity metadata
const reviewMetadataSchema = {
  description: z.string().optional(),
  source: z.string().optional(),
  importedFromTestnet: z.number().int().nonnegative().optional(),
};

const vouchMetadataSchema = {
  description: z.string().optional(),
  source: z.string().optional(),
  importedFromTestnet: z.number().int().nonnegative().optional(),
};

export type ReviewMetadata = z.infer<z.ZodObject<typeof reviewMetadataSchema>>;
export type VouchMetadata = z.infer<z.ZodObject<typeof vouchMetadataSchema>>;

export function parseReviewMetadata(rawMetadata?: string): ReviewMetadata {
  const data = JsonHelper.parseSafe<ReviewMetadata>(rawMetadata ?? null, {
    zodSchema: reviewMetadataSchema,
  });

  return data ?? {};
}

export function parseVouchMetadata(rawMetadata?: string): VouchMetadata {
  const data = JsonHelper.parseSafe<VouchMetadata>(rawMetadata ?? null, {
    zodSchema: vouchMetadataSchema,
  });

  return data ?? {};
}
