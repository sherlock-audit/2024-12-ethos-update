import { MenuOutlined } from '@ant-design/icons';
import { Link, NavLink } from '@remix-run/react';
import { Layout, Flex, Tooltip, Button } from 'antd';
import clsx from 'clsx';
import { LogoHeaderIcon, LogoHeaderTextIcon } from '../icons/header-logo.tsx';
import { NotificationIcon } from '../icons/notification.tsx';
import { LoginButton, useHoldingsBalance } from './login-button.component.tsx';
import { useMenuDrawer } from './menu.context.tsx';
import { SearchBar } from '~/components/search/search.component.tsx';
import { useLoggedInUser } from '~/hooks/marketUser.tsx';

const { Header } = Layout;

const navigationItems = [
  { label: 'Markets', link: '/' },
  { label: 'Rewards', link: '/rewards' },
  { label: 'Holdings', link: '/holdings' },
] as const;

export function AppHeader() {
  const holdingsBalance = useHoldingsBalance();
  const { openMenu } = useMenuDrawer();
  const { user } = useLoggedInUser();

  return (
    <Header className="flex sticky z-10 my-auto h-16 px-4 lg:px-12 bg-antd-colorBgLayout xl:w-full xl:max-w-[2000px] xl:mx-auto">
      <Flex gap={16} justify="space-between" align="center" className="grow">
        <Flex gap={16} align="center" justify="start">
          <Link to="/" className="flex items-center justify-start gap-[15px]">
            <LogoHeaderIcon className="text-antd-colorText" />
            <LogoHeaderTextIcon className="text-antd-colorText" />
          </Link>
        </Flex>
        <SearchBar className="max-md:hidden" />
        <Flex className="flex items-center gap-6 justify-end">
          {navigationItems?.map((item) => (
            <NavLink
              to={item.link}
              key={item.label}
              className={({ isActive }) =>
                clsx('text-sm max-md:hidden', {
                  'text-antd-colorTextBase font-semibold': isActive,
                  'text-antd-colorTextSecondary': !isActive,
                })
              }
            >
              {item.label}
              {item.label === 'Holdings' && holdingsBalance && <> · {holdingsBalance}</>}
            </NavLink>
          ))}
          <Tooltip title="Coming Soon">
            <Button
              type="link"
              className="size-auto px-0 text-antd-colorTextSecondary text-[26px] leading-none"
              icon={<NotificationIcon />}
            >
              <span className="sr-only">Notifications</span>
            </Button>
          </Tooltip>
          {!user && (
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={openMenu}
              className="text-[20px] py-1 px-2 h-auto max-md:hidden"
            />
          )}
          <LoginButton authenticatedClassName="max-md:hidden" />
        </Flex>
      </Flex>
    </Header>
  );
}
