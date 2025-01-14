import { type PropsWithChildren, forwardRef } from 'react';
import { cn } from '~/utils/cn.ts';

/**
 * We need to wrap icon inside tooltip with span to remove invalid DOM errors.
 * More details: https://ant.design/components/tooltip#why-does-the-warning-finddomnode-is-deprecated-sometimes-appear-in-strict-mode
 * But ant-app is adding a line-height: 1.25 to span which is changing icon size.
 * So this component is setting line-height: 1 to span to fix icon size.
 */
export const TooltipIconWrapper = forwardRef<
  HTMLSpanElement,
  PropsWithChildren<{ className?: string }>
>((props, ref) => {
  const { className, children, ...rest } = props;

  return (
    <span ref={ref} className={cn('leading-none', className)} {...rest}>
      {children}
    </span>
  );
});

TooltipIconWrapper.displayName = 'TooltipIconWrapper';
