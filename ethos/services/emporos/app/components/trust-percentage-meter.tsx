import { Flex, Typography } from 'antd';
import { cn } from '~/utils/cn.ts';

export function TrustPercentageMeter({
  trustPercentage,
  strokeHeight = 2,
  gap = 8,
}: {
  trustPercentage: number;
  strokeHeight?: number;
  gap?: number;
}) {
  return (
    <Flex className="w-full" align="center" gap={gap}>
      {trustPercentage > 0 && (
        <div
          className="bg-trust"
          style={{
            width: `${trustPercentage}%`,
            height: strokeHeight,
          }}
        />
      )}
      <Typography.Text
        className={cn('text-[30px] leading-none whitespace-nowrap text-antd-colorTextBase')}
      >
        {trustPercentage}%
      </Typography.Text>
      {trustPercentage < 100 && (
        <div
          className="bg-distrust"
          style={{
            width: `${100 - trustPercentage}%`,
            height: strokeHeight,
          }}
        />
      )}
    </Flex>
  );
}
