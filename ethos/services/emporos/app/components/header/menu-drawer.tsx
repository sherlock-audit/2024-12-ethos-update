import { useIsMobile } from '@ethos/common-ui';
import {
  ethosBlogLink,
  ethosDiscordLink,
  ethosHelpLink,
  ethosHomepageLink,
  ethosTwitterLink,
  ethosWhitepaperLink,
  privacyPolicyLink,
  termsOfServiceLink,
} from '@ethos/domain';
import { webUrlMap } from '@ethos/env';
import { shortenHash } from '@ethos/helpers';
import { Link, NavLink } from '@remix-run/react';
import { Button, Drawer, Flex, Tooltip, Typography } from 'antd';
import clsx from 'clsx';
import { MarketUserAvatar } from '../avatar/user-avatar.component.tsx';
import { DiscordIcon } from '../icons/discord.tsx';
import { HelpOutlineIcon } from '../icons/help-outline.tsx';
import { LanguageIcon } from '../icons/language.tsx';
import { LoginIcon } from '../icons/login.tsx';
import { TextIcon } from '../icons/text.tsx';
import { TwitterXIcon } from '../icons/twitter-x.tsx';
import { WalletIcon } from '../icons/wallet.tsx';
import { WebIcon } from '../icons/web.tsx';
import { useMenuDrawer } from './menu.context.tsx';
import { ThemeToggle } from './theme-toggle.component.tsx';
import { LogoutIcon } from '~/components/icons/logout.tsx';
import { SettingsIcon } from '~/components/icons/settings.tsx';
import { useEnvironment } from '~/hooks/env.tsx';
import {
  useLoginMarketUser,
  useLogoutMarketUser,
  useLoggedInUser,
  useUserBalance,
} from '~/hooks/marketUser.tsx';
import { type MarketUser } from '~/types/user.ts';
import { cn } from '~/utils/cn.ts';
import { removeMentionFromUsername } from '~/utils/username-utils.tsx';

const navItemClass =
  'flex items-center gap-1 size-auto justify-start p-0 text-antd-colorTextBase hover:opacity-80';
const iconClass = 'text-xl leading-none';

export function MenuDrawer() {
  const { isMenuOpen, closeMenu } = useMenuDrawer();
  const { user } = useLoggedInUser();
  const isMobile = useIsMobile();

  return (
    <Drawer
      title={user ? <MenuProfile user={user} /> : undefined}
      placement={isMobile ? 'left' : 'right'}
      open={isMenuOpen}
      onClose={closeMenu}
      closeIcon={isMobile ? null : undefined}
      footer={<LegalLinks />}
      classNames={{
        wrapper: isMobile ? 'w-[82%]' : 'w-auto',
        footer: 'p-4',
        header: clsx(!user && 'pb-0'),
        body: clsx(!user && !isMobile && 'pt-0'),
      }}
    >
      <Flex vertical gap={24}>
        <NavLink
          to="/settings"
          className={({ isActive }) => cn(navItemClass, isActive && 'text-antd-colorPrimary')}
          onClick={closeMenu}
        >
          <SettingsIcon className={iconClass} />
          Settings
        </NavLink>
        <Link to={ethosHelpLink} target="_blank" rel="noreferrer" className={navItemClass}>
          <HelpOutlineIcon className={iconClass} />
          Help
        </Link>
        <ThemeToggle labelClass={navItemClass} iconClass={iconClass} />
        <AuthButton />
        <SocialLinks />
      </Flex>
    </Drawer>
  );
}

function AuthButton() {
  const { user } = useLoggedInUser();
  const login = useLoginMarketUser();
  const logout = useLogoutMarketUser();

  if (!user) {
    return (
      <Button type="primary" onClick={login} icon={<LoginIcon className={iconClass} />}>
        Login
      </Button>
    );
  }

  return (
    <Button
      type="link"
      onClick={logout}
      className={cn(navItemClass, 'text-antd-colorError')}
      icon={<LogoutIcon className={iconClass} />}
    >
      Logout
    </Button>
  );
}

