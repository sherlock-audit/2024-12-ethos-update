import { type ProfileId } from '@ethos/blockchain-manager';
import { type echoClient } from '@ethos/echo-client';
import { type MarketPriceHistory } from './charts.ts';
import { type MarketUser } from './user.ts';

export type Market = {
  avatarUrl: string;
  ethosScore?: number;
  profileId: ProfileId;
  name: string;
  twitterUsername: string | null;
  address: string | null;
  createdAt: Date;
  trustPercentage: number;
  stats: MarketStats;
  basePrice: bigint;
};

export type MarketStats = {
  volumeTotalUsd: number;
  volume24hUsd: number;
  priceChange24hPercent: number;
  marketCapUsd: number;
  marketCapWei: bigint;
  trustVotes: number;
  distrustVotes: number;
  trustPrice: bigint;
  distrustPrice: bigint;
};

type MarketHolder = Awaited<ReturnType<typeof echoClient.markets.holders>>['all'][number];

export type MarketVolume = {
  market: Pick<Market, 'profileId' | 'name' | 'avatarUrl' | 'ethosScore'>;
  trustPercentage: number;
  volumeUsd: number;
};

export type MarketHoldersInfo = MarketHolder & {
  user: MarketUser;
};

export type TrendingMarket = {
  market: Market;
  highlightedTweet: Awaited<ReturnType<typeof echoClient.markets.news>>[number]['tweet'];
  priceHistoryData: MarketPriceHistory;
};

export type EthosProfileStats = {
  vouchedAmountInEthFormatted: string | null;
  vouchedAmountInUsdFormatted: string | null;
  positiveReviewPercentage: number;
  receivedReviewsCount: number;
};
