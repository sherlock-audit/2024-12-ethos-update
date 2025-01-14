import { formatEth } from '@ethos/helpers';

/**
 * Calculates a safe withdrawable amount based on a balance and percentage
 * @param balanceWei - Balance in wei (as bigint)
 * @param percentage - Percentage to withdraw (0-100)
 * @returns Formatted amount string with appropriate decimal places
 */
export function convertBalancePercentageToAmount(balanceWei: bigint, percentage: number): string {
  const basisPoints = BigInt(percentage * 100);
  const calculatedValue = (balanceWei * basisPoints) / BigInt(10000);

  // For max (100%), apply 0.999 multiplier to account for gas
  const finalValue =
    percentage === 100 ? (calculatedValue * BigInt(999)) / BigInt(1000) : calculatedValue;

  return formatEth(finalValue, 'wei', {
    maximumFractionDigits: percentage === 100 ? 5 : 4, // 5 for max to leave more room for gas
    minimumFractionDigits: 0,
  }).replace('e', '');
}
