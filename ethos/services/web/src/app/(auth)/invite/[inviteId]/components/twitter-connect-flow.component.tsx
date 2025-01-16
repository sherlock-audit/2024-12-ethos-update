import { css } from '@emotion/react';
import { usePrivy } from '@privy-io/react-auth';
import { Button, Flex, notification } from 'antd';
import Link from 'next/link';
import { zeroAddress } from 'viem';
import { LottieLoader } from 'components/loading-wrapper/lottie-loader.component';
import { tokenCssVars } from 'config/theme';
import { useCurrentUser } from 'contexts/current-user.context';
import { useConnectTwitter } from 'hooks/api/auth/attestation.hooks';
import { useEventsProcessSync } from 'hooks/api/echo.hooks';
import { useQueryAwaitDataUpdate } from 'hooks/useWaitForQueryDataUpdate';
import { useProfile } from 'hooks/user/lookup';
import { eventBus } from 'utils/event-bus';

type Props = {
  completeStep: () => void;
  skipStep: () => void;
};

const styles = {
  laterButton: css({
    color: tokenCssVars.colorPrimary,
  }),
};

export function TwitterConnectFlow({ completeStep, skipStep }: Props) {
  const eventsProcess = useEventsProcessSync();
  const { connectTwitter, isPending: isConnectTwitterPending } = useConnectTwitter({
    async onSuccess(tx) {
      await eventsProcess.mutateAsync({ txHash: tx.hash });

      eventBus.emit('ATTESTATIONS_UPDATED');
      completeStep();
      showConnectionSuccessMessage();
    },
  });
  const { user } = usePrivy();

  const { connectedAddress } = useCurrentUser();
  const connectedAddressProfileQuery = useProfile(
    { address: connectedAddress ?? zeroAddress },
    false,
  );
  const { data: connectedProfile } = useQueryAwaitDataUpdate(
    connectedAddressProfileQuery,
    (data) => data.id ?? 0,
    ['PROFILE_CREATED'],
    { pollingRetryCount: 30, pollingInterval: 3000 },
  );

  function showConnectionSuccessMessage() {
    if (!user?.twitter) return;

    notification.success({
      message: 'Successfully connected to x.com',
      description: (
        <Link href={`https://x.com/${user.twitter.username}`} target="_blank">
          {user.twitter.name} - @{user.twitter.username}
        </Link>
      ),
      placement: 'bottomLeft',
      duration: 30,
    });
  }

  if (!connectedProfile) {
    return (
      <Flex vertical gap={25} align="center">
        <LottieLoader />
        <div>Profile creation in progress...</div>

        <Button type="text" css={styles.laterButton} onClick={skipStep}>
          Later
        </Button>
      </Flex>
    );
  }

  return (
    <Flex vertical gap={25} align="center">
      <Button type="primary" onClick={connectTwitter} loading={isConnectTwitterPending}>
        Connect
      </Button>
      <Button type="text" css={styles.laterButton} onClick={skipStep}>
        Later
      </Button>
    </Flex>
  );
}
