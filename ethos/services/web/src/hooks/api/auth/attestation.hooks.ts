import { X_SERVICE } from '@ethos/domain';
import { extractEchoErrorMessage } from '@ethos/echo-client';
import { usePrivy } from '@privy-io/react-auth';
import { App } from 'antd';
import { type ContractTransactionResponse } from 'ethers';
import { useCallback, useEffect } from 'react';
import { useCreateAttestation } from '../blockchain-manager';
import { useGetSignatureForCreateAttestation } from '../echo.hooks';
import { useCurrentUser } from 'contexts/current-user.context';
import { useLinkTwitter } from 'hooks/user/privy.hooks';

const { useApp } = App;

export function useConnectTwitter({
  onSuccess,
}: { onSuccess?: (tx: ContractTransactionResponse) => void } = {}) {
  const { connectedAddress, connectedProfile, isReady, isConnected } = useCurrentUser();
  const { user } = usePrivy();
  const getSignatureForCreateAttestation = useGetSignatureForCreateAttestation();
  const createAttestation = useCreateAttestation();
  const { notification } = useApp();

  const createAttestationFlow = useCallback(async () => {
    if (!connectedAddress || !connectedProfile) {
      throw new Error('No connected address or profile');
    }

    const data = await getSignatureForCreateAttestation.mutateAsync({
      service: X_SERVICE,
      connectedAddress,
    });

    const result = await createAttestation.mutateAsync({
      profileId: connectedProfile.id,
      service: X_SERVICE,
      ...data,
    });

    if (onSuccess) {
      onSuccess(result);
    }
  }, [
    connectedAddress,
    connectedProfile,
    createAttestation,
    getSignatureForCreateAttestation,
    onSuccess,
  ]);

  const linkTwitter = useLinkTwitter({
    async onSuccess() {
      // Once the user is connected to Twitter, proceed with the attestation flow
      createAttestationFlow();
    },
  });

  const { error } = getSignatureForCreateAttestation;

  useEffect(() => {
    if (!error) return;

    notification.error({
      message: 'Failed to connect social',
      description: extractEchoErrorMessage(error),
    });
  }, [notification, error]);

  return {
    connectTwitter: () => {
      // Proceed with the attestation flow if the user is already connected to Twitter
      if (user?.twitter) {
        createAttestationFlow();
      } else {
        linkTwitter.mutate();
      }
    },
    isPending:
      !isReady ||
      !isConnected ||
      linkTwitter.isPending ||
      getSignatureForCreateAttestation.isPending ||
      createAttestation.isPending,
  };
}
