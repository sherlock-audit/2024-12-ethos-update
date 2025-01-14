import {
  ChromeOutlined,
  CodeOutlined,
  FireOutlined,
  QuestionCircleOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { css } from '@emotion/react';
import { useIsMobile } from '@ethos/common-ui';
import {
  chromeExtensionLink,
  ethosBlogLink,
  ethosDiscordLink,
  ethosHelpLink,
  ethosHomepageLink,
  ethosTwitterLink,
  ethosWhitepaperLink,
  privacyPolicyLink,
  termsOfServiceLink,
} from '@ethos/domain';
import { formatEth, shortenHash } from '@ethos/helpers';
import { useFeatureGate } from '@statsig/react-bindings';
import { Button, Drawer, Flex, type MenuProps, Skeleton, Tooltip, Typography, theme } from 'antd';
import Link from 'next/link';
import { zeroAddress } from 'viem';
import { useAccount, useBalance } from 'wagmi';
import { useMenuDrawer } from './menu.context';
import { isDevPageEnabled } from 'app/(root)/dev/_components/dev-page.utils';
import { UserAvatar } from 'components/avatar/avatar.component';
import { ThemeToggle } from 'components/header/theme-toggle.component';
import {
  LanguageIcon,
  TextIcon,
  WebIcon,
  SettingsIcon,
  LogoutIcon,
  LoginIcon,
  DiscordIcon,
  TwitterXIcon,
  InviteFilled,
  Wallet,
  CaretDownIcon,
  TrophyFilled,
} from 'components/icons';
import { tokenCssVars } from 'config/theme';
import { featureGates } from 'constant/feature-flags';
import { useCurrentUser } from 'contexts/current-user.context';
import { useRouteTo } from 'hooks/user/hooks';
import { useLoginEthosUser, useLogoutEthosUser, useSwitchChain } from 'hooks/user/privy.hooks';

const navItemCss = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
  cursor: 'pointer',
  padding: 0,
  gap: 8,
  height: 'auto',
  paddingBlock: 4,
  fontSize: 16,
  lineHeight: 1,
  color: tokenCssVars.colorTextBase,
  '&:hover': {
    opacity: 0.8,
  },
});

const iconCss = css({
  fontSize: 20,
  lineHeight: 1,
});

const socialLinkCss = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '8px',
  width: 48,
  height: 48,
  fontSize: 24,
  lineHeight: 1,
  backgroundColor: tokenCssVars.colorBgContainer,
  color: tokenCssVars.colorTextSecondary,
  '@media (min-width: 500px)': {
    width: 60,
    height: 60,
    fontSize: 28,
  },
});

const profileCss = {
  name: css({
    color: tokenCssVars.colorTextBase,
    fontSize: 16,
    lineHeight: 1.25,
    fontWeight: 'normal',
    maxWidth: 256,
  }),
  balance: css({
    fontSize: 14,
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  }),
  address: css({
    color: tokenCssVars.colorTextSecondary,
    fontSize: 14,
    lineHeight: 1.25,
    fontWeight: 'normal',
  }),
};

export function MenuDrawer() {
  const { isOpen, setIsOpen } = useMenuDrawer();
  const { connectedProfile, isConnected } = useCurrentUser();
  const isMobile = useIsMobile();
  const { value: isAdminPageEnabled } = useFeatureGate(featureGates.isAdminPageEnabled);
  const isDevLinkEnabled = isDevPageEnabled();
  const { token } = theme.useToken();

  const availableInvites = connectedProfile?.invitesAvailable ?? 0;

  function closeMenu() {
    setIsOpen(false);
  }

  const items = [
    ...(connectedProfile
      ? [
          {
            key: 'invite',
            label: <Link href="/invite">Invite · {availableInvites}</Link>,
            icon: <InviteFilled />,
          },
        ]
      : []),
    ...(isMobile
      ? [
          {
            key: 'leaderboard',
            label: <Link href="/leaderboard">Leaderboard</Link>,
            icon: <TrophyFilled />,
          },
        ]
      : []),
    {
      key: 'release-notes',
      label: <Link href="/release-notes">What’s new</Link>,
      icon: <FireOutlined />,
    },
    ...(isMobile
      ? []
      : [
          {
            label: (
              <Link href={chromeExtensionLink} target="_blank">
                Get the Chrome extension
              </Link>
            ),
            key: 'get-chrome',
            icon: <ChromeOutlined />,
          },
        ]),
    ...(connectedProfile
      ? [
          {
            key: 'settings',
            label: <Link href="/profile/settings">Settings</Link>,
            icon: <SettingsIcon />,
          },
        ]
      : []),
    {
      label: (
        <Link href={ethosHelpLink} target="_blank">
          Help
        </Link>
      ),
      icon: <QuestionCircleOutlined />,
      key: 'help',
    },
    ...(isAdminPageEnabled
      ? [
          {
            key: 'admin',
            label: <Link href="/admin">Admin</Link>,
            icon: <UserOutlined />,
          },
        ]
      : []),
    ...(isDevLinkEnabled
      ? [
          {
            key: 'dev',
            label: <Link href="/dev">Dev</Link>,
            icon: <CodeOutlined />,
          },
        ]
      : []),
  ] as const satisfies MenuProps['items'];

  return (
    <Drawer
      title={isConnected ? <MenuProfile /> : undefined}
      placement={isMobile ? 'left' : 'right'}
      open={isOpen}
      onClose={closeMenu}
      closeIcon={isMobile ? null : undefined}
      footer={<LegalLinks />}
      styles={{
        wrapper: {
          width: isMobile ? '82%' : 'auto',
        },
        footer: {
          padding: '16px',
        },
        body: {
          paddingTop: !isConnected ? token.paddingLG : 0,
        },
        header: {
          paddingBottom: isConnected ? undefined : '0px',
        },
      }}
    >
      <Flex vertical gap={16}>
        {items.map((item) => (
          <Button key={item.key} type="link" onClick={closeMenu} icon={item.icon} css={navItemCss}>
            {item.label}
          </Button>
        ))}
        <ThemeToggle labelCss={navItemCss} iconCss={iconCss} />
        <AuthButton />
        <SocialLinks />
      </Flex>
    </Drawer>
  );
}

