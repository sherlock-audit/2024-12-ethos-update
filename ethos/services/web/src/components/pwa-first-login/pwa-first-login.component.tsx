'use client';

import { CloseOutlined } from '@ant-design/icons';
import { css } from '@emotion/react';
import { Button, Drawer, Typography, Flex } from 'antd';
import Link from 'next/link';
import { useState } from 'react';
import { PWANotifications } from '../pwa-notifications/pwa-notifications.component';
import { Logo } from 'components/icons';
import { tokenCssVars } from 'config/theme';
import { termsOfServiceLink } from 'constant/links';
import { usePWALogin } from 'contexts/pwa-login.context';
import { useLoginEthosUser } from 'hooks/user/privy.hooks';

const pwaFirstLoginCss = {
  container: css({
    height: '100%',
    padding: '20px',
    paddingTop: 'calc(20px + env(safe-area-inset-top))',
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
  }),

  text: css({
    fontSize: '16px',
    lineHeight: '24px',
    textAlign: 'center',
    marginBottom: '32px',
  }),

  termsText: css({
    textAlign: 'center',
    color: tokenCssVars.colorTextTertiary,
    fontSize: '14px',
  }),

  button: css({
    marginBottom: '32px',
    height: '48px',
    width: '100%',
    maxWidth: '335px',
    fontSize: tokenCssVars.fontSizeLG,
    color: tokenCssVars.colorBgContainer,
  }),

  closeButton: css({
    position: 'fixed',
    top: 'max(env(safe-area-inset-top), 20px)',
    right: '20px',
    fontSize: '24px',
    zIndex: 1000,
  }),
};

export function PWAFirstLogin() {
  const { shouldShowFirstLogin, markFirstLoginShown } = usePWALogin();
  const [showNotifications, setShowNotifications] = useState(false);
  const login = useLoginEthosUser(() => {
    setShowNotifications(true);
  });

  function handleCloseNotifications() {
    setShowNotifications(false);
    markFirstLoginShown();
  }

  if (!shouldShowFirstLogin) return null;

  return (
    <>
      <Drawer
        open={shouldShowFirstLogin && !showNotifications}
        placement="bottom"
        height="100vh"
        maskClosable={false}
        keyboard={false}
        onClose={markFirstLoginShown}
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
        <Flex vertical justify="space-between" align="center" css={pwaFirstLoginCss.container}>
          <Button
            type="text"
            icon={<CloseOutlined />}
            css={pwaFirstLoginCss.closeButton}
            onClick={markFirstLoginShown}
          />
          <Flex vertical align="center" justify="center" css={pwaFirstLoginCss.topSection}>
            <Logo css={pwaFirstLoginCss.logo} />
            <Typography.Title css={pwaFirstLoginCss.title}>Welcome to Ethos.</Typography.Title>
            <Typography.Text css={pwaFirstLoginCss.text}>
              Reputation & credibility, onchain.
            </Typography.Text>
          </Flex>
          <Flex vertical align="center" css={pwaFirstLoginCss.bottomSection}>
            <Button type="primary" css={pwaFirstLoginCss.button} onClick={login}>
              Log in
            </Button>
            <Typography.Text css={pwaFirstLoginCss.termsText}>
              <Link href={termsOfServiceLink}>Terms & Conditions</Link>
            </Typography.Text>
          </Flex>
        </Flex>
      </Drawer>
      <PWANotifications open={showNotifications} onClose={handleCloseNotifications} />
    </>
  );
}
