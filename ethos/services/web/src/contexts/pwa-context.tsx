'use client';

import { usePathname } from 'next/navigation';
import { createContext, useContext, useState, useEffect, type PropsWithChildren } from 'react';

type PWAContextType = {
  suppressPWAModal: () => void;
  shouldShowPWA: boolean;
};

const PWAContext = createContext<PWAContextType | undefined>(undefined);

// Add paths that should suppress the PWA modal
const SUPPRESSED_PATHS = ['/activity/review', '/activity/vouch', '/profile', '/claim', '/claimed'];

export function PWAProvider({ children }: PropsWithChildren) {
  const [shouldShowPWA, setShouldShowPWA] = useState(true);
  const pathname = usePathname();

  // Reset shouldShowPWA when navigating to a page that should show the PWA modal
  useEffect(() => {
    const shouldSuppress = SUPPRESSED_PATHS.some((path) => pathname.startsWith(path));
    setShouldShowPWA(!shouldSuppress);
  }, [pathname]);

  function suppressPWAModal(): void {
    setShouldShowPWA(false);
  }

  return (
    <PWAContext.Provider value={{ suppressPWAModal, shouldShowPWA }}>
      {children}
    </PWAContext.Provider>
  );
}

export function usePWA() {
  const context = useContext(PWAContext);

  if (!context) {
    throw new Error('usePWA must be used within a PWAProvider');
  }

  return context;
}
