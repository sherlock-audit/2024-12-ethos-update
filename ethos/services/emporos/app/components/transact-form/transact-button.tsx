import { Button, Skeleton } from 'antd';
import { useAuthenticate } from '~/hooks/marketUser.tsx';
import { useTransactionForm } from '~/routes/market.$id/transaction-context.tsx';

export function TransactButton({
  onClick,
  label,
}: {
  onClick: React.MouseEventHandler<HTMLElement>;
  label: string;
}) {
  const { isReady, authenticated, login } = useAuthenticate();
  const { state } = useTransactionForm();

  if (!isReady) {
    return <Skeleton.Button className="w-full rounded-md" active size="large" />;
  }

  return (
    <Button
      type="primary"
      className="w-full"
      loading={state.transactionState === 'pending'}
      size="large"
      onClick={(e) => {
        if (state.transactionState === 'pending') {
          return;
        }
        if (authenticated) {
          onClick(e);
        } else {
          login();
        }
      }}
    >
      {authenticated ? label : 'Login'}
    </Button>
  );
}
