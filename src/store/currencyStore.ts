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

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set, get) => ({
      selected: CURRENCIES[0],
      currencies: CURRENCIES,

      setCurrency: (code) => {
        const currency = CURRENCIES.find((c) => c.code === code);
        if (currency) set({ selected: currency });
      },

      format: (amount: number) => {
        const { selected } = get();
        const converted = amount * selected.rate;
        return `${selected.symbol} ${converted.toFixed(2)}`;
      },
    }),
    { name: 'cgagames-currency' },
  ),
);
