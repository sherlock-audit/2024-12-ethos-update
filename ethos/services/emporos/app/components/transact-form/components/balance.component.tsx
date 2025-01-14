import { toNumber } from '@ethos/helpers';
import { Flex, Typography } from 'antd';
import { useSellSubmit } from '../hooks/use-sell.ts';
import { EthereumIcon } from '~/components/icons/ethereum.tsx';
import { HowToVoteIcon } from '~/components/icons/how-to-vote.tsx';
import { useUserBalance } from '~/hooks/marketUser.tsx';
import { useTransactionForm } from '~/routes/market.$id/transaction-context.tsx';
import { cn } from '~/utils/cn.ts';

function Balance({
  balanceIcon,
  balance,
  className,
}: {
  balanceIcon: React.ReactNode;
  balance: string;
  className?: string;
}) {
  return (
    <Flex
      gap={4}
      align="center"
      justify="center"
      className={cn(
        'px-4 py-2 bg-antd-colorBgLayout text-antd-colorTextBase rounded-100 w-fit mx-auto',
        className,
      )}
    >
      <span className="text-base/none">{balanceIcon}</span>
      <Typography.Text className="text-sm/none">{`Balance: ${balance}`}</Typography.Text>
    </Flex>
  );
}

export function WalletBalance({ className }: { className?: string }) {
  const balance = useUserBalance();

  return (
    <Balance
      className={className}
      balanceIcon={<EthereumIcon />}
      balance={balance.formattedValue}
    />
  );
}

export function VoteBalance({ className }: { className?: string }) {
  const { myOwnedVotes } = useSellSubmit();
  const { state } = useTransactionForm();
  const votesToSell = toNumber(
    state.voteType === 'trust' ? myOwnedVotes?.trustVotes : myOwnedVotes?.distrustVotes,
  );

  return (
    <Balance
      className={className}
      balanceIcon={<HowToVoteIcon />}
      balance={`${votesToSell} votes`}
    />
  );
}
