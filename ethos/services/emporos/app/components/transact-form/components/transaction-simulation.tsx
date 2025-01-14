import { formatEth } from '@ethos/helpers';
import { Flex, Typography } from 'antd';
import clsx from 'clsx';
import { useBuySimulationImpact } from '../hooks/use-buy.ts';
import { useSellSimulation } from '../hooks/use-sell.ts';
import { cn } from '~/utils/cn.ts';

export function TrustScoreSimulation({ className }: { className?: string }) {
  const { trend, formattedImpact } = useBuySimulationImpact();

  return (
    <Flex justify="center" gap={8} className={className}>
      <Typography.Text>Trust score</Typography.Text>
      <Typography.Text
        className={clsx('flex items-center justify-center gap-[1px] font-bold', {
          'text-antd-colorSuccess': trend === 'up',
          'text-antd-colorError': trend === 'down',
        })}
      >
        {trend && <span>{trend === 'up' ? '↑' : '↓'}</span>}
        {formattedImpact}
      </Typography.Text>
    </Flex>
  );
}

export function SellPriceSimulation({ className }: { className?: string }) {
  const simulation = useSellSimulation();

  return (
    <Typography.Text className={cn('text-center text-sm text-antd-colorTextSecondary', className)}>
      You will receive{' '}
      <span className="font-bold text-antd-colorTextBase">
        ~{formatEth(simulation?.fundsReceived ?? 0n, 'wei', { maximumFractionDigits: 3 })}
      </span>
    </Typography.Text>
  );
}
