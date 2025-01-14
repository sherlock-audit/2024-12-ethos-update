import { duration, isValidAddress } from '@ethos/helpers';
import { useFetcher, useRouteLoaderData } from '@remix-run/react';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { getAddress, zeroAddress } from 'viem';
import { useConnectedWallet } from './marketUser.tsx';
import { useWithTxMutation } from './transaction.tsx';
import { useBlockchainManager } from '~/contexts/blockchain-manager.context.tsx';
import { type loader as holdingsBalanceLoader } from '~/routes/api.holdings-balance.ts';

import { type loader as rootLoader } from '~/routes/market.$id/route.tsx';

export function useMarket(profileId: number) {
  const { blockchainManager } = useBlockchainManager();

  return useQuery({
    queryKey: ['market', profileId],
    queryFn: async () => {
      return await blockchainManager.reputationMarket.getMarket(profileId);
    },
    enabled: Boolean(profileId),
    staleTime: 0,
  });
}

export function useMyVotes(profileId: number) {
  const { blockchainManager } = useBlockchainManager();
  const { wallet } = useConnectedWallet();

  return useQuery({
    queryKey: ['market-my-votes', profileId, wallet?.address],
    staleTime: 0,
    queryFn: async () => {
      if (!wallet?.address) return null;
      const votes = await blockchainManager.reputationMarket.getUserVotes(
        getAddress(wallet.address),
        profileId,
      );

      return {
        trustVotes: votes.trustVotes.toString(),
        distrustVotes: votes.distrustVotes.toString(),
      };
    },
    enabled: Boolean(wallet?.address),
  });
}

export function useVotePrice(profileId: number, voteType: 'trust' | 'distrust') {
  const { blockchainManager } = useBlockchainManager();

  return useQuery({
    queryKey: ['market-vote-price', profileId, voteType],
    staleTime: 0,
    queryFn: async () => {
      return await blockchainManager.reputationMarket.getVotePrice(profileId, voteType === 'trust');
    },
    enabled: profileId > 0,
  });
}

export function useBuyFeePercentage() {
  const { blockchainManager } = useBlockchainManager();

  return useQuery({
    queryKey: ['market-buy-fees'],
    staleTime: duration(7, 'days').toMilliseconds(),
    queryFn: async () => {
      return await blockchainManager.reputationMarket.getBuyFeePercentage();
    },
  });
}

export function useBuyVotes() {
  const { blockchainManager } = useBlockchainManager();

  return useWithTxMutation({
    mutationFn: async ({
      profileId,
      isPositive,
      buyAmountWei,
      minVotesToBuy,
      maxVotesToBuy,
    }: {
      profileId: number;
      buyAmountWei: bigint;
      isPositive: boolean;
      minVotesToBuy: number;
      maxVotesToBuy: number;
    }) => {
      return await blockchainManager.reputationMarket.buyVotes(
        profileId,
        buyAmountWei,
        isPositive,
        maxVotesToBuy,
        minVotesToBuy,
      );
    },
  });
}

export function useSellVotes() {
  const { blockchainManager } = useBlockchainManager();

  return useWithTxMutation({
    mutationFn: async ({
      profileId,
      isPositive,
      amount,
      minimumVotePrice,
    }: {
      profileId: number;
      isPositive: boolean;
      amount: number;
      minimumVotePrice: bigint;
    }) => {
      return await blockchainManager.reputationMarket.sellVotes(
        profileId,
        isPositive,
        amount,
        minimumVotePrice,
      );
    },
  });
}

export function useSimulateBuyVotes({
  profileId,
  voteType,
  buyAmountWei,
  feePercentage,
  onError,
}: {
  profileId: number;
  voteType: 'trust' | 'distrust';
  buyAmountWei: bigint;
  feePercentage?: number;
  onError?: (error: string) => void;
}) {
  const { blockchainManager } = useBlockchainManager();

  return useQuery({
    queryKey: ['simulate-buy-votes', profileId, voteType, buyAmountWei.toString()],
    // Never cache the simulations.
    staleTime: 0,
    queryFn: async () => {
      const { maxVotesToBuy: votesToBuy } =
        await blockchainManager.reputationMarket.calculateVotesToBuy(
          profileId,
          voteType,
          buyAmountWei,
          1,
          feePercentage ?? 0,
        );
      try {
        const isPositive = voteType === 'trust';
        const { newVotePrice } = await blockchainManager.reputationMarket.simulateBuy(
          profileId,
          isPositive,
          votesToBuy,
        );

        return {
          newPrice: newVotePrice,
          votes: votesToBuy,
        };
      } catch (error) {
        console.error(error);

        if (error instanceof Error) {
          onError?.(error.message);

          return { error: error.message };
        }

        onError?.('Unexpected error');

        return { error: 'Unexpected error' };
      }
    },

    enabled: profileId > 0 && buyAmountWei > 0n && feePercentage !== undefined,
  });
}

export function useSimulateSellVotes({
  profileId,
  voteType,
  votes,
  onError,
}: {
  profileId: number;
  voteType: 'trust' | 'distrust';
  votes: number;
  onError?: (error: string) => void;
}) {
  const { wallet } = useConnectedWallet();
  const { blockchainManager } = useBlockchainManager();

  return useQuery({
    queryKey: ['simulate-sell-votes', profileId, voteType, votes],
    // Never cache the simulations.
    staleTime: 0,
    queryFn: async () => {
      try {
        const isPositive = voteType === 'trust';
        const { proceedsAfterFees, newVotePrice } =
          await blockchainManager.reputationMarket.simulateSell(
            profileId,
            isPositive,
            votes,
            getAddress(wallet?.address ?? zeroAddress),
          );

        return {
          newVotePrice,
          fundsReceived: proceedsAfterFees,
        };
      } catch (error) {
        if (error instanceof Error) {
          onError?.(error.message);

          return { error: error.message };
        }

        onError?.('Unexpected error');

        return { error: 'Unexpected error' };
      }
    },

    enabled: profileId > 0 && votes > 0 && Boolean(wallet?.address),
  });
}

export function useRouteMarketInfo() {
  const rootData = useRouteLoaderData<typeof rootLoader>('routes/market.$id');

  if (!rootData?.market) {
    throw new Error('No market found in root loader.');
  }

  return rootData.market;
}

export function useHoldingsBalanceByAddress(address: string | undefined) {
  const fetcher = useFetcher<typeof holdingsBalanceLoader>();

  useEffect(() => {
    if (!isValidAddress(address)) {
      return;
    }

    if (address && fetcher.state === 'idle' && !fetcher.data) {
      fetcher.load(`/api/holdings-balance?address=${address}`);
    }
  }, [address, fetcher]);

  return fetcher.data;
}