function MenuProfile({ user }: { user: NonNullable<MarketUser> }) {
  const { closeMenu } = useMenuDrawer();
  const environment = useEnvironment();

  const { formattedValue } = useUserBalance({
    maximumFractionDigits: 3,
  });

  return (
    <Flex gap={12} align="flex-start">
      <MarketUserAvatar
        avatarUrl={user.avatarUrl}
        address={user.address}
        ethosScore={user.ethosInfo.score}
        size={50}
        scoreSize="xs"
        showLink={false}
      />
      <Flex vertical gap={6}>
        <Typography.Text
          className="text-antd-colorTextBase text-base/5 font-normal max-w-64"
          ellipsis={{ tooltip: true }}
        >
          {user.name}
        </Typography.Text>
        <Flex gap={12}>
          <Tooltip title="Wallet balance">
            <Typography.Text className="text-antd-colorTextSecondary text-sm/5 font-normal flex items-center gap-1">
              <WalletIcon />
              {formattedValue}
            </Typography.Text>
          </Tooltip>
          <Tooltip title="Wallet address">
            <Typography.Text
              className="text-antd-colorTextSecondary text-sm/5 font-normal"
              copyable={{ text: user.address }}
            >
              {shortenHash(user.address)}
            </Typography.Text>
          </Tooltip>
        </Flex>
        <Flex gap={8} align="center">
          <Link to={`/profile/${user.address}`}>
            <Button type="primary" onClick={closeMenu}>
              My profile
            </Button>
          </Link>
          <Link
            to={`${webUrlMap[environment]}/profile/x/${removeMentionFromUsername(user.username)}`}
            target="_blank"
            rel="noreferrer"
          >
            <Button>Ethos Profile</Button>
          </Link>
        </Flex>
      </Flex>
    </Flex>
  );
}

const socialLinks = [
  {
    icon: <TwitterXIcon className={iconClass} />,
    link: ethosTwitterLink,
    title: 'Twitter',
  },
  {
    icon: <DiscordIcon className={iconClass} />,
    link: ethosDiscordLink,
    title: 'Discord',
  },
  {
    icon: <LanguageIcon className={iconClass} />,
    link: ethosHomepageLink,
    title: 'Ethos website',
  },
  {
    icon: <WebIcon className={iconClass} />,
    link: ethosBlogLink,
    title: 'Ethos blog',
  },
  {
    icon: <TextIcon className={iconClass} />,
    link: ethosWhitepaperLink,
    title: 'Whitepaper',
  },
];

function SocialLinks() {
  return (
    <Flex justify="space-between" className="max-w-96 gap-2 msm:gap-3">
      {socialLinks.map(({ icon, link, title }) => (
        <Tooltip title={title} key={title}>
          <Link
            to={link}
            target="_blank"
            rel="noreferrer"
            className={clsx('flex items-center justify-center rounded-lg')}
          >
            <Button
              type="default"
              icon={icon}
              className={cn(
                'size-12 text-2xl msm:size-[60px] msm:text-[28px] bg-antd-colorBgContainer text-antd-colorTextSecondary',
                '[&_.anticon]:text-[length:inherit]',
              )}
            >
              <span className="sr-only">{title}</span>
            </Button>
          </Link>
        </Tooltip>
      ))}
    </Flex>
  );
}

export function LegalLinks() {
  return (
    <Flex vertical gap={4} align="center">
      <Link
        to={termsOfServiceLink}
        target="_blank"
        className="text-antd-colorTextSecondary"
        rel="noreferrer"
      >
        Terms & Conditions
      </Link>
      <Link
        to={privacyPolicyLink}
        target="_blank"
        rel="noreferrer"
        className="text-antd-colorTextSecondary"
      >
        Privacy Policy
      </Link>
    </Flex>
  );
}
