import { useCallback, useEffect, useState } from 'react';
import { WalletBalance } from '../components/balance.component.tsx';
import { TrustScoreSimulation } from '../components/transaction-simulation.tsx';
import { useBuySubmit } from '../hooks/use-buy.ts';
import { usePercentageToBuyAmount } from '../hooks/use-percentage-to-amount.ts';
import { useValidateBuyAmount } from '../hooks/use-validate-amount.ts';
import { isValidAmount } from './is-valid-amount.util.ts';
import { KeypadForm } from './keypad-form.component.tsx';
import { type InputKey } from './numeric-keypad.component.tsx';
import { useUserBalance } from '~/hooks/marketUser.tsx';
import { useTransactionForm } from '~/routes/market.$id/transaction-context.tsx';

export function MobileBuyForm() {
  const { setState, state } = useTransactionForm();
  const { buyVotes } = useBuySubmit();
  const [displayValue, setDisplayValue] = useState(state.buyAmountEth.toString());

  const balance = useUserBalance();
  const { validationError } = useValidateBuyAmount({
    balanceValue: balance.value,
  });

  function handleNumberInput(value: InputKey) {
    if (displayValue === '0' && value !== '.' && value !== 'delete') {
      setDisplayValue(value);

      return;
    }

    if (value === '.' && displayValue.includes('.')) {
      return;
    }
    if (value === 'delete') {
      setDisplayValue((prev) => prev.slice(0, -1) || '0');

      return;
    }

    const newValue = displayValue + value;

    if (isValidAmount(newValue)) {
      setDisplayValue(newValue);
    }
  }

  const onSuccess = useCallback((amount: number) => {
    setDisplayValue(amount.toString());
  }, []);

  const { convertPercentageToAmount } = usePercentageToBuyAmount(balance?.value ?? 0n, onSuccess);

  useEffect(() => {
    const number = Number(displayValue);

    if (!isNaN(number)) {
      setState({
        buyAmountEth: number,
      });
    }
  }, [displayValue, setState]);

  return (
    <KeypadForm
      disabled={state.transactionState !== 'initial'}
      handleNumberInput={handleNumberInput}
      handlePercentage={convertPercentageToAmount}
      onSubmit={buyVotes}
      validationError={validationError}
      value={displayValue}
      simulationInfo={<TrustScoreSimulation />}
      balanceInfo={<WalletBalance />}
    />
  );
}
