import { MenuOutlined, SearchOutlined } from '@ant-design/icons';
import { css } from '@emotion/react';
import { Button, Tooltip } from 'antd';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { UserAvatar } from 'components/avatar/avatar.component';
import { SearchBarMobile } from 'components/header/search/search-mobile.component';
import { Close, EthosStar, Logo, VouchFilled } from 'components/icons';
import { useMenuDrawer } from 'components/menu-drawer/menu.context';
import { tokenCssVars } from 'config/theme';
import { useCurrentUser } from 'contexts/current-user.context';
import { useThemeMode } from 'contexts/theme-manager.context';

const navItemCss = css({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '2px',
  fontSize: '0.75rem',
  color: tokenCssVars.colorTextTertiary,
  padding: '0.5rem 0.5rem',
  flex: 1,
  height: 'auto',
  width: '100%',
});

const navCss = css({
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  paddingTop: '4px',
  paddingBottom: 'env(safe-area-inset-bottom)',
  backgroundColor: tokenCssVars.colorBgContainer,
  '@media (min-width: 768px)': {
    display: 'none',
  },
});

const navBoxShadowCss = {
  light: css({
    boxShadow: '0px 4px 36.4px 0px rgba(0, 0, 0, 0.35)',
  }),
  dark: css({
    boxShadow: '0px 4px 24px -8px rgba(0, 0, 0, 0.8)',
  }),
};

const iconCss = css({
  fontSize: 24,
  lineHeight: 1,
});

const closeIconCss = css({
  marginBottom: '10px',
});

const ulCss = css({
  padding: 0,
  display: 'flex',
  justifyContent: 'stretch',
  alignItems: 'flex-end',
  listStyle: 'none',
  margin: 0,
  '& > li': {
    flex: 1,
  },
});

export function MobileNavbar() {
  const { setIsOpen, isOpen } = useMenuDrawer();
  const { connectedProfile, connectedActor } = useCurrentUser();
  const pathname = usePathname();
  const mode = useThemeMode();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const footerItems = [
    {
      key: 'home',
      link: '/',
      icon: <Logo css={iconCss} />,
      label: 'Home',
    },
    {
      key: 'contribute',
      label: 'Contribute',
      icon: <EthosStar css={iconCss} />,
      link: '/contribute',
    },
    {
      key: 'search',
      label: 'Search',
      icon: <SearchOutlined css={iconCss} />,
      onClick: () => {
        setIsSearchOpen(true);
      },
    },
    {
      key: 'vouches',
      icon: <VouchFilled css={iconCss} />,
      link: '/profile/vouches',
      label: 'Vouches',
    },
  ];

  return (
    <>
      <nav css={[navCss, navBoxShadowCss[mode]]}>
        <ul css={ulCss}>
          {footerItems.map((item) => {
            return (
              <li key={item.key}>
                {item.link ? (
                  <Link href={item.link} passHref>
                    <Button
                      type="link"
                      icon={item.icon}
                      css={[
                        navItemCss,
                        {
                          color: pathname === item.link ? tokenCssVars.colorTextBase : undefined,
                        },
                      ]}
                    >
                      {item.label}
                    </Button>
                  </Link>
                ) : (
                  <Button type="link" icon={item.icon} css={[navItemCss]} onClick={item.onClick}>
                    {item.label}
                  </Button>
                )}
              </li>
            );
          })}
          <li>
            {isOpen ? (
              <Tooltip title="Close drawer">
                <Button
                  type="link"
                  css={navItemCss}
                  onClick={() => {
                    setIsOpen(false);
                  }}
                  icon={<Close css={[iconCss, closeIconCss]} />}
                />
              </Tooltip>
            ) : (
              <Button
                type="link"
                css={navItemCss}
                onClick={() => {
                  setIsOpen(true);
                }}
                icon={connectedProfile ? undefined : <MenuOutlined css={iconCss} />}
              >
                {connectedProfile ? (
                  <UserAvatar
                    actor={connectedActor}
                    size={40}
                    renderAsLink={false}
                    showHoverCard={false}
                    wrapperCSS={css`
                      margin-bottom: 10px;
                    `}
                  />
                ) : (
                  <>Menu</>
                )}
              </Button>
            )}
          </li>
        </ul>
      </nav>
      <SearchBarMobile
        open={isSearchOpen}
        onClose={() => {
          setIsSearchOpen(false);
        }}
      />
    </>
  );
}
