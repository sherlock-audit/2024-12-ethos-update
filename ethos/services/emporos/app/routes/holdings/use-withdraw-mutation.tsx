import {
  usePrivy,
  type SendTransactionModalUIOptions,
  type UnsignedTransactionRequest,
} from '@privy-io/react-auth';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const UI_OPTIONS: SendTransactionModalUIOptions = {
  showWalletUIs: true,
  buttonText: 'Withdraw',
  header: 'Withdraw',
  description: 'Withdraw your holdings to your wallet',
  successDescription: 'Withdrawal successful',
};

export function useWithdrawMutation({ onSuccess }: { onSuccess: () => void }) {
  const { sendTransaction } = usePrivy();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestData: UnsignedTransactionRequest) => {
      const tx = await sendTransaction(requestData, UI_OPTIONS);

      return { hash: tx.transactionHash };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      onSuccess();
    },
  });
}
