import { css } from '@emotion/react';
import { Button, Skeleton, theme } from 'antd';
import { zeroAddress } from 'viem';
import { useAccount } from 'wagmi';
import { ConnectButtonWrapper } from './connect-button-wrapper';
import { UserAvatar } from 'components/avatar/avatar.component';
import { CaretDownIcon } from 'components/icons';
import { useMenuDrawer } from 'components/menu-drawer/menu.context';
import { useCurrentUser } from 'contexts/current-user.context';
import { useActor } from 'hooks/user/activities';
import { useLoginEthosUser, useSwitchChain } from 'hooks/user/privy.hooks';
import { hideOnMobileCSS } from 'styles/responsive';

const { useToken } = theme;

export function ConnectButton() {
  const { isReady, isConnected } = useCurrentUser();
  const { chain } = useAccount();

  return (
    <ConnectButtonWrapper
      ready={isReady}
      wrapperCSS={
        isConnected && chain
          ? css`
              ${hideOnMobileCSS}
            `
          : undefined
      }
    >
      <ConnectButtonInner />
    </ConnectButtonWrapper>
  );
}

function ConnectButtonInner() {
  const { token } = useToken();
  const login = useLoginEthosUser();
  const { isConnected, isReady, status, connectedAddress } = useCurrentUser();
  const { chain } = useAccount();
  const switchChain = useSwitchChain();
  const { setIsOpen } = useMenuDrawer();
  const connectedTarget = { address: connectedAddress ?? zeroAddress };
  const user = useActor(connectedTarget);

  if (!isReady || status === 'connecting' || status === 'reconnecting') {
    return <Skeleton.Avatar active size={40} />;
  }

  if (!isConnected) {
    return (
      <Button
        onClick={login}
        type="primary"
        css={css`
          height: 40px;
          border-radius: ${token.borderRadiusLG}px;
        `}
      >
        Log in
      </Button>
    );
  }

  if (!chain) {
    return (
      <Button
        onClick={switchChain}
        type="primary"
        danger
        icon={<CaretDownIcon />}
        iconPosition="end"
        css={css`
          height: 40px;
          border-radius: ${token.borderRadiusLG}px;
        `}
      >
        Wrong network
      </Button>
    );
  }

  return (
    <Button
      onClick={() => {
        setIsOpen(true);
      }}
      type="link"
      css={{
        height: 'auto',
        width: 'auto',
        padding: 0,
      }}
    >
      <UserAvatar
        actor={user}
        size={40}
        renderAsLink={false}
        showHoverCard={false}
        showScore={true}
        scoreVariant="elevated"
      />
    </Button>
  );
}
