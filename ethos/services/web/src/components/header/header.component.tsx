'use client';

import { MenuOutlined } from '@ant-design/icons';
import { css } from '@emotion/react';
import { Layout, Flex, Button } from 'antd';
import Link from 'next/link';
import { zeroAddress } from 'viem';
import { Logo, LogoFull } from '../icons';
import { ConnectButton } from './connect-button/connect-button.component';
import { Notifications } from './notifications/notifications.component';
import { Rewards } from './rewards.component';
import { SearchBar } from './search/search.component';
import { useHeaderNavigationItems } from './use-header-navigation-items';
import { useMenuDrawer } from 'components/menu-drawer/menu.context';
import { tokenCssVars } from 'config/theme';
import { HEADER_HEIGHT } from 'constant/constants';
import { useContributorMode } from 'contexts/contributor-mode.context';
import { useCurrentUser } from 'contexts/current-user.context';
import { useVouchRewards } from 'hooks/user/lookup';
import { displayOnTabletOnlyCSS, hideOnMobileCSS, hideOnTabletOnlyCSS } from 'styles/responsive';

const { Header } = Layout;

const styles = {
  header: (isContributorModeOpen: boolean) =>
    css({
      position: 'sticky',
      height: `${HEADER_HEIGHT}px`,
      top: 0,
      zIndex: isContributorModeOpen ? 5 : 10,
    }),
  headerContent: css({
    height: '100%',
  }),
  logoLink: css({
    display: 'flex',
  }),
  logo: css([
    {
      color: tokenCssVars.colorText,
      marginLeft: '-6px',
      fontSize: '32px',
    },
    displayOnTabletOnlyCSS,
  ]),
  logoFull: css([
    {
      color: tokenCssVars.colorText,
      marginLeft: '-6px',
    },
    hideOnTabletOnlyCSS,
  ]),
  searchWrapper: css([
    {
      display: 'flex',
    },
    hideOnMobileCSS,
  ]),
  navigationWrapper: css([
    {
      display: 'contents',
    },
    hideOnMobileCSS,
  ]),
  navItem: (isActive?: boolean) => [
    navItemCss,
    {
      color: isActive ? tokenCssVars.colorTextBase : undefined,
    },
  ],
  menuButton: [
    css({
      fontSize: '20px',
      padding: '4px 8px',
      height: 'auto',
    }),
    hideOnMobileCSS,
  ],
};

const navItemCss = css({
  padding: 0,
  height: 'auto',
});

export function Navigation() {
  const { connectedAddress } = useCurrentUser();
  const { isContributorModeOpen } = useContributorMode();
  const { data: vouchRewards } = useVouchRewards({ address: connectedAddress ?? zeroAddress });
  const navigationItems = useHeaderNavigationItems();
  const { setIsOpen } = useMenuDrawer();

  return (
    <Header css={styles.header(isContributorModeOpen)}>
      <Flex gap={20} justify="space-between" align="center" css={styles.headerContent}>
        <Link href="/" css={styles.logoLink}>
          <Logo css={styles.logo} />
          <LogoFull css={styles.logoFull} />
        </Link>
        <SearchBar wrapperCSS={styles.searchWrapper} />
        <Flex align="center" gap="middle">
          <div css={styles.navigationWrapper}>
            {navigationItems.map((item) => (
              <Button
                key={item.key}
                onClick={item.onClick}
                type="link"
                css={styles.navItem(item.isActive)}
              >
                {item.label}
              </Button>
            ))}
          </div>
          {Number(vouchRewards?.rewards ?? 0) > 0 && <Rewards />}
          {connectedAddress && <Notifications />}
          {!connectedAddress && (
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => {
                setIsOpen(true);
              }}
              css={styles.menuButton}
            />
          )}
          <ConnectButton />
        </Flex>
      </Flex>
    </Header>
  );
}
