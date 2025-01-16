import { css } from '@emotion/react';
import { type Vouch } from '@ethos/blockchain-manager';
import { Button, Flex, Modal, Tooltip, Typography } from 'antd';
import { GppBad, GppGood } from 'components/icons';
import { tokenCssVars } from 'config/theme';
import { useUnvouch } from 'hooks/api/blockchain-manager';
import { useActor } from 'hooks/user/activities';
import { eventBus } from 'utils/event-bus';

type Props = {
  close: () => void;
  isOpen: boolean;
  vouch: Vouch | null;
};

const styles = {
  panel: css({
    backgroundColor: tokenCssVars.colorBgContainer,
    padding: '10px 5px',
    '@media (min-width: 768px)': {
      padding: '30px 20px',
    },
    borderRadius: `${tokenCssVars.borderRadiusLG}px`,
    position: 'relative',
  }),
  bottomPanel: css({
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: tokenCssVars.colorBgLayout,
    padding: '12px',
    borderBottomLeftRadius: `${tokenCssVars.borderRadiusLG}px`,
    borderBottomRightRadius: `${tokenCssVars.borderRadiusLG}px`,
    justifyContent: 'center',
  }),
  actionButton: css({
    marginBottom: '48px',
    '@media (min-width: 768px)': {
      marginBottom: '24px',
    },
  }),
  centeredText: css({
    textAlign: 'center',
  }),
  icon: {
    healthy: css({
      fontSize: 48,
      color: tokenCssVars.colorSuccess,
    }),
    unhealthy: css({
      fontSize: 48,
      color: tokenCssVars.colorError,
    }),
  },
};

type VouchOptionProps = {
  type: 'healthy' | 'unhealthy';
  onUnvouch: (isHealthy: boolean) => Promise<void>;
  isLoading: boolean;
  isOtherLoading: boolean;
};

function VouchOption({ type, onUnvouch, isLoading, isOtherLoading }: VouchOptionProps) {
  const isHealthy = type === 'healthy';

  return (
    <Flex align="center" vertical gap={6} css={styles.panel}>
      {isHealthy ? <GppGood css={styles.icon.healthy} /> : <GppBad css={styles.icon.unhealthy} />}
      <Typography.Title level={3}>{isHealthy ? 'Healthy' : 'Unhealthy'}</Typography.Title>
      <Typography.Text css={styles.centeredText}>
        {isHealthy
          ? 'They didn’t do anything wrong, you just want to get your money out of Ethos.'
          : 'This person did something wrong and you want your unvouch to reflect that.'}
      </Typography.Text>
      <Button
        type="primary"
        css={styles.actionButton}
        onClick={async () => {
          await onUnvouch(isHealthy);
        }}
        loading={isLoading}
        disabled={isOtherLoading}
      >
        Unvouch
      </Button>
      <Flex css={styles.bottomPanel}>
        <Typography.Text>
          User’s score change <Tooltip title="Calculation will be implemented soon">TBD</Tooltip>
        </Typography.Text>
      </Flex>
    </Flex>
  );
}

export function UnvouchModalComponent({ close, isOpen, vouch }: Props) {
  const subjectProfile = useActor({
    profileId: vouch?.subjectProfileId ?? -1,
  });

  const unvouchHealthy = useUnvouch(true);
  const unvouchUnhealthy = useUnvouch(false);

  async function handleUnvouch(isHealthy: boolean) {
    if (vouch) {
      try {
        const mutation = isHealthy ? unvouchHealthy : unvouchUnhealthy;
        await mutation.mutateAsync(vouch.id);
        eventBus.emit('SCORE_UPDATED');
        close();
      } catch {
        // No special cases to handle
      }
    }
  }

  const isUnvouchInProgress = unvouchHealthy.isPending || unvouchUnhealthy.isPending;

  function onCancel() {
    if (!isUnvouchInProgress) close();
  }

  return (
    <Modal
      title={`Remove vouch for ${subjectProfile?.name ?? 'User'}?`}
      open={isOpen}
      closable={!isUnvouchInProgress}
      onCancel={onCancel}
      footer={null}
    >
      <Flex gap={24}>
        <VouchOption
          type="healthy"
          onUnvouch={handleUnvouch}
          isLoading={unvouchHealthy.isPending}
          isOtherLoading={unvouchUnhealthy.isPending}
        />
        <VouchOption
          type="unhealthy"
          onUnvouch={handleUnvouch}
          isLoading={unvouchUnhealthy.isPending}
          isOtherLoading={unvouchHealthy.isPending}
        />
      </Flex>
    </Modal>
  );
}
