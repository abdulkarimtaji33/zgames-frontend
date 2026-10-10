'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

export type Skin = 'vault' | 'arcade';

const SKIN_STORAGE_KEY = 'zgames-skin';
const SKINS: Skin[] = ['vault', 'arcade'];

interface SkinContextValue {
  skin: Skin;
  setSkin: (skin: Skin) => void;
}

const SkinContext = createContext<SkinContextValue | null>(null);

/**
 * Inline, blocking script — sets `data-skin` on <html> before first paint
 * so switching skins (or reloading) never flashes the wrong theme.
 * Mirrors the pattern next-themes uses for the dark/light class.
 */
export const SKIN_NO_FLASH_SCRIPT = `(function(){try{var s=localStorage.getItem('${SKIN_STORAGE_KEY}');if(s!=='vault'&&s!=='arcade'){s='arcade';}document.documentElement.setAttribute('data-skin',s);}catch(e){document.documentElement.setAttribute('data-skin','arcade');}})();`;

export function SkinProvider({
  children,
  defaultSkin = 'arcade',
}: {
  children: ReactNode;
  defaultSkin?: Skin;
}) {
  const [skin, setSkinState] = useState<Skin>(defaultSkin);

  useEffect(() => {
    const stored = window.localStorage.getItem(SKIN_STORAGE_KEY);
    if (stored === 'vault' || stored === 'arcade') {
      setSkinState(stored);
    }
  }, []);

  const setSkin = useCallback((next: Skin) => {
    setSkinState(next);
    document.documentElement.setAttribute('data-skin', next);
    try {
      window.localStorage.setItem(SKIN_STORAGE_KEY, next);
    } catch {
      // storage unavailable (private mode, etc.) — skin still applies for this session
    }
  }, []);

  return <SkinContext.Provider value={{ skin, setSkin }}>{children}</SkinContext.Provider>;
}

export function useSkin() {
  const ctx = useContext(SkinContext);
  if (!ctx) throw new Error('useSkin must be used within a SkinProvider');
  return ctx;
}

export const SKIN_LABELS: Record<Skin, { name: string; tagline: string }> = {
  vault: { name: 'Vault', tagline: 'Dark · cinematic · premium' },
  arcade: { name: 'Arcade Pop', tagline: 'Bright · bold · playful' },
};

export { SKINS };
