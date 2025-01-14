'use client';
import { useEffect, useState } from 'react';

export function useIsMobile(maxWidth: number = 767): boolean {
  const query = `(max-width: ${maxWidth}px)`;

  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false,
  );

  useEffect(() => {
    function handleMediaQueryChange(event: MediaQueryListEvent): void {
      setIsMobile(event.matches);
    }

    const mediaQuery = window.matchMedia(query);

    mediaQuery.addEventListener('change', handleMediaQueryChange);

    return () => {
      mediaQuery.removeEventListener('change', handleMediaQueryChange);
    };
  }, [query]);

  return isMobile;
}
