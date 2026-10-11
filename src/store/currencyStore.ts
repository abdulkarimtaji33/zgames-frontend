'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
  rate: number;
}

const CURRENCIES: CurrencyInfo[] = [
  { code: 'AED', symbol: 'AED', name: 'UAE Dirham', rate: 1 },
  { code: 'SAR', symbol: 'SAR', name: 'Saudi Riyal', rate: 0.98 },
  { code: 'QAR', symbol: 'QAR', name: 'Qatari Riyal', rate: 1.0 },
  { code: 'KWD', symbol: 'KWD', name: 'Kuwaiti Dinar', rate: 0.085 },
  { code: 'BHD', symbol: 'BHD', name: 'Bahraini Dinar', rate: 0.104 },
  { code: 'USD', symbol: '$', name: 'US Dollar', rate: 0.272 },
];

interface CurrencyState {
  selected: CurrencyInfo;
  currencies: CurrencyInfo[];
  setCurrency: (code: string) => void;
  format: (amount: number) => string;
}

function makeFormat(currency: CurrencyInfo) {
  return (amount: number) => `${currency.symbol} ${(amount * currency.rate).toFixed(2)}`;
}

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set) => ({
      selected: CURRENCIES[0],
      currencies: CURRENCIES,

      setCurrency: (code) => {
        const currency = CURRENCIES.find((c) => c.code === code);
        // `format` is re-created (new function reference) on every switch —
        // components that select only `s.format` (not `s.selected`) still
        // re-render, since zustand triggers on reference change per slice.
        // Reusing the same closure across currency changes was why prices
        // only updated after a full page refresh.
        if (currency) set({ selected: currency, format: makeFormat(currency) });
      },

      format: makeFormat(CURRENCIES[0]),
    }),
    {
      name: 'cgagames-currency',
      // Only `selected` is worth persisting — `format`/`setCurrency` are
      // functions and silently drop out of JSON on save anyway. Without a
      // custom `merge`, rehydration would restore `selected` (e.g. USD)
      // but leave `format` pointing at the AED closure from initial state,
      // mismatching the restored currency until `setCurrency` ran again.
      partialize: (state) => ({ selected: state.selected }),
      merge: (persisted, current) => {
        const selected = (persisted as Partial<CurrencyState> | undefined)?.selected ?? current.selected;
        return { ...current, selected, format: makeFormat(selected) };
      },
    },
  ),
);
