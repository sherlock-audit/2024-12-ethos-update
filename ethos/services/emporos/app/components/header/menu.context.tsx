import { createContext, useCallback, useContext, useState } from 'react';

const MenuDrawerContext = createContext<{
  isMenuOpen: boolean;
  openMenu: () => void;
  closeMenu: () => void;
}>({
  isMenuOpen: false,
  openMenu: () => {},
  closeMenu: () => {},
});

export function MenuDrawerProvider({ children }: { children: React.ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const openMenu = useCallback(() => {
    setIsMenuOpen(true);
  }, []);
  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  return (
    <MenuDrawerContext.Provider value={{ isMenuOpen, openMenu, closeMenu }}>
      {children}
    </MenuDrawerContext.Provider>
  );
}

export function useMenuDrawer() {
  const context = useContext(MenuDrawerContext);

  if (!context) {
    throw new Error('useMenuDrawer must be used within a MenuDrawerProvider');
  }

  return context;
}
