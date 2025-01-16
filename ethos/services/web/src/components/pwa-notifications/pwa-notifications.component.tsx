'use client';

import { css } from '@emotion/react';
import { Button, Drawer, Typography, Flex } from 'antd';
import { Permission } from 'components/icons';
import { tokenCssVars } from 'config/theme';
import { useAppNotifications } from 'contexts/app-notifications.context';

const pwaNotificationsCss = {
  container: css({
    height: '100%',
    padding: '20px',
    paddingBottom: 'env(safe-area-inset-bottom)',
    position: 'relative',
    overflow: 'hidden',
  }),

  topSection: css({
    flex: 1,
  }),

  bottomSection: css({
    width: '100%',
    marginBottom: 'calc(76px - env(safe-area-inset-bottom))',
  }),

  logo: css({
    fontSize: '72px',
    marginBottom: '40px',
  }),

  title: css({
    textAlign: 'center',
    marginBottom: '12px',
  }),

  text: css({
    fontSize: '16px',
    lineHeight: '24px',
    textAlign: 'center',
    marginBottom: '32px',
  }),

  icon: css({
    fontSize: '32px',
    color: tokenCssVars.colorPrimary,
    marginBottom: '24px',
  }),

  primaryButton: css({
    marginBottom: '16px',
    height: '48px',
    width: '100%',
    maxWidth: '335px',
    fontSize: tokenCssVars.fontSizeLG,
    color: tokenCssVars.colorBgContainer,
  }),

  secondaryButton: css({
    height: '48px',
    width: '100%',
    maxWidth: '335px',
    fontSize: tokenCssVars.fontSizeLG,
    backgroundColor: tokenCssVars.colorBgElevated,
    border: 'none',
  }),
};

type Props = {
  open: boolean;
  onClose: () => void;
};

export function PWANotifications({ open, onClose }: Props) {
  const { requestPermission } = useAppNotifications();

  async function handleEnableNotifications() {
    await requestPermission?.();
    onClose();
  }

  return (
    <Drawer
      open={open}
      placement="bottom"
      height="100vh"
      maskClosable={false}
      keyboard={false}
      onClose={onClose}
      closable={false}
      styles={{
        body: {
          padding: 0,
          overflow: 'hidden',
        },
        mask: {
          backgroundColor: tokenCssVars.colorBgElevated,
        },
      }}
    >
      <Flex vertical justify="space-between" align="center" css={pwaNotificationsCss.container}>
        <Flex vertical align="center" justify="center" css={pwaNotificationsCss.topSection}>
          <Permission css={pwaNotificationsCss.icon} />
          <Typography.Title css={pwaNotificationsCss.title}>Notifications.</Typography.Title>
          <Typography.Text css={pwaNotificationsCss.text}>
            Get notified when your score changes, new reviews are posted, and when people reply to
            you.
          </Typography.Text>
        </Flex>
        <Flex vertical align="center" css={pwaNotificationsCss.bottomSection}>
          <Button
            type="primary"
            css={pwaNotificationsCss.primaryButton}
            onClick={handleEnableNotifications}
          >
            Enable notifications
          </Button>
          <Button css={pwaNotificationsCss.secondaryButton} onClick={onClose}>
            Not now
          </Button>
        </Flex>
      </Flex>
    </Drawer>
  );
}
