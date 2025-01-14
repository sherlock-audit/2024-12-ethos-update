import { InfoCircleOutlined } from '@ant-design/icons';
import { css } from '@emotion/react';
import { type PendingInvitation } from '@ethos/domain';
import { useQueryClient } from '@tanstack/react-query';
import { Button, Flex, theme, Typography } from 'antd';
import { useState } from 'react';
import { zeroAddress } from 'viem';
import { AvailableInvitesList } from '../available-invites-list.component';
import { OnboardingStep } from '../onboarding-step.component';
import { invalidate } from 'constant/queries/cache.invalidation';
import { cacheKeys } from 'constant/queries/queries.constant';
import { useCurrentUser } from 'contexts/current-user.context';
import { useRegisterSmartWallet } from 'hooks/api/auth/register-wallet.hooks';
import { useCreateProfile } from 'hooks/api/blockchain-manager';
import { useEventsProcessSync } from 'hooks/api/echo.hooks';
import { eventBus } from 'utils/event-bus';

type Props = {
  stepCompleted: () => void;
  invitationHover?: (invitation: PendingInvitation | null) => void;
  setSelectedInvitation: (invitation: PendingInvitation) => void;
  selectedInvitation: PendingInvitation | null;
  inviterProfileId: number | null;
};

const styles = {
  twoTransactions: css({
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  }),
};

export function AcceptInviteStep({
  stepCompleted,
  invitationHover,
  setSelectedInvitation,
  selectedInvitation,
  inviterProfileId,
}: Props) {
  const { connectedAddress } = useCurrentUser();
  const { token } = theme.useToken();

  return (
    <OnboardingStep
      icon={
        <div
          css={css`
            position: relative;
            width: 150px;
            height: 150px;
          `}
        >
          <div
            css={css`
              width: 180px;
              height: 180px;
              background-color: #669daa;
              border-radius: 50%;
            `}
          />
        </div>
      }
      title={
        <>
          Accept an
          <br />
          Invite
        </>
      }
      description={
        <Flex
          justify="center"
          css={css`
            width: 374px;
          `}
        >
          <Typography.Paragraph
            css={css`
              font-size: ${token.fontSizeLG}px;
            `}
          >
            Invitations from members with higher scores will increase your Ethos score the most.
          </Typography.Paragraph>
        </Flex>
      }
    >
      <AvailableInvitesList
        inviteeAddress={connectedAddress ?? null}
        originalInviterProfileId={inviterProfileId}
        selectedInvitation={selectedInvitation}
        invitationSelected={setSelectedInvitation}
        invitationHover={invitationHover}
        preselectFirstInvitation
      />
      <Action selectedInvitation={selectedInvitation} stepCompleted={stepCompleted} />
    </OnboardingStep>
  );
}

function Action({
  selectedInvitation,
  stepCompleted,
}: Pick<Props, 'selectedInvitation' | 'stepCompleted'>) {
  const queryClient = useQueryClient();
  const [isCreatingProfile, setCreatingProfile] = useState(false);
  const { connectedAddress, connectedProfile, isSmartWalletConnected, smartWalletAddress } =
    useCurrentUser();

  const createProfile = useCreateProfile();

  const registerSmartWallet = useRegisterSmartWallet({
    onSuccess: () => {
      stepCompleted();
    },
    onError: () => {
      stepCompleted();
    },
  });
  const eventsProcess = useEventsProcessSync();

  const target = { address: connectedAddress ?? zeroAddress };

  async function doCreateProfile() {
    try {
      setCreatingProfile(true);

      if (selectedInvitation) {
        const { hash } = await createProfile.mutateAsync(selectedInvitation.id);

        await invalidate(queryClient, [
          cacheKeys.score.history(target),
          cacheKeys.score.byTarget(target),
        ]);

        await eventsProcess.mutateAsync({ txHash: hash });

        eventBus.emit('SCORE_UPDATED');

        if (smartWalletAddress && !isSmartWalletConnected) {
          await registerSmartWallet.mutateAsync();
        }
      }
    } catch {
      // No special cases to handle
    } finally {
      setCreatingProfile(false);
    }
  }

  return (
    <Flex vertical align="center" gap={25}>
      <Typography.Text type="secondary" css={styles.twoTransactions}>
        <InfoCircleOutlined />
        You will sign two transactions to create your profile
      </Typography.Text>
      <Button
        type="primary"
        onClick={async () => {
          if (connectedProfile && smartWalletAddress && !isSmartWalletConnected) {
            registerSmartWallet.mutate();
          } else {
            await doCreateProfile();
          }
        }}
        disabled={!selectedInvitation}
        loading={isCreatingProfile || registerSmartWallet.isPending}
      >
        Accept
      </Button>
    </Flex>
  );
}
