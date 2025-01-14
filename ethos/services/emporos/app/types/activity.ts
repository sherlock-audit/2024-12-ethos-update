import { type ProfileId } from '@ethos/blockchain-manager';
import { type Market } from './markets.ts';
import { type MarketUser } from './user.ts';

export type MarketActivityProfile = {
  address: string;
  avatarUrl: string;
  name: string;
  ethosInfo: {
    profileId: ProfileId;
    score: number;
  };
};

export type MarketActivity = {
  txHash: string;
  votes: number;
  timestamp: number;
  eventId: number;
  type: 'BUY' | 'SELL';
  voteType: 'trust' | 'distrust';
  priceWei: bigint;
  user: MarketUser;
  market: Pick<Market, 'profileId' | 'avatarUrl' | 'name'>;
};

export type ProfileActivity = Omit<MarketActivity, 'user'> & {
  market: Market;
};
