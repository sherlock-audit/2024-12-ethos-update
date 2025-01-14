import { type ActivityActor } from '@ethos/domain';
import { webUrlMap } from '@ethos/env';
import { shortenHash } from '@ethos/helpers';
import { type Address } from 'viem';
import { config } from '../../common/config.js';
import { type PrismaMarketInfo } from '../../data/market/market.data.js';

/**
 * @description A reputation market with the Ethos Profile information.
 */
export type MarketProfile = {
  marketProfileId: number;
  creatorAddress: string;
  positivePrice: string;
  negativePrice: string;
  trustVotes: number;
  distrustVotes: number;
  createdAt: Date;
  updatedAt: Date;
  basePrice: string;
  creationCost: string;
  profile: {
    primaryAddress: string;
    avatarUrl: string;
    ethosScore: number;
    name: string;
    twitterUsername: string | null;
  };
  stats: {
    marketCapWei: string;
    volumeTotalWei: string;
    volume24hWei: string;
    priceChange24hPercent: number;
  };
};

export function convertToMarketProfile(
  market: PrismaMarketInfo,
  actor: ActivityActor,
): MarketProfile {
  return {
    marketProfileId: market.profileId,
    creatorAddress: actor.primaryAddress,
    positivePrice: market.positivePrice,
    negativePrice: market.negativePrice,
    trustVotes: market.trustVotes,
    distrustVotes: market.distrustVotes,
    createdAt: market.createdAt,
    updatedAt: market.updatedAt,
    basePrice: market.basePrice,
    creationCost: market.creationCost,
    profile: {
      primaryAddress: actor.primaryAddress,
      avatarUrl: actor.avatar ?? fallbackAvatarUrl(actor.primaryAddress),
      ethosScore: actor.score,
      name: actor.name ?? actor.username ?? shortenHash(actor.primaryAddress),
      twitterUsername: actor.username ?? null,
    },
    stats: {
      marketCapWei: market.marketCapWei,
      volumeTotalWei: market.volumeTotalWei,
      volume24hWei: market.volume24hrWei,
      priceChange24hPercent: market.priceChange24hrPercent,
    },
  };
}

function fallbackAvatarUrl(address: Address): string {
  return new URL(`/avatar/blockie/${address}`, webUrlMap[config.ETHOS_ENV]).toString();
}
