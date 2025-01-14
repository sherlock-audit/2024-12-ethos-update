import { useCallback } from 'react';
import { useTransactionForm } from '~/routes/market.$id/transaction-context.tsx';
import { convertBalancePercentageToAmount } from '~/utils/amount.ts';

export function usePercentageToBuyAmount(
  balanceValue: bigint,
  onSuccess?: (amount: number) => void,
) {
  const { setState } = useTransactionForm();
  const convertPercentageToAmount = useCallback(
    (percentage: number) => {
      const newDisplayValue = convertBalancePercentageToAmount(balanceValue, percentage);
      setState({
        buyAmountEth: Number(newDisplayValue),
      });

      onSuccess?.(Number(newDisplayValue));
    },
    [balanceValue, setState, onSuccess],
  );

  return { convertPercentageToAmount };
}
