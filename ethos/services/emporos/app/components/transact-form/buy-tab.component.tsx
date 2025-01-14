import { Flex } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { WalletBalance } from './components/balance.component.tsx';
import { ConvenienceButtons } from './components/convenience-buttons.component.tsx';
import { ErrorMessage } from './components/error-message.component.tsx';
import { FeeInfo } from './components/fee-info.component.tsx';
import { TransactInput } from './components/transact-input.component.tsx';
import { TrustScoreSimulation } from './components/transaction-simulation.tsx';
import { useBuySubmit } from './hooks/use-buy.ts';
import { usePercentageToBuyAmount } from './hooks/use-percentage-to-amount.ts';
import { useValidateBuyAmount } from './hooks/use-validate-amount.ts';
import { TrustButtons } from './shared.components.tsx';
import { TransactButton } from './transact-button.tsx';
import { useUserBalance } from '~/hooks/marketUser.tsx';
import { useTransactionForm } from '~/routes/market.$id/transaction-context.tsx';

export function BuyTab() {
  const { state, setState } = useTransactionForm();
  const [displayValue, setDisplayValue] = useState(state.buyAmountEth.toString());
  const { buyVotes } = useBuySubmit();

  const balance = useUserBalance();

  const { validationError } = useValidateBuyAmount({
    balanceValue: balance.value,
  });

  const onSuccess = useCallback((amount: number) => {
    setDisplayValue(amount.toString());
  }, []);

  useEffect(() => {
    const number = Number(displayValue);

    if (!isNaN(number)) {
      setState({ buyAmountEth: number });
    }
  }, [displayValue, setState]);

  const { convertPercentageToAmount } = usePercentageToBuyAmount(balance.value, onSuccess);

  return (
    <Flex vertical gap={16}>
      <TrustButtons />
      <Flex vertical gap={8}>
        <WalletBalance className="bg-antd-colorBgLayout" />
        <Flex justify="center" align="center">
          <TransactInput
            value={displayValue}
            onChange={(value) => {
              setDisplayValue(value as string);
            }}
            type="number"
            min="0.001"
            step="0.001"
          />
        </Flex>
        <TrustScoreSimulation />
        <ErrorMessage errorMessage={validationError} />
      </Flex>
      <ConvenienceButtons
        handlePercentage={convertPercentageToAmount}
        containerClassName="justify-center gap-3"
        buttonClassName="rounded-md bg-antd-colorFillQuaternary text-antd-colorTextBase"
      />
      <Flex justify="center" align="center" gap={8} vertical>
        <TransactButton onClick={buyVotes} label={`Buy ${state.voteType}`} />
        <FeeInfo />
      </Flex>
    </Flex>
  );
}
