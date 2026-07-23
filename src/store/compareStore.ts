'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const MAX_COMPARE_ITEMS = 4;

interface CompareState {
  productIds: string[];
  addProduct: (productId: string) => void;
  removeProduct: (productId: string) => void;
  clearCompare: () => void;
}

export const useCompareStore = create<CompareState>()(
  persist(
    (set) => ({
      productIds: [],
      addProduct: (productId) =>
        set((state) => {
          if (state.productIds.includes(productId)) return state;
          if (state.productIds.length >= MAX_COMPARE_ITEMS) return state;
          return { productIds: [...state.productIds, productId] };
        }),
      removeProduct: (productId) =>
        set((state) => ({
          productIds: state.productIds.filter((id) => id !== productId),
        })),
      clearCompare: () => set({ productIds: [] }),
    }),
    { name: 'cgagames-compare' },
  ),
);
