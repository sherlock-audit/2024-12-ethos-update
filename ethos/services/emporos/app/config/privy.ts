import { baseDarkTheme, type EthosTheme } from '@ethos/common-ui';
import { privacyPolicyLink, termsOfServiceLink } from '@ethos/domain';
import { emporosUrlMap } from '@ethos/env';
import { type PrivyClientConfig } from '@privy-io/react-auth';
import { baseSepolia } from 'wagmi/chains';
import { darkTheme, lightTheme } from './theme.ts';
import { useEnvironment } from '~/hooks/env.tsx';
import { useThemeMode } from '~/theme/utils.ts';

export const privyConfig: PrivyClientConfig = {
  appearance: {
    theme: 'dark',
    accentColor: baseDarkTheme.token.colorPrimary,
  },
  supportedChains: [baseSepolia],
  embeddedWallets: {
    createOnLogin: 'users-without-wallets',
  },
};

export function usePrivyConfig(): PrivyClientConfig {
  const theme = useThemeMode();
  const logo = useLogo(theme);

  return {
    appearance: {
      accentColor: theme === 'dark' ? darkTheme.token.colorPrimary : lightTheme.token.colorPrimary,
      loginMessage: 'Welcome to Ethos Markets. Please login with your X account.',
      logo,
      theme,
    },
    legal: {
      privacyPolicyUrl: privacyPolicyLink,
      termsAndConditionsUrl: termsOfServiceLink,
    },
    supportedChains: [baseSepolia],
  };
}

function useLogo(theme: EthosTheme) {
  const env = useEnvironment();
  const webUrl = emporosUrlMap[env];

  const envKey = ['testnet', 'prod'].includes(env) || theme === 'light' ? 'all' : env;

  return new URL(`/assets/images/privy/logo-${envKey}-${theme}.png`, webUrl).toString();
}
