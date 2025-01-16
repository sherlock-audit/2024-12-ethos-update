import { createConfig } from '@privy-io/wagmi';
import { cookieStorage, createStorage, http } from 'wagmi';
import { baseSepolia, mainnet } from 'wagmi/chains';

export const wagmiConfig = createConfig({
  chains: [baseSepolia],
  ssr: true,
  transports: {
    [baseSepolia.id]: http(),
  },
  storage: createStorage({
    storage: cookieStorage,
  }),
});

export const mainnetConfig = createConfig({
  chains: [mainnet],
  transports: {
    [mainnet.id]: http(),
  },
});
