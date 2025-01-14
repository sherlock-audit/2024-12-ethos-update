import { css } from '@emotion/react';
import { Button, Empty, Flex, theme, Typography } from 'antd';
import { useAuthModals } from 'contexts/auth-modals.context';
import { useThemeMode } from 'contexts/theme-manager.context';
import { useSwitchChain } from 'hooks/user/privy.hooks';

export function WrongNetwork() {
  const { token } = theme.useToken();
  const mode = useThemeMode();
  const { setActiveModal } = useAuthModals();
  const switchChain = useSwitchChain();

  function onConnect() {
    switchChain();
    setActiveModal(null);
  }

  const imageURL = `/assets/images/illustrations/not_connected${mode === 'dark' ? '_dark' : ''}.svg`;

  return (
    <Flex
      vertical
      align="center"
      justify="center"
      gap={22}
      css={{
        paddingBlock: token.paddingLG,
      }}
    >
      <Flex vertical align="center" justify="center">
        <Empty
          image={imageURL}
          description={null}
          styles={{
            image: {
              height: 98,
            },
          }}
        />
        <Typography.Title level={2}>Wrong network detected</Typography.Title>
      </Flex>
      <Flex vertical gap={42} align="center">
        <Typography.Text
          type="secondary"
          css={css`
            font-size: 14px;
            line-height: 22px;
            text-align: center;
          `}
        >
          Please switch to the correct network by clicking the button below to continue.
        </Typography.Text>
        <Button type="primary" onClick={onConnect} size="large">
          Switch Network
        </Button>
      </Flex>
    </Flex>
  );
}
