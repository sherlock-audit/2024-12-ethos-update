import { css } from '@emotion/react';
import { isAddressEqualSafe, shortenHash } from '@ethos/helpers';
import { Alert, Button, Flex, theme, Typography } from 'antd';
import Link from 'next/link';
import { type ReactNode, useState } from 'react';
import { type Address, zeroAddress } from 'viem';
import { useAccount } from 'wagmi';
import { LottieLoader } from 'components/loading-wrapper/lottie-loader.component';
import { useCurrentUser } from 'contexts/current-user.context';
import { useSkipOnboardingSteps } from 'hooks/use-skip-onboarding-steps';
import { usePendingInvitationsBySubject } from 'hooks/user/lookup';
import { useLoginEthosUser, useLogoutEthosUser } from 'hooks/user/privy.hooks';
import { routeTo } from 'utils/routing';

type Props = {
  inviteeAddress: Address;
  startOnboarding: () => void;
};

export function WelcomeAction({ inviteeAddress, startOnboarding }: Props) {
  const { token } = theme.useToken();
  const [showConnectSuccessMessage, setShowConnectSuccessMessage] = useState(false);
  const { showSkipOnboarding } = useSkipOnboardingSteps();
  const { connectedAddress, isReady, status, connectedProfile, isConnectedProfileLoading } =
    useCurrentUser();
  const { chain } = useAccount();
  const login = useLoginEthosUser(() => {
    setShowConnectSuccessMessage(true);
  });

  const isWrongNetwork = status === 'connected' && !chain;

  const { data: pendingInvitationsList, isLoading: pendingInvitationsLoading } =
    usePendingInvitationsBySubject({
      address: connectedAddress ?? zeroAddress,
    });

  if (!isReady || isConnectedProfileLoading || pendingInvitationsLoading) {
    return <LottieLoader />;
  }

  /**
   * User doesn't have a wallet connected or is on the wrong network
   */
  if (!connectedAddress || isWrongNetwork) {
    return (
      <Button type="primary" onClick={login}>
        Connect wallet
      </Button>
    );
  }

  /**
   * Invitation is for a specific address and the connected address doesn't match that one
   */
  if (
    !isAddressEqualSafe(inviteeAddress, zeroAddress) &&
    !isAddressEqualSafe(connectedAddress, inviteeAddress)
  ) {
    // Only show the wrong address if the invitation is for a specific address
    return (
      <InvitationErrorMessage
        title={
          <Typography.Text
            css={{
              fontSize: token.fontSizeLG,
              lineHeight: '1.5',
            }}
          >
            This invitation is for another wallet{' '}
            <Typography.Text
              code
              copyable
              css={css`
                font-size: inherit;
                margin: 0;

                & code {
                  margin: 0;
                }
              `}
            >
              {inviteeAddress}
            </Typography.Text>
          </Typography.Text>
        }
        description="In order to accept this invitation, connect with that address."
      />
    );
  }

  /**
   * User already has a profile, display a link to redirect to it
   */
  if (connectedProfile) {
    return (
      <>
        <Link href={routeTo({ address: connectedAddress }).profile}>
          <Button type="primary">Go to your profile</Button>
        </Link>
        {showSkipOnboarding && (
          <Flex
            justify="center"
            css={css`
              position: absolute;
              bottom: 30px;
              width: 100%;
              left: 0;
            `}
          >
            <Button
              type="primary"
              danger
              onClick={() => {
                startOnboarding();
              }}
            >
              Skip step
            </Button>
          </Flex>
        )}
      </>
    );
  }

  /**
   * No Invitation generic or specific found
   * Either no invitation was ever sent or it was sent and revoked
   */
  if (!pendingInvitationsList?.length && !pendingInvitationsLoading) {
    return (
      <InvitationErrorMessage
        title="No pending invitations"
        description="There are no pending invitations for your wallet address."
      />
    );
  }

  return (
    <>
      {showConnectSuccessMessage && connectedAddress && (
        <Typography.Text
          type="success"
          css={css`
            margin-bottom: 12px;
          `}
        >
          Wallet connected! Click next to continue.
        </Typography.Text>
      )}
      <Button
        type="primary"
        onClick={() => {
          startOnboarding();
        }}
      >
        Continue
      </Button>
    </>
  );
}

function InvitationErrorMessage({
  title,
  description,
}: {
  title: ReactNode;
  description: ReactNode;
}) {
  const { token } = theme.useToken();

  return (
    <>
      <Alert
        css={css`
          margin: 10px 0 28px;
          white-space: break-spaces;
          text-align: left;

          @media (max-width: ${token.screenMD - 1}px) {
            & .ant-alert-icon {
              display: none;
            }
          }
        `}
        showIcon
        message={title}
        description={
          <div
            css={css`
              font-size: 14px;
            `}
          >
            {description}
          </div>
        }
        type="error"
      />
      <DisconnectButton />
    </>
  );
}

function DisconnectButton() {
  const logout = useLogoutEthosUser();
  const { connectedAddress } = useCurrentUser();

  return (
    <Button
      type="primary"
      danger
      onClick={() => {
        logout();
      }}
      css={css`
        display: flex;
        flex-direction: column;
        height: auto;
        gap: 0;
        row-gap: 0;
        width: fit-content;
      `}
    >
      <div>Disconnect current address</div>
      {connectedAddress && shortenHash(connectedAddress)}
    </Button>
  );
}
