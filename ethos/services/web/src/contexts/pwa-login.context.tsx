'use client';

import { createContext, useContext, type PropsWithChildren } from 'react';
import { useIsPWA } from 'hooks/use-is-pwa';
import { useLocalStorage } from 'hooks/use-storage';

const PWA_FIRST_LOGIN_KEY = 'ethos_pwa_first_login_shown';

type PWALoginContextType = {
  shouldShowFirstLogin: boolean;
  markFirstLoginShown: () => void;
};

const PWALoginContext = createContext<PWALoginContextType | undefined>(undefined);

export function PWALoginProvider({ children }: PropsWithChildren) {
  const isPWA = useIsPWA();
  const [hasShownFirstLogin, setHasShownFirstLogin] = useLocalStorage(PWA_FIRST_LOGIN_KEY, false);

  const shouldShowFirstLogin = isPWA && !hasShownFirstLogin;

  function markFirstLoginShown(): void {
    setHasShownFirstLogin(true);
  }

  return (
    <PWALoginContext.Provider value={{ shouldShowFirstLogin, markFirstLoginShown }}>
      {children}
    </PWALoginContext.Provider>
  );
}

export function usePWALogin() {
  const context = useContext(PWALoginContext);

  if (!context) {
    throw new Error('usePWALogin must be used within a PWALoginProvider');
  }

  return context;
}
