import { ClockCircleOutlined } from '@ant-design/icons';
import { css } from '@emotion/react';
import { useCopyToClipboard } from '@ethos/common-ui';
import { isAddressEqualSafe, notEmpty, shortenHash } from '@ethos/helpers';
import { usePrivy } from '@privy-io/react-auth';
import { Avatar, Badge, Button, Card, Col, Flex, Modal, Row, Typography } from 'antd';
import { useState } from 'react';
import { type Address } from 'viem';
import { BoltFilledIcon, ClipboardIcon, Ethereum, SolanaIcon } from 'components/icons';
import { tokenCssVars } from 'config/theme';
import { useCurrentUser } from 'contexts/current-user.context';
import { useRegisterSmartWallet } from 'hooks/api/auth/register-wallet.hooks';
import { getBlockieUrl } from 'hooks/user/lookup';

const walletsListStyles = {
  headerRow: css({
    marginBlock: '12px',
    paddingLeft: '12px',
  }),
  col: css({
    '& .ant-card, & .ant-card >.ant-card-body, & .ant-ribbon-wrapper': {
      height: '100%',
    },
  }),
  comingSoon: {
    avatar: css({
      backgroundColor: tokenCssVars.colorBgLayout,
    }),
    icon: css({
      color: tokenCssVars.colorText,
      fontSize: '24px',
    }),
  },
};

export function Wallets() {
  const {
    connectedProfileAddresses,
    connectedProfilePrimaryAddress,
    isLoadingConnectedProfileAddresses,
    smartWalletAddress,
    isSmartWalletConnected,
  } = useCurrentUser();

  const wallets = [...new Set([...connectedProfileAddresses, smartWalletAddress].filter(notEmpty))];

  return (
    <>
      <Row gutter={[22, 22]} css={walletsListStyles.headerRow}>
        <Typography.Title level={4}>
          <Ethereum /> Ethereum wallets
        </Typography.Title>
      </Row>
      <Row gutter={[22, 22]}>
        {isLoadingConnectedProfileAddresses ? (
          <Card loading />
        ) : (
          wallets.map((wallet) => {
            const isPrimary = connectedProfilePrimaryAddress
              ? isAddressEqualSafe(wallet, connectedProfilePrimaryAddress)
              : false;
            const isSmartWallet = smartWalletAddress
              ? isAddressEqualSafe(wallet, smartWalletAddress)
              : false;

            const walletCard =
              isSmartWallet && smartWalletAddress ? (
                <SmartWallet
                  isConnected={isSmartWalletConnected}
                  smartWalletAddress={smartWalletAddress}
                />
              ) : (
                <Wallet address={wallet} />
              );

            return (
              <Col key={wallet} xs={12} sm={8} md={6} lg={5} css={walletsListStyles.col}>
                {isPrimary ? (
                  <Badge.Ribbon
                    text={isPrimary ? 'Primary' : undefined}
                    color={isPrimary ? 'success' : 'orange'}
                  >
                    {walletCard}
                  </Badge.Ribbon>
                ) : (
                  walletCard
                )}
              </Col>
            );
          })
        )}
      </Row>
      <Row gutter={[22, 22]} css={walletsListStyles.headerRow}>
        <Typography.Title level={4}>
          <SolanaIcon /> Solana wallets
        </Typography.Title>
      </Row>
      <Row gutter={[22, 22]}>
        <Col xs={12} sm={8} md={6} lg={5}>
          <Card>
            <Flex align="center" vertical gap={12}>
              <Flex align="center" vertical gap={12}>
                <Avatar
                  size="large"
                  icon={<ClockCircleOutlined css={walletsListStyles.comingSoon.icon} />}
                  css={walletsListStyles.comingSoon.avatar}
                />
                <Flex vertical>
                  <Typography.Title level={5}>Coming Soon</Typography.Title>
                </Flex>
              </Flex>
              <Typography.Text type="secondary" css={{ textAlign: 'center' }}>
                Solana support is currently in progress.
              </Typography.Text>
            </Flex>
          </Card>
        </Col>
      </Row>
    </>
  );
}

