import { Typography } from 'antd';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { ErrorOutlineIcon } from '~/components/icons/error-outline.tsx';
import { cn } from '~/utils/cn.ts';

export function ErrorMessage({
  errorMessage,
  className,
}: {
  errorMessage: string | null;
  className?: string;
}) {
  const [animationKey, setAnimationKey] = useState(errorMessage);

  useEffect(() => {
    if (errorMessage) {
      setAnimationKey(errorMessage);
    }
  }, [errorMessage]);

  return (
    <AnimatePresence mode="wait" key={animationKey}>
      <motion.div
        layout
        className={cn(
          'flex items-center justify-center gap-2 w-fit mx-auto',
          'rounded-100 overflow-hidden leading-none h-0',
          errorMessage && 'text-antd-colorError py-1 px-4 bg-antd-colorBgLayout h-auto',
          className,
        )}
      >
        <ErrorOutlineIcon className="text-base/none" />
        <Typography.Text className="text-sm text-inherit">{errorMessage}</Typography.Text>
      </motion.div>
    </AnimatePresence>
  );
}
