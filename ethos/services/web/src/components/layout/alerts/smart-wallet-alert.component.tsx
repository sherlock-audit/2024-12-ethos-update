import { css } from '@emotion/react';
import { type EthosTheme } from '@ethos/common-ui';
import { Alert, Avatar, Button } from 'antd';
import { BoltFilledIcon } from 'components/icons';
import { fonts } from 'config/fonts';
import { tokenCssVars } from 'config/theme';
import { useCurrentUser } from 'contexts/current-user.context';
import { useThemeMode } from 'contexts/theme-manager.context';
import { useRegisterSmartWallet } from 'hooks/api/auth/register-wallet.hooks';
import { useLocalStorage } from 'hooks/use-storage';

const styles = {
  avatar: (mode: EthosTheme) =>
    css({
      backgroundColor: mode === 'light' ? tokenCssVars.colorBgContainer : tokenCssVars.colorText,
    }),
  icon: css({
    color: tokenCssVars.colorErrorActive,
    fontSize: '30px',
  }),
  alert: (mode: EthosTheme) =>
    css({
      backgroundColor: tokenCssVars.colorErrorTextActive,
      alignItems: 'center',
      '& .ant-alert-message': {
        color: mode === 'light' ? tokenCssVars.colorBgContainer : tokenCssVars.colorText,
        fontFamily: fonts.cssVars.queens,
        fontSize: tokenCssVars.fontSizeHeading4,
      },
      '& .ant-alert-description': {
        color: mode === 'light' ? tokenCssVars.colorBgContainer : tokenCssVars.colorText,
      },
      '& .ant-alert-close-icon .anticon-close': {
        color: mode === 'light' ? tokenCssVars.colorBgContainer : tokenCssVars.colorText,
      },
      marginTop: '8px',
    }),
  button: css({
    '&:hover': {
      borderColor: tokenCssVars.colorErrorHover,
    },
    '&:active': {
      borderColor: tokenCssVars.colorErrorActive,
    },
  }),
};

export function SmartWalletNotConnectedAlert() {
  const { isReady, isConnected, connectedProfile, smartWalletAddress, isSmartWalletConnected } =
    useCurrentUser();
  const registerSmartWallet = useRegisterSmartWallet();
  const [isAlertDismissed, setIsAlertDismissed] = useLocalStorage(
    'smart-wallet-not-connected-alert.dismissed',
    false,
  );
  const mode = useThemeMode();

  if (
    !isReady ||
    !isConnected ||
    !connectedProfile ||
    !smartWalletAddress ||
    isSmartWalletConnected ||
    isAlertDismissed === undefined ||
    isAlertDismissed
  ) {
    return null;
  }

  return (
    <Alert
      message="Smart wallet not connected"
      description="Connect your smart wallet to Ethos to unlock fast & free transactions. You only have to do this once."
      closable
      afterClose={() => {
        setIsAlertDismissed(true);
      }}
      showIcon
      icon={
        <Avatar icon={<BoltFilledIcon css={styles.icon} />} size={48} css={styles.avatar(mode)} />
      }
      action={
        <Button
          loading={registerSmartWallet.isPending}
          onClick={() => {
            registerSmartWallet.mutate();
          }}
          css={styles.button}
        >
          Connect
        </Button>
      }
      css={styles.alert(mode)}
    />
  );
}
