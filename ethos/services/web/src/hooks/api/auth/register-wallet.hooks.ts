import { extractEchoErrorMessage } from '@ethos/echo-client';
import { useMutation } from '@tanstack/react-query';
import { App } from 'antd';
import { useEffect } from 'react';
import { useRegisterAddress } from '../blockchain-manager';
import { useGetSignatureForRegisterAddress } from '../echo.hooks';
import { useCurrentUser } from 'contexts/current-user.context';

const { useApp } = App;

/**
 * Currently works only for registering a smart wallet. It can be extended to
 * registering any wallet.
 */
export function useRegisterSmartWallet({
  onSuccess,
  onError,
}: { onSuccess?: () => void; onError?: () => void } = {}) {
  const { connectedProfile, smartWalletAddress } = useCurrentUser();
  const getSignatureForRegisterAddress = useGetSignatureForRegisterAddress();
  const registerAddress = useRegisterAddress();
  const { notification } = useApp();

  const registerSmartWallet = useMutation({
    async mutationFn() {
      // Narrow down types
      if (!connectedProfile || !smartWalletAddress) {
        return;
      }

      const { randValue, signature } = await getSignatureForRegisterAddress.mutateAsync();

      try {
        await registerAddress.mutateAsync({
          address: smartWalletAddress,
          profileId: connectedProfile.id,
          randValue,
          signature,
        });
      } catch {
        // Handled within mutation
      }
    },
    onSuccess,
    onError,
  });

  const { error } = registerSmartWallet;

  useEffect(() => {
    if (!error) return;

    notification.error({
      message: 'Failed to connect smart wallet',
      description: extractEchoErrorMessage(error),
    });
  }, [notification, error]);

  return registerSmartWallet;
}
