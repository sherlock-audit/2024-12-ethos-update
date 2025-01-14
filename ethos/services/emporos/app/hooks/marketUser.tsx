import { formatEth } from '@ethos/helpers';
import {
  useLogin,
  usePrivy,
  type Twitter as PrivyTwitterUser,
  useWallets,
  getEmbeddedConnectedWallet,
} from '@privy-io/react-auth';
import { useFetcher, useRevalidator } from '@remix-run/react';
import { useCallback, useEffect, useRef } from 'react';
import { getAddress } from 'viem';
import { useBalance } from 'wagmi';
import { useMatchesData } from './use-match-data.ts';
import { type RootLoaderData } from '~/root.tsx';
import { type TwitterProfileData } from '~/routes/auth.privy-login.tsx';

export function useAuthenticate() {
  const { ready, authenticated, login } = usePrivy();
  const { ready: isWalletsReady } = useWallets();
  const isReady = ready && isWalletsReady;

  return { isReady, authenticated, login };
}

function useSaveMarketUser(onComplete?: () => void) {
  const { state, submit } = useFetcher({ key: 'save-user' });
  const submitInvoked = useRef(false);

  const saveMarketUser = useCallback(
    (twitter: PrivyTwitterUser) => {
      submitInvoked.current = true;
      const userData: TwitterProfileData = {
        id: twitter.subject,
        username: twitter.username,
        name: twitter.name,
        profilePictureUrl: twitter.profilePictureUrl,
      };

      submit(userData, {
        method: 'post',
        encType: 'application/json',
        action: '/auth/privy-login',
      });
    },
    [submit],
  );
  useEffect(() => {
    if (state === 'idle' && submitInvoked.current) {
      onComplete?.();
      submitInvoked.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return { state, saveMarketUser };
}

export function useLoginMarketUser() {
  const { logout } = usePrivy();
  const revalidator = useRevalidator();
  const { saveMarketUser } = useSaveMarketUser(revalidator.revalidate);

  const { login } = useLogin({
    onComplete(user, _isNewUser, wasAlreadyAuthenticated) {
      if (wasAlreadyAuthenticated) return;
      if (!user.twitter) {
        logout();
        revalidator.revalidate();

        return;
      }
      saveMarketUser(user.twitter);
    },
  });

  return login;
}

export function useLogoutMarketUser() {
  const { logout } = usePrivy();
  const revalidator = useRevalidator();

  function handleLogout() {
    logout().then(() => {
      revalidator.revalidate();
    });
  }

  return handleLogout;
}

export function useConnectedWallet() {
  const { ready, user } = usePrivy();

  const { ready: isWalletsReady, wallets } = useWallets();
  const wallet = getEmbeddedConnectedWallet(wallets);

  return { user, wallet, isReady: ready && isWalletsReady };
}

export function useLoggedInUser() {
  const revalidator = useRevalidator();
  const { user: connectedWalletUser, isReady: isConnectedWalletReady } = useConnectedWallet();
  const data = useMatchesData<RootLoaderData>('root');

  useEffect(() => {
    if (isConnectedWalletReady && connectedWalletUser && data?.privyUser === null) {
      // https://docs.privy.io/guide/react/configuration/cookies#server-side-rendering
      // If the privy client has a connected user but the root loader returned no privy user,
      // then the SSR request had an expired token.
      // We revalidate the page so that the root loader will use the refreshed token in the privy client sdk
      // and return a privy user.
      revalidator.revalidate();
    }
  }, [data?.privyUser, connectedWalletUser, isConnectedWalletReady, revalidator]);

  if (!data?.privyUser) {
    return { user: null };
  }

  return { user: data.privyUser };
}

export function useUserBalance(formatOptions?: Intl.NumberFormatOptions) {
  const { wallets } = useWallets();
  const wallet = getEmbeddedConnectedWallet(wallets);

  const {
    data: balance,
    isPending,
    isError,
  } = useBalance({
    address: wallet ? getAddress(wallet.address) : undefined,
  });

  return {
    value: balance?.value ?? 0n,
    formattedValue: formatEth(balance?.value ?? 0n, 'wei', formatOptions),
    isPending,
    isError,
  };
}