const walletStyles = {
  link: css({
    color: tokenCssVars.colorPrimary,
    cursor: 'pointer',
    fontSize: '14px',
  }),
};

function Wallet({ address }: { address: Address }) {
  const copyToClipboard = useCopyToClipboard();

  return (
    <Card>
      <Flex align="center" justify="center" vertical gap={12} css={css({ height: '100%' })}>
        <Avatar src={getBlockieUrl(address)} size="large" />
        <Typography.Title level={5}>{shortenHash(address)}</Typography.Title>
        <Typography.Link
          css={walletStyles.link}
          onClick={async () => {
            await copyToClipboard(address, 'Address successfully copied');
          }}
        >
          Copy full address <ClipboardIcon />
        </Typography.Link>
      </Flex>
    </Card>
  );
}

const smartWalletStyles = {
  avatar: {
    common: css({
      backgroundColor: tokenCssVars.colorBgElevated,
    }),
    icon: {
      connected: css({
        color: tokenCssVars.colorSuccess,
        fontSize: '30px',
      }),
      disconnected: css({
        color: tokenCssVars.colorErrorActive,
        fontSize: '30px',
      }),
    },
  },
  status: {
    connected: css({
      color: tokenCssVars.colorSuccess,
    }),
    disconnected: css({
      color: tokenCssVars.colorError,
    }),
  },
  button: css({
    color: tokenCssVars.colorPrimary,
  }),
};

function SmartWallet({
  isConnected,
  smartWalletAddress,
}: {
  isConnected: boolean;
  smartWalletAddress: Address;
}) {
  const registerSmartWallet = useRegisterSmartWallet();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card>
      <Flex align="center" vertical gap={12}>
        <Avatar
          icon={
            <BoltFilledIcon
              css={
                isConnected
                  ? smartWalletStyles.avatar.icon.connected
                  : smartWalletStyles.avatar.icon.disconnected
              }
            />
          }
          size={48}
          css={smartWalletStyles.avatar.common}
        />
        <Typography.Title level={4}>Smart wallet</Typography.Title>
        <Badge
          status={isConnected ? 'success' : 'error'}
          text={
            <span
              css={
                isConnected
                  ? smartWalletStyles.status.connected
                  : smartWalletStyles.status.disconnected
              }
            >
              {isConnected ? 'Enabled' : 'Disconnected'}
            </span>
          }
        />
        {isConnected ? (
          <>
            <Button
              css={smartWalletStyles.button}
              onClick={() => {
                setIsOpen(true);
              }}
            >
              See details
            </Button>
            <SmartWalletModal
              isOpen={isOpen}
              smartWalletAddress={smartWalletAddress}
              onCancel={() => {
                setIsOpen(false);
              }}
            />
          </>
        ) : (
          <Button
            css={smartWalletStyles.button}
            onClick={() => {
              registerSmartWallet.mutate();
            }}
          >
            Connect
          </Button>
        )}
      </Flex>
    </Card>
  );
}

function SmartWalletModal({
  isOpen,
  smartWalletAddress,
  onCancel,
}: {
  isOpen: boolean;
  smartWalletAddress: Address;
  onCancel: () => void;
}) {
  const { linkPasskey, exportWallet } = usePrivy();

  return (
    <Modal
      open={isOpen}
      title="Smart wallet"
      onCancel={onCancel}
      footer={[
        <Button key="set-up-passkey" onClick={linkPasskey}>
          Set up passkey
        </Button>,
        <Button key="export-wallet" onClick={exportWallet}>
          Export wallet
        </Button>,
      ]}
    >
      <Typography.Paragraph>
        Ethos covers gas fees on smart wallets so you don’t have to pay for reviews, votes, or
        comments. This also removes the need to sign all transactions for reviews, votes and
        comments.
      </Typography.Paragraph>
      <Typography.Paragraph>
        Wallet address:{' '}
        <Typography.Text code copyable>
          {smartWalletAddress}
        </Typography.Text>
      </Typography.Paragraph>
    </Modal>
  );
}
