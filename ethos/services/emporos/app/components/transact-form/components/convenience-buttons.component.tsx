import { Button, Flex } from 'antd';
import { cn } from '~/utils/cn.ts';

const conveniencePercentages = ['10%', '25%', '50%', '100%'] as const;

export function ConvenienceButtons({
  handlePercentage,
  buttonClassName,
  containerClassName,
  disabled = false,
}: {
  handlePercentage: (value: number) => void;
  buttonClassName?: string;
  containerClassName?: string;
  disabled?: boolean;
}) {
  return (
    <Flex className={cn('w-full justify-between gap-1', containerClassName)}>
      {conveniencePercentages.map((percent) => (
        <Button
          key={percent}
          disabled={disabled}
          onClick={() => {
            handlePercentage(parseInt(percent, 10));
          }}
          className={cn(
            'text-base md:text-xs rounded-100 px-4 md:px-2 lg:px-3 xl:px-4',
            buttonClassName,
          )}
        >
          {percent === '100%' ? 'Max' : percent}
        </Button>
      ))}
    </Flex>
  );
}
