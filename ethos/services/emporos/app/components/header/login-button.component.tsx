import { formatEth } from '@ethos/helpers';
import { Button } from 'antd';
import { MarketUserAvatar } from '../avatar/user-avatar.component.tsx';
import { useMenuDrawer } from './menu.context.tsx';
import { useHoldingsBalanceByAddress } from '~/hooks/market.tsx';
import { useLoginMarketUser, useLoggedInUser } from '~/hooks/marketUser.tsx';
import { cn } from '~/utils/cn.ts';

export function LoginButton({
  loginClassName,
  authenticatedClassName,
}: {
  loginClassName?: string;
  authenticatedClassName?: string;
}) {
  const { user } = useLoggedInUser();
  const login = useLoginMarketUser();
  const { openMenu } = useMenuDrawer();

  if (!user) {
    return (
      <Button
        type="primary"
        onClick={() => {
          login();
        }}
        className={loginClassName}
      >
        Login
      </Button>
    );
  }

  return (
    <Button
      variant="text"
      type="link"
      className={cn('size-auto p-0', authenticatedClassName)}
      onClick={openMenu}
    >
      <MarketUserAvatar
        avatarUrl={user.avatarUrl ?? undefined}
        address={user.address}
        size={40}
        ethosScore={user.ethosInfo.score}
        showLink={false}
      />
    </Button>
  );
}

export function useHoldingsBalance() {
  const { user } = useLoggedInUser();
  const balance = useHoldingsBalanceByAddress(user?.address);

  if (!balance) {
    return null;
  }

  return formatEth(balance.totalValue, 'wei', { maximumFractionDigits: 2 });
}
