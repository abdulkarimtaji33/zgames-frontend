'use client';

import { create } from 'zustand';

interface UIState {
  isMegaMenuOpen: boolean;
  isSearchOpen: boolean;
  country: string;
  language: string;
  setMegaMenuOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  setCountry: (country: string) => void;
  setLanguage: (language: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isMegaMenuOpen: false,
  isSearchOpen: false,
  country: 'AE',
  language: 'en',
  setMegaMenuOpen: (open) => set({ isMegaMenuOpen: open }),
  setSearchOpen: (open) => set({ isSearchOpen: open }),
  setCountry: (country) => set({ country }),
  setLanguage: (language) => set({ language }),
}));
