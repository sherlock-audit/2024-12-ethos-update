import { type ProfileId } from '@ethos/blockchain-manager';
import { type Address } from 'viem';

/** The display information for a Market User */
export type MarketUser = {
  address: Address;
  avatarUrl: string;
  username: string;
  name: string;
  createdDate?: Date;
  ethosInfo: {
    profileId?: ProfileId;
    score: number;
  };
};
