import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { FamilyMember } from '@/data/family';

const GLOVE_MODE_KEY = 'folgari-glove-mode';

interface AppContextValue {
  member: FamilyMember;
  logout: () => void;
  gloveMode: boolean;
  toggleGloveMode: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

interface AppProviderProps {
  member: FamilyMember;
  onLogout: () => void;
  children: ReactNode;
}

export function AppProvider({ member, onLogout, children }: AppProviderProps) {
  const [gloveMode, setGloveMode] = useState<boolean>(() => localStorage.getItem(GLOVE_MODE_KEY) === '1');

  useEffect(() => {
    localStorage.setItem(GLOVE_MODE_KEY, gloveMode ? '1' : '0');
  }, [gloveMode]);

  const toggleGloveMode = useCallback(() => setGloveMode((value) => !value), []);

  const value = useMemo(
    () => ({ member, logout: onLogout, gloveMode, toggleGloveMode }),
    [member, onLogout, gloveMode, toggleGloveMode],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used inside AppProvider');
  return context;
}
