import { css } from '@emotion/react';
import { Button, Empty, Flex, theme, Typography } from 'antd';
import { useAuthModals } from 'contexts/auth-modals.context';
import { useThemeMode } from 'contexts/theme-manager.context';
import { useLoginEthosUser } from 'hooks/user/privy.hooks';

export function NotLoggedIn() {
  const { token } = theme.useToken();
  const { setActiveModal } = useAuthModals();
  const login = useLoginEthosUser();
  const mode = useThemeMode();

  function onConnect() {
    setActiveModal(null);
    login();
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
        <Typography.Title level={2}>Not logged in</Typography.Title>
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
          Please log in to continue.
        </Typography.Text>
        <Button type="primary" onClick={onConnect} size="large">
          Log in
        </Button>
      </Flex>
    </Flex>
  );
}
