import { formatEth } from '@ethos/helpers';
import { NavLink } from '@remix-run/react';
import { Button } from 'antd';
import clsx from 'clsx';
import { MarketUserAvatar } from '../avatar/user-avatar.component.tsx';
import { GlobalLoading } from '../global-loading.tsx';
import { useMenuDrawer } from '../header/menu.context.tsx';
import { CloseIcon } from '../icons/close.tsx';
import { EthosStarIcon } from '../icons/ethos-star.tsx';
import { HandCoinIcon } from '../icons/hand-coin.tsx';
import { MarketsIcon } from '../icons/markets-icon.tsx';
import { MenuIcon } from '../icons/menu.tsx';
import { SearchIcon } from '../icons/search.tsx';
import { useHoldingsBalanceByAddress } from '~/hooks/market.tsx';
import { useLoggedInUser } from '~/hooks/marketUser.tsx';
import { cn } from '~/utils/cn.ts';

const navItemClass =
  'flex flex-col items-center gap-[2px] text-xs py-4 px-2 flex-1 h-auto w-full text-inherit';
const menuIconClass = 'text-2xl leading-none';

export function MobileNavbar() {
  const { user } = useLoggedInUser();
  const balance = useHoldingsBalanceByAddress(user?.address);
  const { openMenu, isMenuOpen } = useMenuDrawer();

  const footerItems = [
    {
      key: 'home',
      label: 'Home',
      icon: <MarketsIcon className={menuIconClass} />,
      link: '/',
    },
    {
      key: 'rewards',
      label: 'Rewards',
      icon: <EthosStarIcon className={menuIconClass} />,
      link: '/rewards',
    },
    {
      key: 'search',
      label: 'Search',
      icon: <SearchIcon className={menuIconClass} />,
      link: '/search',
    },
    {
      key: 'holdings',
      label: balance
        ? formatEth(balance?.totalValue ?? 0n, 'wei', { maximumFractionDigits: 2 })
        : 'Holdings',
      icon: <HandCoinIcon className={menuIconClass} />,
      link: '/holdings',
    },
  ];

  return (
    <nav className="fixed md:hidden bottom-0 inset-x-0 pb-safe-half px-safe bg-antd-colorBgContainer shadow-mobileFooter">
      <GlobalLoading />
      <ul className="p-0 flex justify-stretch items-end list-none m-0 [&>li]:flex-1">
        {footerItems.map((item) => (
          <li key={item.key}>
            <NavLink
              to={item.link}
              className={({ isActive }) =>
                clsx({
                  'text-antd-colorTextBase': isActive,
                  'text-antd-colorTextTertiary': !isActive,
                })
              }
            >
              <Button type="link" icon={item.icon} className={navItemClass}>
                {item.label}
              </Button>
            </NavLink>
          </li>
        ))}
        <li>
          <Button
            type="link"
            className={navItemClass}
            onClick={openMenu}
            icon={
              isMenuOpen ? (
                <CloseIcon className={cn(menuIconClass, 'mb-2')} />
              ) : user ? null : (
                <MenuIcon className={menuIconClass} />
              )
            }
          >
            {isMenuOpen ? (
              <span className="sr-only">Close</span>
            ) : user ? (
              <MarketUserAvatar
                avatarUrl={user.avatarUrl}
                address={user.address}
                ethosScore={user.ethosInfo.score}
                size="xs"
                showLink={false}
                rootClassName="mb-0.5 -mt-0.5"
              />
            ) : (
              <>Menu</>
            )}
          </Button>
        </li>
      </ul>
    </nav>
  );
}
