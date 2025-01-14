import { extractEchoErrorMessage } from '@ethos/echo-client';
import { useLinkAccount, useLogin, useLogout, usePrivy } from '@privy-io/react-auth';
import { useMutation } from '@tanstack/react-query';
import { App } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { useDisconnect, useSwitchChain as useSwitchChainInternal } from 'wagmi';
import { wagmiConfig } from 'config/privy';
import { useCurrentUser } from 'contexts/current-user.context';
import { useCreatePrivyLogin } from 'hooks/api/web.hooks';

const { useApp } = App;
const targetChainId = wagmiConfig.chains[0].id;

export function useLoginEthosUser(onComplete?: () => void) {
  const { notification } = useApp();
  const { authenticated } = usePrivy();
  const { smartWalletAddress } = useCurrentUser();
  const [isComplete, setIsComplete] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const { login } = useLogin({
    onComplete(_user, _isNewUser, wasAlreadyAuthenticated) {
      if (wasAlreadyAuthenticated) return;
      if (onComplete) onComplete();

      setIsComplete(true);
      setIsLoggingIn(false);
    },
  });
  const logout = useLogoutEthosUser({
    onSuccess() {
      // useLogout hook is global which means that multiple useLogout hooks are
      // mounted at the same time, the onSuccess callback is called in each of
      // them after the user is logged out. Because of this, this callback is
      // triggered when the user clicks "Log out" button and we prompt the usr
      // to log in again. This is not expected behavior.
      // We use this state variable to run this callback only when login was
      // called from this hook.
      if (isLoggingIn) {
        login();
      }
    },
  });
  const createPrivyLogin = useCreatePrivyLogin({
    onError() {
      // Destroy Privy session if we failed to sync the data with BE. This will
      // force the user to log in again.
      logout();
    },
  });

  // The smart wallet creation process has a slight delay.
  // This workaround ensures we wait for its creation,
  // allowing us to send a request with the correct identity token.
  // As long as the smart wallet address is available, identity token is also
  // updated.
  useEffect(() => {
    if (smartWalletAddress && isComplete) {
      setIsComplete(false);
      createPrivyLogin.mutate();
    }
  }, [createPrivyLogin, isComplete, smartWalletAddress]);

  const { error: createPrivyLoginError } = createPrivyLogin;

  useEffect(() => {
    if (!createPrivyLoginError) return;

    notification.error({
      message: 'Failed to create Ethos login',
      description: extractEchoErrorMessage(createPrivyLoginError),
    });
  }, [createPrivyLoginError, notification]);

  // The user might get into a state where they have a valid Privy session but
  // the wallet got disconnected. E.g., Metamask prompts to enter the password
  // after browser restart or the user manually disconnected the wallet from
  // Ethos.
  // In this case, we force the user to log out and then logout function runs
  // "login" function onSuccess.
  return () => {
    setIsLoggingIn(true);

    if (authenticated) {
      console.warn('Privy session is valid but the wallet got disconnected. Force logging out...');
      logout();
    } else {
      login();
    }
  };
}

export function useSwitchChain() {
  const { switchChain } = useSwitchChainInternal();

  return () => {
    switchChain({ chainId: targetChainId });
  };
}

export function useLogoutEthosUser({ onSuccess }: { onSuccess?: () => void } = {}) {
  const { logout } = useLogout({
    onSuccess() {
      onSuccess?.();
    },
  });
  const { disconnect } = useDisconnect();

  return useCallback(() => {
    logout();
    disconnect();
  }, [disconnect, logout]);
}

export function useLinkTwitter({ onSuccess }: { onSuccess?: () => void } = {}) {
  const createPrivyLogin = useCreatePrivyLogin({ onSuccess });
  const { linkTwitter } = useLinkAccount({
    onSuccess() {
      // Sync state of Privy linked accounts to BE once the Twitter is connected
      createPrivyLogin.mutate();
    },
  });

  return useMutation({
    async mutationFn() {
      linkTwitter();
    },
  });
}

export function useUnlinkTwitter() {
  const { unlinkTwitter, user } = usePrivy();

  return useMutation({
    async mutationFn() {
      if (user?.twitter) {
        await unlinkTwitter(user.twitter.subject);
      } else {
        // eslint-disable-next-line no-console
        console.info('No Twitter account to unlink');
      }
    },
  });
}