const skeletonButtonCss = css({
  width: '100%',
});

function AuthButton() {
  const { isConnected, isReady, status } = useCurrentUser();
  const login = useLoginEthosUser();
  const logout = useLogoutEthosUser();
  const { chain } = useAccount();
  const switchChain = useSwitchChain();

  if (!isReady || status === 'connecting' || status === 'reconnecting') {
    return <Skeleton.Button active css={skeletonButtonCss} />;
  }

  if (!isConnected) {
    return (
      <Button type="primary" onClick={login} icon={<LoginIcon css={iconCss} />}>
        Login
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
      >
        Wrong network
      </Button>
    );
  }

  return (
    <Button
      type="link"
      icon={<LogoutIcon css={iconCss} />}
      onClick={logout}
      css={[navItemCss, { color: tokenCssVars.colorError }]}
    >
      Logout
    </Button>
  );
}

function MenuProfile() {
  const { connectedActor, connectedAddress } = useCurrentUser();
  const { setIsOpen } = useMenuDrawer();
  const target = { address: connectedAddress ?? zeroAddress };
  const { data: balance } = useBalance(target);
  const routeTo = useRouteTo(target).data;

  function closeMenu() {
    setIsOpen(false);
  }

  return (
    <Flex gap={12} align="flex-start">
      <UserAvatar
        actor={connectedActor}
        size={50}
        renderAsLink={false}
        showHoverCard={false}
        scoreVariant="drawer"
      />
      <Flex vertical gap={6}>
        <Typography.Text css={profileCss.name} ellipsis={{ tooltip: true }}>
          {connectedActor.name}
        </Typography.Text>
        <Flex gap={12}>
          <Tooltip title="Wallet balance">
            <Typography.Text css={profileCss.balance} type="secondary">
              <Wallet />
              {formatEth(balance?.value ?? 0n, 'wei', {
                maximumFractionDigits: 2,
              })}
            </Typography.Text>
          </Tooltip>
          <Tooltip title="Wallet address">
            <Typography.Text
              css={profileCss.address}
              copyable={{ text: connectedActor.primaryAddress }}
            >
              {shortenHash(connectedActor.primaryAddress)}
            </Typography.Text>
          </Tooltip>
        </Flex>
        <Flex gap={8}>
          <Link href={routeTo.profile}>
            <Button type="primary" onClick={closeMenu}>
              My profile
            </Button>
          </Link>
          <Link href={routeTo.score}>
            <Button onClick={closeMenu}>My score</Button>
          </Link>
        </Flex>
      </Flex>
    </Flex>
  );
}

const socialLinks = [
  {
    icon: <TwitterXIcon />,
    link: ethosTwitterLink,
    title: 'Twitter',
  },
  {
    icon: <DiscordIcon />,
    link: ethosDiscordLink,
    title: 'Discord',
  },
  {
    icon: <LanguageIcon />,
    link: ethosHomepageLink,
    title: 'Ethos website',
  },
  {
    icon: <WebIcon />,
    link: ethosBlogLink,
    title: 'Blog',
  },
  {
    icon: <TextIcon />,
    link: ethosWhitepaperLink,
    title: 'Whitepaper',
  },
];

const socialLinkContainerCss = css({
  marginTop: 8,
  gap: 8,
  maxWidth: 400,
  '@media (min-width: 768px)': {
    gap: 12,
  },
});

function SocialLinks() {
  return (
    <Flex justify="space-between" css={socialLinkContainerCss}>
      {socialLinks.map(({ icon, link, title }) => (
        <Tooltip title={title} key={title}>
          <Link href={link} target="_blank" rel="noreferrer" css={socialLinkCss}>
            {icon}
          </Link>
        </Tooltip>
      ))}
    </Flex>
  );
}

const legalLinkCss = css({
  color: tokenCssVars.colorTextSecondary,
});

export function LegalLinks() {
  return (
    <Flex vertical gap={4} align="center">
      <Link href={termsOfServiceLink} target="_blank" css={legalLinkCss}>
        Terms & Conditions
      </Link>
      <Link href={privacyPolicyLink} target="_blank" rel="noreferrer" css={legalLinkCss}>
        Privacy Policy
      </Link>
    </Flex>
  );
}
