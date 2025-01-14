import { css, type SerializedStyles } from '@emotion/react';
import { type EthosTheme } from '@ethos/common-ui';
import { duration } from '@ethos/helpers';
import { type PrivyClientConfig } from '@privy-io/react-auth';
import { type SmartWalletsProviderProps } from '@privy-io/react-auth/smart-wallets';
import { createConfig } from '@privy-io/wagmi';
import { http } from 'viem';
import { base, baseSepolia } from 'viem/chains';
import { getEnvironment } from './environment';
import { getWebServerUrl } from './misc';
import { darkTheme, lightTheme } from './theme';
import { privacyPolicyLink, termsOfServiceLink } from 'constant/links';
import { useThemeMode } from 'contexts/theme-manager.context';

const baseWagmiConfig = {
  // This is used for polling contract events or for checking transaction
  // status. On the FE we only use the client for waiting for transactions to
  // complete. This should speed up the success tx notification.
  // Note, default is 4 seconds.
  pollingInterval: duration(1, 'second').toMilliseconds(),
};

export const wagmiConfig =
  getEnvironment() === 'prod'
    ? createConfig({
        chains: [base],
        transports: { [base.id]: http() },
        ...baseWagmiConfig,
      })
    : createConfig({
        chains: [baseSepolia],
        transports: { [baseSepolia.id]: http() },
        ...baseWagmiConfig,
      });

export function getPrivyAppId() {
  const env = getEnvironment();

  switch (env) {
    case 'local':
    case 'dev':
      return 'cm28tigsl01nrx1wh7ek7gd4w';
    case 'testnet':
      return 'cm33meogs04dfgb0rxfhrbb68';
    case 'prod':
      return 'cm5l76en107pt1lpl2ve2ocfy';
  }
}

export function usePrivyConfig(): PrivyClientConfig {
  const theme = useThemeMode();
  const environment = getEnvironment();

  return {
    appearance: {
      accentColor: theme === 'dark' ? darkTheme.token.colorPrimary : lightTheme.token.colorPrimary,
      logo: getLogo(theme),
      theme,
    },
    legal: {
      privacyPolicyUrl: privacyPolicyLink,
      termsAndConditionsUrl: termsOfServiceLink,
    },
    loginMethods: ['wallet'],
    supportedChains: environment === 'prod' ? [base] : [baseSepolia],
    embeddedWallets: {
      createOnLogin: 'all-users',
    },
  };
}

function getLogo(theme: EthosTheme) {
  const webUrl = getWebServerUrl();
  const env = getEnvironment();

  return new URL(
    `/assets/images/privy/logo-${theme === 'dark' ? env : 'all'}-${theme}.png`,
    webUrl,
  ).toString();
}

/**
 * Get the CSS variables override for the Privy UI
 * Docs: https://docs.privy.io/guide/react/configuration/appearance#css-overrides
 */
export function usePrivyCssVarOverride(): SerializedStyles {
  const theme = useThemeMode();
  // Token CSS variables don't work here
  const token = theme === 'dark' ? darkTheme.token : lightTheme.token;

  return css`
    :root {
      --privy-color-background: ${token.colorBgElevated} !important;
      --privy-color-background-2: ${token.colorBgContainer} !important;
      --privy-color-foreground: ${token.colorText} !important;
      --privy-color-foreground-3: ${token.colorTextSecondary} !important;
      --privy-color-foreground-4: ${token.colorBgContainer} !important;
      --privy-color-success: ${token.colorSuccess} !important;
      --privy-color-error: ${token.colorError} !important;
      --privy-color-error-light: ${token.colorErrorBgHover} !important;
      --privy-color-warn: ${token.colorWarning} !important;
      --privy-color-warn-light: ${token.colorBgContainer} !important;
    }
  `;
}

export function getSmartWalletConfig(): SmartWalletsProviderProps['config'] {
  const env = getEnvironment();

  if (env !== 'prod') return;

  return {
    paymasterContext: {
      // https://dashboard.pimlico.io/sponsorship-policies/sp_stiff_pandemic
      sponsorshipPolicyId: 'sp_stiff_pandemic',
    },
  };
}
