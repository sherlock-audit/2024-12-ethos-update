'use client';

import { css, keyframes, Global } from '@emotion/react';
import { Logo } from '@ethos/common-ui';
import { Drawer, Flex, Typography, Button } from 'antd';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { UAParser } from 'ua-parser-js';
import { isStandalonePWA } from 'ua-parser-js/helpers';
import { AddBoxIcon, ArrowDownThinIcon, ArrowUpThinIcon, IosShare } from 'components/icons';
import { tokenCssVars } from 'config/theme';
import { usePWA } from 'contexts/pwa-context';

const { Text } = Typography;

const bounceAnimation = keyframes`
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(15px);
  }
`;

const bounceUpAnimation = keyframes`
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
`;

const pwaModalCss = {
  upArrow: css({
    position: 'fixed',
    top: '20px',
    right: '20px',
    zIndex: 1000,
    animation: `${bounceUpAnimation} 1.5s ease-in-out infinite`,
    color: tokenCssVars.colorPrimary,
    fontSize: '32px',
  }),

  container: css({
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    paddingBottom: '40px',
  }),

  androidContainer: css({
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    paddingBottom: 0,
  }),

  logo: css({
    fontSize: '45px',
    paddingTop: '40px',
  }),

  title: css({
    fontSize: '20px',
    lineHeight: '22px',
    fontWeight: 600,
  }),

  text: css({
    fontSize: '14px',
    lineHeight: '22px',
  }),

  instructionsBox: css({
    backgroundColor: tokenCssVars.colorBgLayout,
    width: '275px',
    padding: '11px 0px',
    borderRadius: '16px',
  }),

  imageContainer: css({
    width: '100%',
    maxWidth: '300px',

    position: 'relative',
  }),

  image: css({
    width: '100%',
    height: 'auto',
    objectFit: 'contain',
  }),

  downArrow: css({
    position: 'absolute',
    bottom: '-20px',
    left: '44%',
    transform: 'translateX(-50%)',
    animation: `${bounceAnimation} 1.5s ease-in-out infinite`,
    color: tokenCssVars.colorPrimary,
    fontSize: '32px',
  }),

  arrowIcon: css({
    animation: `${bounceAnimation} 1.5s ease-in-out infinite`,
  }),

  shareIcon: css({
    fontSize: '22px',
    color: tokenCssVars.colorPrimary,
  }),

  installButton: css({
    marginTop: 8,
  }),
};

type BeforeInstallPromptEvent = {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
} & Event;

// Add this type declaration before the PWAModal component
declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

