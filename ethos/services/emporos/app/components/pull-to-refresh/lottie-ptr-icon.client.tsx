import Lottie from 'lottie-react';
import { useEffect, useRef } from 'react';
// eslint-disable-next-line no-restricted-syntax
import ptrAnimationDark from './ptr-animation-dark.json';
// eslint-disable-next-line no-restricted-syntax
import ptrAnimationLight from './ptr-animation-light.json';
import { useThemeMode } from '~/theme/utils.ts';
import { cn } from '~/utils/cn.ts';

type LottiePtrIconProps = {
  progress?: number;
  isRefreshing?: boolean;
};

export function LottiePtrIcon({ progress = 0, isRefreshing = false }: LottiePtrIconProps) {
  const themeMode = useThemeMode();
  const lottieRef = useRef<any>(null);

  useEffect(() => {
    if (!lottieRef.current) return;

    if (isRefreshing) {
      lottieRef.current.playSegments([60, 90], true);
    } else {
      // Only update non-refreshing animation when progress changes significantly
      const frame = Math.floor(progress * 59);
      lottieRef.current.goToAndStop(frame, true);
    }
  }, [isRefreshing, progress]);

  return (
    <div style={{ width: 40, height: 40 }}>
      <Lottie
        lottieRef={lottieRef}
        style={{
          opacity: !isRefreshing && progress <= 0.1 ? progress * 10 : 1,
        }}
        className={cn({
          'transition-all': true,
        })}
        animationData={themeMode === 'dark' ? ptrAnimationDark : ptrAnimationLight}
        loop={isRefreshing}
        autoplay={false}
      />
    </div>
  );
}
