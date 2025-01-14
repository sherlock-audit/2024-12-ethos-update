'use client';

import { Global } from '@emotion/react';
import { type EthosTheme } from '@ethos/common-ui';
import { duration, toNumber } from '@ethos/helpers';
import { PrivyProvider } from '@privy-io/react-auth';
import { SmartWalletsProvider } from '@privy-io/react-auth/smart-wallets';
import { WagmiProvider } from '@privy-io/wagmi';
import * as Sentry from '@sentry/nextjs';
import { StatsigClient } from '@statsig/react-bindings';
import {
  defaultShouldDehydrateQuery,
  type DehydrateOptions,
  QueryClient,
  replaceEqualDeep,
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { App as AntdApp, ConfigProvider, Spin, type ThemeConfig } from 'antd';
import { type PropsWithChildren } from 'react';
import { IntercomProvider } from 'react-use-intercom';
import { ModalProviders } from './_modal-providers';
import { DevModal } from 'components/dev-modal/dev-modal.modal';
import { PageErrorBoundary } from 'components/error/error-boundary';
import { FeatureGateProvider } from 'components/feature-gate/feature-gate-provider';
import { LottieLoader } from 'components/loading-wrapper/lottie-loader.component';
import {
  getAppVersion,
  getStatsigEnvironment,
  INTERCOM_APP_ID,
  STATSIG_CLIENT_API_KEY,
} from 'config/misc';
import {
  getPrivyAppId,
  getSmartWalletConfig,
  usePrivyConfig,
  usePrivyCssVarOverride,
  wagmiConfig,
} from 'config/privy';
import { getTheme } from 'config/theme';
import { dynamicConfigs } from 'constant/feature-flags';
import { NO_PERSIST_KEY } from 'constant/queries/queries.constant';
import { AnalyticsProvider } from 'contexts/analytics.context';
import { AppNotificationsProvider } from 'contexts/app-notifications.context';
import { BlockchainManagerProvider } from 'contexts/blockchain-manager.context';
import { CurrentUserProvider } from 'contexts/current-user.context';
import { PWAProvider } from 'contexts/pwa-context';
import { PWALoginProvider } from 'contexts/pwa-login.context';
import { ThemeManagerConsumer, ThemeManagerProvider } from 'contexts/theme-manager.context';
import { useVerifyLatestAppVersion } from 'hooks/helpers/checkAppVersion';
import { createIdbPersister } from 'services/idb-store';
import 'styles/global.css';

Spin.setDefaultIndicator(<LottieLoader size={24} />);

const enableCaching = global.window?.localStorage?.getItem('ethos.dev.ENABLE_CACHING') !== 'false';

if (!enableCaching) console.warn('DEV MODE: caching is disabled');

const INSTANT = 0;

function initStatsig() {
  const client = new StatsigClient(
    STATSIG_CLIENT_API_KEY,
    {},
    { environment: { tier: getStatsigEnvironment() } },
  );

  client.initializeAsync();

  return client;
}

const statsigClient = initStatsig();
const reactQueryCacheTimeConfig = statsigClient.getDynamicConfig(dynamicConfigs.reactQueryCache);
const staleTimeInMs = toNumber(reactQueryCacheTimeConfig.value.staleTimeInMs, 5000);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // With SSR, we usually want to set some default staleTime
      // above 0 to avoid refetching immediately on the client
      staleTime: enableCaching ? staleTimeInMs : INSTANT,
      gcTime: enableCaching ? duration(1, 'day').toMilliseconds() : INSTANT, // clear entire local cache after 24 hours
      refetchInterval: false,
      refetchIntervalInBackground: false,
      throwOnError: true,
      structuralSharing(prevData, data) {
        // Temporarily fix for issue when data includes non-serializable data
        // like BigInt. This only throws an error when NODE_ENV is not
        // "production". It was introduced in react-query v5.53.1
        // (https://github.com/TanStack/query/pull/7966)
        return replaceEqualDeep(prevData, data);
      },
    },
  },
});

const persister = createIdbPersister('global-cache');
// eslint-disable-next-line func-style
const shouldDehydrateQuery: DehydrateOptions['shouldDehydrateQuery'] = (query) => {
  const keys = query.queryKey;

  // Should we persist this query?
  if (
    Array.isArray(keys) &&
    // If the query keys contain the NO_PERSIST_KEY,
    // we will skip persisting this query.
    (keys.includes(NO_PERSIST_KEY) ||
      // Avoid persisting connectorClient query
      // (useConnectorClient) in IndexedDB because it's
      // not serializable.
      keys.includes('connectorClient'))
  ) {
    return false;
  }

  return defaultShouldDehydrateQuery(query);
};

const themes: Record<EthosTheme, ThemeConfig> = {
  light: getTheme('light'),
  dark: getTheme('dark'),
} as const;

export function Providers({ children, userTheme }: PropsWithChildren<{ userTheme?: string }>) {
  useVerifyLatestAppVersion();

  return (
    <ThemeManagerProvider userTheme={userTheme}>
      <ThemeManagerConsumer>
        {({ theme }) => (
          <IntercomProvider autoBoot appId={INTERCOM_APP_ID}>
            <ConfigProvider theme={themes[theme]}>
              <Sentry.ErrorBoundary fallback={PageErrorBoundary}>
                <PrivyProviderWrapper>
                  <SmartWalletsProvider config={getSmartWalletConfig()}>
                    <PersistQueryClientProvider
                      client={queryClient}
                      persistOptions={{
                        persister,
                        buster: getAppVersion(),
                        dehydrateOptions: {
                          shouldDehydrateQuery,
                        },
                      }}
                    >
                      <WagmiProvider config={wagmiConfig}>
                        <CurrentUserProvider>
                          <FeatureGateProvider client={statsigClient}>
                            <BlockchainManagerProvider>
                              {/* ReactQueryDevtools is only being rendered locally */}
                              <ReactQueryDevtools
                                initialIsOpen={false}
                                buttonPosition="bottom-left"
                              />
                              <AppNotificationsProvider>
                                <AnalyticsProvider>
                                  <AntdApp
                                    notification={{
                                      placement: 'bottomLeft',
                                    }}
                                  >
                                    <PWAProvider>
                                      <PWALoginProvider>
                                        <ModalProviders>{children}</ModalProviders>
                                      </PWALoginProvider>
                                    </PWAProvider>
                                  </AntdApp>
                                  <DevModal />
                                </AnalyticsProvider>
                              </AppNotificationsProvider>
                            </BlockchainManagerProvider>
                          </FeatureGateProvider>
                        </CurrentUserProvider>
                      </WagmiProvider>
                    </PersistQueryClientProvider>
                  </SmartWalletsProvider>
                </PrivyProviderWrapper>
              </Sentry.ErrorBoundary>
            </ConfigProvider>
          </IntercomProvider>
        )}
      </ThemeManagerConsumer>
    </ThemeManagerProvider>
  );
}

function PrivyProviderWrapper({ children }: PropsWithChildren) {
  const config = usePrivyConfig();
  const styles = usePrivyCssVarOverride();

  return (
    <>
      <Global styles={styles} />
      <PrivyProvider appId={getPrivyAppId()} config={config}>
        {children}
      </PrivyProvider>
    </>
  );
}
