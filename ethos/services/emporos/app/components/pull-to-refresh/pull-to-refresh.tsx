import { useRevalidator } from '@remix-run/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ClientOnly } from 'remix-utils/client-only';
import { LottiePtrIcon } from './lottie-ptr-icon.client.tsx';
import { useIsPWA } from '~/hooks/use-is-pwa.ts';

const PULL_DOWN_THRESHOLD = 80;
const MAX_PULL_DOWN = 120;

export function PullToRefresh({ children }: { children: React.ReactNode }) {
  const revalidator = useRevalidator();
  const [pullDownDistance, setPullDownDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const touchStartY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    // Only enable pull-to-refresh when at the top of the page
    if (window.scrollY === 0) {
      touchStartY.current = e.touches[0].clientY;
    }
  }, []);

  const isPwa = useIsPWA();

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (touchStartY.current === 0 || isRefreshing) return;

      const touchY = e.touches[0].clientY;
      const distance = touchY - touchStartY.current;

      if (distance > 0 && window.scrollY === 0) {
        // Add resistance to the pull
        const dampedDistance = Math.min(distance * 0.4, MAX_PULL_DOWN);
        setPullDownDistance(dampedDistance);
        e.preventDefault();
      }
    },
    [isRefreshing],
  );

  const handleTouchEnd = useCallback(() => {
    if (pullDownDistance >= PULL_DOWN_THRESHOLD && !isRefreshing) {
      setIsRefreshing(true);
      revalidator.revalidate();
    }
    touchStartY.current = 0;
    setPullDownDistance(0);
  }, [pullDownDistance, isRefreshing, revalidator]);

  // Reset refreshing state when revalidation is complete
  useEffect(() => {
    if (revalidator.state === 'idle') {
      setIsRefreshing(false);
    }
  }, [revalidator.state]);

  // Add touch event listeners
  useEffect(() => {
    const container = containerRef.current;

    if (!isPwa || !container) return;

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchMove, handleTouchEnd, handleTouchStart, isPwa]);

  const progress = Math.min((pullDownDistance / PULL_DOWN_THRESHOLD) * 100, 100);

  return (
    <div ref={containerRef} className="w-full">
      <div
        style={{
          height: Math.max(pullDownDistance, isRefreshing ? 60 : 0),
          transition: isRefreshing ? 'height 0.2s ease-in-out' : 'none',
          overflow: 'visible',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
        }}
      >
        <ClientOnly>
          {() => <LottiePtrIcon progress={progress / 100} isRefreshing={isRefreshing} />}
        </ClientOnly>
      </div>
      <div
        style={{
          transform: `translateY(${pullDownDistance}px)`,
          transition: isRefreshing ? 'none' : 'transform 0.2s ease-out',
        }}
      >
        {children}
      </div>
    </div>
  );
}
