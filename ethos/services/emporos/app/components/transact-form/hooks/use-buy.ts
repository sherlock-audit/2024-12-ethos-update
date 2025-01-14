import { formatNumber } from '@ethos/helpers';
import { useCallback, useMemo } from 'react';

import { parseEther } from 'viem';
import { useBlockchainManager } from '~/contexts/blockchain-manager.context.tsx';
import {
  useBuyFeePercentage,
  useBuyVotes,
  useSimulateBuyVotes,
  useVotePrice,
} from '~/hooks/market.tsx';
import { ActionCancelledByUserError } from '~/hooks/transaction.tsx';
import { useTransactionForm } from '~/routes/market.$id/transaction-context.tsx';

export function useBuySubmit() {
  const { state, setState } = useTransactionForm();
  const { voteType } = state;
  const simulation = useBuySimulation();
  const { blockchainManager } = useBlockchainManager();
  const { data: buyFees } = useBuyFeePercentage();

  const buy = useBuyVotes();

  const buyVotes = useCallback(async () => {
    if (!buyFees) {
      return;
    }
    setState({ transactionState: 'pending' });
    try {
      const { maxVotesToBuy, minVotesToBuy } =
        await blockchainManager.reputationMarket.calculateVotesToBuy(
          state.market.profileId,
          voteType,
          parseEther(state.buyAmountEth.toString()),
          state.slippagePercentage,
          buyFees,
        );
      await buy.mutateAsync({
        profileId: state.market.profileId,
        buyAmountWei: parseEther(state.buyAmountEth.toString()),
        isPositive: voteType === 'trust',
        minVotesToBuy,
        maxVotesToBuy,
      });
      setState({ transactionState: 'success' });
    } catch (error: unknown) {
      console.error('Error occurred during buy transaction:', error);

      if (error instanceof ActionCancelledByUserError) {
        setState({ transactionState: 'initial' });

        return;
      }
      const message = error instanceof Error ? error.message : 'Something went wrong';
      setState({
        transactionState: 'error',
        transactionError: message,
      });
    }
  }, [
    blockchainManager.reputationMarket,
    buy,
    buyFees,
    setState,
    state.buyAmountEth,
    state.market.profileId,
    state.slippagePercentage,
    voteType,
  ]);

  return { buyVotes, simulation };
}

function useBuySimulation() {
  const { state } = useTransactionForm();
  const { market, voteType } = state;
  const { data: buyFees } = useBuyFeePercentage();

  const { data: simulation } = useSimulateBuyVotes({
    profileId: market.profileId,
    voteType,
    buyAmountWei: parseEther(state.buyAmountEth.toString()),
    feePercentage: buyFees,
  });

  return simulation;
}

export function useBuySimulationImpact() {
  const { state } = useTransactionForm();
  const { market, voteType } = state;
  const { data: currentVotePrice, error: votePriceError } = useVotePrice(
    market.profileId,
    voteType,
  );

  const simulation = useBuySimulation();
  const simulationImpact = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    if (!simulation || simulation.error || votePriceError || !simulation.newPrice) {
      return null;
    }
    if (!currentVotePrice || currentVotePrice === 0n) {
      return null;
    }

    const percentModifier = voteType === 'trust' ? 100 : -100;
    // Practically speaking, base price will never be 0.
    // But we'll use 0.01 wei as a fallback due to the db having a default value of 0.
    const basePrice = Number(market.basePrice) || Number(parseEther('0.01', 'wei'));
    const percentageChange =
      (Number(simulation.newPrice - currentVotePrice) / basePrice) * percentModifier;

    return percentageChange;
  }, [simulation, votePriceError, currentVotePrice, voteType, market.basePrice]);

  return {
    impact: simulationImpact,
    trend: simulationImpact ? (simulationImpact > 0 ? ('up' as const) : ('down' as const)) : null,
    formattedImpact: simulationImpact
      ? `${formatNumber(simulationImpact, { maximumFractionDigits: 2 })}%`
      : '--',
    simulationError: simulation?.error,
  };
}
