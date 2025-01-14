import { toNumber } from '@ethos/helpers';
import { Flex } from 'antd';
import { VoteBalance } from './components/balance.component.tsx';
import { ConvenienceButtons } from './components/convenience-buttons.component.tsx';
import { ErrorMessage } from './components/error-message.component.tsx';
import { FeeInfo } from './components/fee-info.component.tsx';
import { TransactInput } from './components/transact-input.component.tsx';
import { SellPriceSimulation } from './components/transaction-simulation.tsx';
import { useSellSubmit } from './hooks/use-sell.ts';
import { useValidateSellAmount } from './hooks/use-validate-amount.ts';
import { TrustButtons } from './shared.components.tsx';
import { TransactButton } from './transact-button.tsx';
import { useTransactionForm } from '~/routes/market.$id/transaction-context.tsx';

export function SellTab() {
  const { state, setState } = useTransactionForm();

  const { sellVotes, myOwnedVotes } = useSellSubmit();
  const votesToSell = toNumber(
    state.voteType === 'trust' ? myOwnedVotes?.trustVotes : myOwnedVotes?.distrustVotes,
  );
  const { validationError } = useValidateSellAmount({ votesToSell });

  function handlePercentage(percentage: number) {
    const amount = Math.floor((votesToSell * percentage) / 100);
    setState({ sellAmount: amount });
  }

  return (
    <Flex vertical gap={16}>
      <TrustButtons />
      <Flex vertical gap={8}>
        <VoteBalance className="bg-antd-colorBgLayout" />
        <TransactInput
          value={state.sellAmount.toString()}
          onChange={(value) => {
            setState({ sellAmount: Number(value) });
          }}
          type="number"
          min={0}
          step={1}
        />
        <SellPriceSimulation />
        <ErrorMessage errorMessage={validationError} />
      </Flex>
      <ConvenienceButtons
        handlePercentage={handlePercentage}
        containerClassName="justify-center gap-3"
        buttonClassName="rounded-md bg-antd-colorFillQuaternary text-antd-colorTextBase"
      />
      <Flex justify="center" align="center" gap={8} vertical>
        <TransactButton onClick={sellVotes} label={`Sell ${state.voteType}`} />
        <FeeInfo />
      </Flex>
    </Flex>
  );
}
