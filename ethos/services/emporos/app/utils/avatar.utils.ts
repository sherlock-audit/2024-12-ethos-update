import { webUrlMap } from '@ethos/env';
import { type Address } from 'viem';
import { config } from '~/config/config.server.ts';

export function fallbackAvatarUrl(address: Address) {
  return new URL(`/avatar/blockie/${address}`, webUrlMap[config.ETHOS_ENV]).toString();
}
