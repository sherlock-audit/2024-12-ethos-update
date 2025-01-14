import { formatCurrency, formatEth } from '@ethos/helpers';
import { ArrowDownIcon } from './icons/arrow-down.tsx';
import { ArrowUpIcon } from './icons/arrow-up.tsx';
import { cn } from '~/utils/cn.ts';

type ChangeFormat = 'number' | 'eth' | 'usd' | 'percentage';
function formatValue(change: number, format: ChangeFormat) {
  switch (format) {
    case 'eth':
      return formatEth(Math.abs(change), 'eth');
    case 'usd':
      return formatCurrency(Math.abs(change), 'USD');
    case 'percentage':
      return `${Math.abs(change)}%`;
    default:
      return Math.abs(change);
  }
}

/**
 * Formats a number with an up or down arrow prefix and the corresponding colors.
 * @param change Positive number for green, negative for red.
 */
export function ChangeIndicator({
  change,
  format = 'number',
}: {
  change: number;
  format?: ChangeFormat;
}) {
  return (
    <span
      className={cn({
        'text-antd-colorSuccess': change > 0,
        'text-antd-colorError': change < 0,
      })}
    >
      {change > 0 && <ArrowUpIcon />}
      {change < 0 && <ArrowDownIcon />}
      {formatValue(change, format)}
    </span>
  );
}
