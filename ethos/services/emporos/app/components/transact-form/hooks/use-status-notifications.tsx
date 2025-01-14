import { App } from 'antd';
import { useEffect } from 'react';
import { useTransactionForm } from '~/routes/market.$id/transaction-context.tsx';

const PENDING_MESSAGE_KEY = 'pending';

export function useTransactionStatusNotifications() {
  const { state, setState } = useTransactionForm();
  const { notification, message } = App.useApp();

  useEffect(() => {
    if (state.transactionState === 'pending') {
      message.open({
        key: PENDING_MESSAGE_KEY,
        type: 'loading',
        duration: 0,
        content: 'Transaction pending',
      });
    }
    if (state.transactionState === 'success') {
      message.destroy(PENDING_MESSAGE_KEY);
      message.success({
        content: `Success! ${state.action === 'buy' ? `${state.buyAmountEth}e` : state.sellAmount} ${state.voteType} ${state.action === 'buy' ? 'bought' : 'sold'}`,
      });
      setState({ transactionState: 'initial', isTransactDrawerOpen: false });
    }

    if (state.transactionState === 'error') {
      message.destroy(PENDING_MESSAGE_KEY);
      notification.error({
        message: 'Transaction error',
        placement: 'bottomLeft',
        description: state.transactionError,
      });
      setState({ transactionState: 'initial', transactionError: null });
    }
  }, [
    message,
    notification,
    setState,
    state.action,
    state.buyAmountEth,
    state.sellAmount,
    state.transactionError,
    state.transactionState,
    state.voteType,
  ]);

  return state.transactionState;
}
