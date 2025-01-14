import { createContext, useContext, useState } from 'react';
import { MenuDrawer } from './menu-drawer';

const MenuDrawerContext = createContext<{
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}>({
  isOpen: false,
  setIsOpen: () => {},
});

export function MenuDrawerProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <MenuDrawerContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
      <MenuDrawer />
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