export function PWAModal() {
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<{
    isIOS: boolean;
    isAndroid: boolean;
    browser: 'chrome' | 'safari' | 'other';
  }>({ isIOS: false, isAndroid: false, browser: 'other' });
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const { shouldShowPWA } = usePWA();

  useEffect(() => {
    function handleBeforeInstallPrompt(e: BeforeInstallPromptEvent): void {
      e.preventDefault();
      setDeferredPrompt(e);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Replace the body scroll locking effect with Global
  useEffect(() => {
    if (isVisible) {
      document.documentElement.style.touchAction = 'none'; // Prevent scroll on iOS
    } else {
      document.documentElement.style.touchAction = '';
    }

    return () => {
      document.documentElement.style.touchAction = '';
    };
  }, [isVisible]);

  useEffect(() => {
    if (!shouldShowPWA) {
      setIsVisible(false);

      return;
    }

    // Initialize UA Parser
    const { browser, device, os } = UAParser(window.navigator.userAgent);

    if (isStandalonePWA()) {
      return; // Don't show modal if already in PWA
    }

    // Check if mobile using UA Parser
    const isMobile = device.type === 'mobile' || device.type === 'tablet';

    if (!isMobile) {
      return; // Don't show modal on desktop
    }

    // Detect OS using UA Parser
    const isIOS = os.name === 'iOS';
    const isAndroid = os.name === 'Android';

    if (!isIOS && !isAndroid) {
      return; // Don't show modal on non-mobile devices
    }

    // Detect browser using UA Parser
    let browserType: 'chrome' | 'safari' | 'other' = 'other';
    const browserName = browser.name?.toLowerCase() ?? '';

    if (browserName.includes('chrome')) {
      browserType = 'chrome';
    } else if (browserName.includes('safari')) {
      browserType = 'safari';
    }

    setDeviceInfo({ isIOS, isAndroid, browser: browserType });
    setIsVisible(true);

    // Add resize listener to hide modal if window is resized to desktop size
    function handleResize() {
      if (window.innerWidth > 768) {
        setIsVisible(false);
      }
    }

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [shouldShowPWA]);

  async function handleInstallClick(): Promise<void> {
    if (!deferredPrompt) {
      return;
    }

    await deferredPrompt
      .prompt()
      .then(async () => await deferredPrompt.userChoice)
      .then(({ outcome }) => {
        if (outcome === 'accepted') {
          setIsInstalled(true);
        }
      })
      .catch((error) => {
        console.error('Error showing install prompt:', error);
      })
      .finally(() => {
        setDeferredPrompt(null);
      });
  }

  if (!shouldShowPWA) return null;

  return (
    <>
      <Global
        styles={
          isVisible
            ? css`
                body {
                  overflow: hidden;
                  position: fixed;
                  width: 100%;
                }
              `
            : undefined
        }
      />
      <Drawer
        open={isVisible}
        placement="bottom"
        height="100vh"
        closable={false}
        maskClosable={false}
        keyboard={false}
      >
        {deviceInfo.isIOS && deviceInfo.browser === 'chrome' && (
          <div css={pwaModalCss.upArrow}>
            <ArrowUpThinIcon />
          </div>
        )}
        <div css={deviceInfo.isAndroid ? pwaModalCss.androidContainer : pwaModalCss.container}>
          <Flex align="center" justify="center" gap={8} vertical>
            <div css={pwaModalCss.logo}>
              <Logo fill={tokenCssVars.colorBgContainer} />
            </div>
            <Text css={pwaModalCss.title}>Ethos works best as an app</Text>
            <Flex vertical align="center">
              <Text css={pwaModalCss.text}>Get push alerts & gas-free transactions—on us.</Text>
              <Text css={pwaModalCss.text}>
                Plus, you&apos;ll never have to sign a transaction again.
              </Text>
            </Flex>
            {deviceInfo.isAndroid ? (
              <Flex vertical align="center" gap={8}>
                {isInstalled ? (
                  <Text css={pwaModalCss.text}>App installed! Continue in the app</Text>
                ) : (
                  <Button
                    type="primary"
                    css={pwaModalCss.installButton}
                    onClick={handleInstallClick}
                  >
                    Install Ethos
                  </Button>
                )}
              </Flex>
            ) : (
              <>
                <div css={pwaModalCss.instructionsBox}>
                  <Flex vertical align="center" gap={4}>
                    <Text css={pwaModalCss.text}>
                      1. Select{' '}
                      {deviceInfo.browser === 'chrome'
                        ? ' the Share icon on top '
                        : 'Share on bottom '}
                      <IosShare css={pwaModalCss.shareIcon} />
                    </Text>
                    <Text css={pwaModalCss.text}>
                      2. Select &quot;Add to Home Screen&quot;{' '}
                      <AddBoxIcon css={pwaModalCss.shareIcon} />
                    </Text>
                  </Flex>
                </div>
                <div css={pwaModalCss.imageContainer}>
                  <Image
                    src="/assets/images/pwa/ios-install.png"
                    alt="iOS installation instructions"
                    width={300}
                    height={150}
                    unoptimized={true}
                    css={pwaModalCss.image}
                  />
                  {deviceInfo.browser === 'safari' && (
                    <div css={pwaModalCss.downArrow}>
                      <ArrowDownThinIcon css={pwaModalCss.arrowIcon} />
                    </div>
                  )}
                </div>
              </>
            )}
          </Flex>
        </div>
      </Drawer>
    </>
  );
}
