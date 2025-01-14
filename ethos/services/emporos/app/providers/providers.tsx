import { StyleProvider } from '@ant-design/cssinjs';
import { type EthosTheme } from '@ethos/common-ui';
import { type EthosEnvironment } from '@ethos/env';
import { PrivyProvider } from '@privy-io/react-auth';
import { WagmiProvider } from '@privy-io/wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider, App as AntdApp } from 'antd';
import { type PropsWithChildren } from 'react';
import { MenuDrawerProvider } from '~/components/header/menu.context.tsx';
import { usePrivyConfig } from '~/config/privy.ts';
import { darkTheme, lightTheme } from '~/config/theme.ts';
import { wagmiConfig } from '~/config/wagmi.ts';
import { BlockchainManagerProvider } from '~/contexts/blockchain-manager.context.tsx';
import { PWAProvider } from '~/contexts/pwa-context.tsx';

type ProvidersProps = PropsWithChildren<{
  environment: EthosEnvironment;
  privyAppId: string;
  theme: EthosTheme;
}>;

const queryClient = new QueryClient();

export function Providers({ children, environment, privyAppId, theme }: ProvidersProps) {
  const privyConfig = usePrivyConfig();

  return (
    <StyleProvider layer>
      <AntdConfigProvider theme={theme}>
        <PrivyProvider appId={privyAppId} config={privyConfig}>
          <QueryClientProvider client={queryClient}>
            <WagmiProvider config={wagmiConfig}>
              <BlockchainManagerProvider environment={environment}>
                <PWAProvider>
                  <AntdApp
                    notification={{
                      placement: 'bottomLeft',
                    }}
                  >
                    <MenuDrawerProvider>{children}</MenuDrawerProvider>
                  </AntdApp>
                </PWAProvider>
              </BlockchainManagerProvider>
            </WagmiProvider>
          </QueryClientProvider>
        </PrivyProvider>
      </AntdConfigProvider>
    </StyleProvider>
  );
}

export function AntdConfigProvider({ children, theme }: PropsWithChildren<{ theme: EthosTheme }>) {
  return (
    <ConfigProvider theme={theme === 'dark' ? darkTheme : lightTheme}>{children}</ConfigProvider>
  );
}
