import { formatEth } from '@ethos/helpers';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { type ReactNode, useMemo } from 'react';
import { zeroAddress } from 'viem';
import { useCurrentUser } from 'contexts/current-user.context';
import { useVouchStats } from 'hooks/user/lookup';

type NavigationItem = {
  label: ReactNode;
  key: string;
  isActive: boolean;
  onClick?: () => void;
};

export function useHeaderNavigationItems(): NavigationItem[] {
  const { connectedAddress, connectedProfile } = useCurrentUser();
  const target = { address: connectedAddress ?? zeroAddress };
  const { data: vouchStats } = useVouchStats(target);
  const vouchBalance = vouchStats ? formatEth(vouchStats.staked.deposited, 'eth') : undefined;
  const hasProfile = Boolean(connectedProfile);
  const pathName = usePathname();

  const navigationItems = useMemo<NavigationItem[]>(
    () => [
      ...(hasProfile
        ? [
            {
              key: 'contribute',
              label: <Link href="/contribute">Contribute</Link>,
              isActive: pathName === '/contribute',
            },
          ]
        : []),
      {
        label: <Link href="/leaderboard">Leaderboard</Link>,
        key: 'leaderboard',
        isActive: pathName === '/leaderboard',
      },
      ...(hasProfile
        ? [
            {
              key: 'vouch-balance',
              isActive: pathName === '/profile/vouches',
              label: (
                <Link href="/profile/vouches">Vouch{vouchBalance ? ` · ${vouchBalance}` : ''}</Link>
              ),
            },
          ]
        : []),
    ],
    [vouchBalance, hasProfile, pathName],
  );

  return navigationItems;
}
