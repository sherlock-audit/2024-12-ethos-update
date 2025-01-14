import { Typography } from 'antd';
import { cn } from '~/utils/cn.ts';

export function FeeInfo({ className }: { className?: string }) {
  return (
    <Typography.Text
      className={cn('text-antd-colorTextSecondary text-xs/none text-center', className)}
    >
      1% fee (0.5% creator + 0.5% protocol)
    </Typography.Text>
  );
}
