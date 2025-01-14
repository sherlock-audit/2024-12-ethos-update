import { useDebouncedValue } from '@ethos/common-ui';
import { useCallback } from 'react';
import { useSellVotes, useMyVotes, useSimulateSellVotes } from '~/hooks/market.tsx';
import { ActionCancelledByUserError } from '~/hooks/transaction.tsx';

import { useTransactionForm } from '~/routes/market.$id/transaction-context.tsx';

export function useSellSubmit() {
  const { state, setState } = useTransactionForm();
  const { market } = state;

  const { data: myOwnedVotes, refetch: refetchMyVotes, error } = useMyVotes(market.profileId);

  const sell = useSellVotes();
  const simulation = useSellSimulation();
  const sellVotes = useCallback(async () => {
    setState({ transactionState: 'pending' });
    try {
      const sellAmount = simulation?.fundsReceived ?? 0n;
      const expectedPrice = Number(sellAmount) / state.sellAmount;
      const minimumVotePrice = Math.ceil(expectedPrice * (1 - state.slippagePercentage));

      await sell.mutateAsync({
        profileId: market.profileId,
        amount: Number(state.sellAmount),
        isPositive: state.voteType === 'trust',
        minimumVotePrice: BigInt(minimumVotePrice),
      });
      setState({ transactionState: 'success' });
      refetchMyVotes();
    } catch (error: unknown) {
      if (error instanceof ActionCancelledByUserError) {
        setState({ transactionState: 'initial' });

        return;
      }
      console.error(error);
      const message = error instanceof Error ? error.message : 'Something went wrong';
      setState({ transactionState: 'error', transactionError: message });
      throw error;
    }
  }, [
    market.profileId,
    refetchMyVotes,
    sell,
    setState,
    simulation?.fundsReceived,
    state.sellAmount,
    state.slippagePercentage,
    state.voteType,
  ]);

  return { sellVotes, myOwnedVotes, error };
}

export function useSellSimulation() {
  const { state } = useTransactionForm();
  const { market, voteType } = state;
  const debouncedSellAmount = useDebouncedValue(state.sellAmount, 500);

  const { data: simulation } = useSimulateSellVotes({
    profileId: market.profileId,
    voteType,
    votes: Number(debouncedSellAmount),
  });

  return simulation;
}
