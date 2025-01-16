import { Button, Drawer } from 'antd';
import { useEffect, useState } from 'react';
import { UAParser } from 'ua-parser-js';
import { isStandalonePWA } from 'ua-parser-js/helpers';
import { AddBoxIcon } from '../icons/add-box.tsx';
import { ArrowDownThinIcon } from '../icons/arrow-down-thin.tsx';
import { IosShare } from '../icons/ios-share.tsx';
import { MarketsIconInversed } from '../icons/markets-icon-inversed.tsx';
import { usePWA } from '~/contexts/pwa-context.tsx';

type BeforeInstallPromptEvent = {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
} & Event;

declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

export function PWAOverlay() {
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [installError, setInstallError] = useState(false);
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
      setInstallError(false);
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      }
    };
  }, []);

  useEffect(() => {
    if (isVisible) {
      document.body.classList.add('overflow-hidden', 'fixed', 'w-full');
    } else {
      document.body.classList.remove('overflow-hidden', 'fixed', 'w-full');
    }
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
      setInstallError(true);

      return;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        setIsInstalled(true);
        setInstallError(false);
      }
    } catch (error) {
      setInstallError(true);
    } finally {
      setDeferredPrompt(null);
    }
  }

  if (!shouldShowPWA) return null;

  return (
    <Drawer
      open={isVisible}
      placement="bottom"
      height="100dvh"
      closable={false}
      maskClosable={false}
      keyboard={false}
      rootClassName="!overflow-hidden"
      className="pt-safe !overflow-hidden"
    >
      {deviceInfo.isIOS && deviceInfo.browser === 'chrome' && (
        <div className="fixed top-[calc(env(safe-area-inset-top)_+_25px)] right-5 z-50 text-3xl text-primary animate-bounce">
          <ArrowDownThinIcon className="text-antd-colorPrimary rotate-180" />
        </div>
      )}
      <div className="h-full flex flex-col !overflow-hidden">
        <div className="flex-1 flex flex-col items-center justify-center gap-1 pt-safe">
          <div className="text-[55px] pt-2">
            <MarketsIconInversed />
          </div>
          <div className="text-lg font-semibold text-center">
            Ethos.markets works best as an app
          </div>
          <div className="flex flex-col items-center mb-4">
            {deviceInfo.isAndroid
              ? 'Use the button below to get started'
              : 'Installation is just a couple steps away:'}
          </div>
          {deviceInfo.isAndroid ? (
            <div className="flex flex-col items-center gap-2">
              {isInstalled ? (
                <p className="text-sm">App installed! Continue in the app</p>
              ) : (
                <>
                  <Button type="primary" onClick={handleInstallClick}>
                    Install Ethos
                  </Button>
                  {installError && (
                    <p className="text-sm text-antd-colorError text-center">
                      Error showing install prompt. Do you already have the app installed?
                    </p>
                  )}
                </>
              )}
            </div>
          ) : (
            <>
              <div className="bg-antd-colorBgLayout w-[300px] rounded-2xl">
                <div className="flex flex-col items-center py-0">
                  <p className="text-center text-md mb-0">
                    1. Select{' '}
                    {deviceInfo.browser === 'chrome'
                      ? ' the Share icon on top '
                      : 'Share on bottom '}
                    <IosShare className="text-antd-colorPrimary text-xl" />
                  </p>
                  <p className="text-center text-md">
                    2. Select &quot;Add to Home Screen&quot;{' '}
                    <AddBoxIcon className="text-antd-colorPrimary text-xl" />
                  </p>
                </div>
              </div>
              <div className="w-full max-w-[300px] relative">
                <img
                  src="/assets/images/pwa/ios-install.png"
                  alt="iOS installation instructions"
                  className="w-full h-auto object-contain"
                />
                {deviceInfo.browser === 'safari' && (
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-3xl text-primary">
                    <ArrowDownThinIcon className="text-antd-colorPrimary animate-bounce" />
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </Drawer>
  );
}
