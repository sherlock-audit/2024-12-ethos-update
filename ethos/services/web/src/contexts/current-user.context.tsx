import { type ProfileId } from '@ethos/blockchain-manager';
import { type EthosUserTarget } from '@ethos/domain';
import { isAddressEqualSafe, isValidAddress } from '@ethos/helpers';
import { getEmbeddedConnectedWallet, usePrivy, type User, useWallets } from '@privy-io/react-auth';
import { createContext, useContext, useEffect, useMemo, type PropsWithChildren } from 'react';
import { getAddress, zeroAddress, type Address } from 'viem';
import { useAccount } from 'wagmi';
import { placeholderActor, useActor } from 'hooks/user/activities';
import { useAttestations, useProfile, useProfileAddresses } from 'hooks/user/lookup';
import { useLogoutEthosUser } from 'hooks/user/privy.hooks';

type CurrentUser = {
  /**
   * Active connected wallet address
   */
  connectedAddress: Address | undefined;
  /**
   * Whether the wallet provider is initialized and wallet connected
   */
  isConnected: boolean;
  /**
   * Current wallet connection status
   * - `connecting` — attempting to establish connection.
   * - `reconnecting` — attempting to re-establish connection to one or more connectors.
   * - `connected` — at least one connector is connected.
   * - `disconnected` — no connection to any connector.
   */
  status: ReturnType<typeof useAccount>['status'];
  /**
   * Whether the `PrivyProvider` and wallet provider are ready to be used. We
   * should wait for this to be true before using values such as `authenticated`
   * and `user` from `usePrivy()`.
   */
  isReady: boolean;
  /**
   * Detected smart wallet address.
   * @note Not necessary connected to the current's user Ethos profile
   */
  smartWalletAddress?: Address;
  /**
   * Whether the current user has a smart wallet connected to the Ethos profile
   */
  isSmartWalletConnected: boolean;
  /**
   * Detected embedded wallet address.
   */
  embeddedWalletAddress?: Address;
  /**
   * Ethos profile of the connected address
   */
  connectedProfile: ReturnType<typeof useProfile>['data'];
  /**
   * Whether the connected profile addresses are loading
   */
  isLoadingConnectedProfileAddresses: boolean;
  /**
   * Addresses connected to the current Ethos profile
   */
  connectedProfileAddresses: Address[];
  /**
   * Primary address of the connected Ethos profile
   */
  connectedProfilePrimaryAddress?: Address;
  /**
   * Whether the connected profile is loading
   */
  isConnectedProfileLoading: boolean;
  /**
   * Actor of the connected profile. Includes actor name, avatar, description, etc.
   */
  connectedActor: ReturnType<typeof useActor>;
};

const emptyTarget = { profileId: 0 };

const CurrentUserContext = createContext<CurrentUser>({
  connectedAddress: undefined,
  isConnected: false,
  status: 'connecting',
  isReady: false,
  isSmartWalletConnected: false,
  connectedProfile: undefined,
  isConnectedProfileLoading: false,
  connectedProfileAddresses: [],
  connectedProfilePrimaryAddress: undefined,
  isLoadingConnectedProfileAddresses: false,
  connectedActor: placeholderActor(emptyTarget),
});

export function CurrentUserProvider({ children }: PropsWithChildren) {
  const { address, status } = useAccount();
  const { authenticated, ready, user } = usePrivy();
  const { wallets, ready: isWalletsReady } = useWallets();
  const logout = useLogoutEthosUser();

  const connectedAddress =
    address && user?.linkedAccounts && checkIfAddressBelongsToPrivy(user.linkedAccounts, address)
      ? address
      : undefined;
  const addressTarget = { address: connectedAddress ?? zeroAddress };

  const { data: connectedProfile, isPending: isConnectedProfileLoading } = useProfile(
    addressTarget,
    false,
  );
  const { data: profileAddresses, isPending: isLoadingConnectedProfileAddresses } =
    useProfileAddresses(addressTarget);
  const connectedActor = useActor(
    connectedProfile
      ? { profileId: connectedProfile.id }
      : connectedAddress
        ? addressTarget
        : emptyTarget,
  );

  const connectedProfileAddresses = profileAddresses?.allAddresses ?? [];
  const isConnected = authenticated && Boolean(connectedAddress) && status === 'connected';

  useEffect(() => {
    if (!user?.linkedAccounts?.length || !address) return;

    // Log out if the currently connected wallet is not a part of the current
    // Privy session. It happens when the user connects the wallet outside of
    // our UI. This is a temporary workaround until Privy fixes the bug with
    // "Restrict to one external wallet" feature.
    if (!checkIfAddressBelongsToPrivy(user.linkedAccounts, address)) {
      console.warn(
        'Connected wallet is not a part of the current Privy session. Force logging out...',
      );
      logout();
    }
  }, [address, logout, user?.linkedAccounts]);

  const smartWalletAddress = useMemo(
    () => (user?.smartWallet?.address ? getAddress(user.smartWallet.address) : undefined),
    [user?.smartWallet?.address],
  );
  const isSmartWalletConnected = Boolean(
    smartWalletAddress &&
      connectedProfileAddresses.some((a) => isAddressEqualSafe(a, smartWalletAddress)),
  );
  const embeddedWallet = getEmbeddedConnectedWallet(wallets);
  const embeddedWalletAddress = embeddedWallet ? getAddress(embeddedWallet.address) : undefined;

  const currentUser: CurrentUser = {
    connectedAddress: isConnected ? address : undefined,
    isConnected,
    status,
    isReady: ready && isWalletsReady,
    isSmartWalletConnected,
    smartWalletAddress,
    embeddedWalletAddress,
    connectedProfile,
    isConnectedProfileLoading,
    connectedProfileAddresses,
    connectedProfilePrimaryAddress: profileAddresses?.primaryAddress,
    isLoadingConnectedProfileAddresses,
    connectedActor,
  };

  return <CurrentUserContext.Provider value={currentUser}>{children}</CurrentUserContext.Provider>;
}

export function useCurrentUser() {
  const context = useContext(CurrentUserContext);

  if (!context) {
    throw new Error('useCurrentUser must be used within a CurrentUserProvider');
  }

  return context;
}

export function useIsConnectedProfile(profileId: ProfileId): boolean {
  const { connectedProfile } = useCurrentUser();

  return connectedProfile?.id === profileId;
}

export function useIsTargetCurrentUser(target: EthosUserTarget): boolean {
  const { connectedAddress, connectedProfileAddresses, connectedProfile } = useCurrentUser();
  const { data } = useAttestations({ profileId: connectedProfile?.id ?? 0 });
  const attestations = data ?? [];

  if (!connectedAddress) return false;

  if (
    'address' in target &&
    (isAddressEqualSafe(target.address, connectedAddress) ||
      connectedProfileAddresses.some((address) => isAddressEqualSafe(target.address, address)))
  ) {
    return true;
  }

  if ('profileId' in target && target.profileId === connectedProfile?.id) return true;

  if (
    'service' in target &&
    attestations.some((a) => target.service === a.service && target.account === a.account)
  ) {
    return true;
  }

  return false;
}

function checkIfAddressBelongsToPrivy(linkedAccounts: User['linkedAccounts'], address: Address) {
  return linkedAccounts.some(
    (a) =>
      a.type === 'wallet' && isValidAddress(a.address) && isAddressEqualSafe(a.address, address),
  );
}
