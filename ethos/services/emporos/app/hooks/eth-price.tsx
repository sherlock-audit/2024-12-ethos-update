import { formatCurrency } from '@ethos/helpers';
import { formatEther } from 'viem';
import { useMatchesData } from './use-match-data.ts';
import { type RootLoaderData } from '~/root.tsx';

/**
 * Fetches the ETH to USD rate from the root loader.
 *
 * @returns {number | null} The ETH to USD rate as a number, or null if there's an error in API. (e.g. 3950)
 */

function useETHToUsdRate(): number | null {
  const data = useMatchesData<RootLoaderData>('root');

  if (!data?.ethToUsdRate) {
    return null;
  }

  return data.ethToUsdRate;
}

/**
 * Converts an amount of ETH to its equivalent value in USD.
 *
 * @param {string | number} amount - The amount of ETH to convert. (e.g. 0.1)
 * @returns {string | null} The equivalent value in USD as a formatted currency string, (e.g. $104)
 *                          null if there's an error in API.
 */

export function useEthToUSD(amount: string | number, maximumFractionDigits = 2): string | null {
  const ethToUsdRate = useETHToUsdRate();

  if (!ethToUsdRate) {
    return null;
  }

  const ether = Number(amount);

  return formatCurrency(ether * ethToUsdRate, 'USD', { maximumFractionDigits });
}

/**
 * Converts an amount of ETH in wei to its equivalent value in USD.
 *
 * @param {bigint} amount - The amount of ETH in wei. (e.g. 100000000000000000n)
 * @returns {string | null} The equivalent value in USD as a formatted currency string. (e.g. $104)
 *                          null if there's an error in API.
 */
export function useWeiToUSD(amount: bigint, maximumFractionDigits = 2) {
  const ether = Number(formatEther(amount));

  return useEthToUSD(ether, maximumFractionDigits);
}
