'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Customer } from '@/types';

interface AuthState {
  customer: Customer | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (accessToken: string, refreshToken: string, customer?: Customer | null) => void;
  updateToken: (accessToken: string) => void;
  updateCustomer: (customer: Partial<Customer>) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      customer: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      setAuth: (accessToken, refreshToken, customer) =>
        set({ customer: customer ?? null, accessToken, refreshToken, isAuthenticated: true }),

      updateToken: (accessToken) => set({ accessToken }),

      updateCustomer: (partial) =>
        set((state) => ({
          customer: state.customer ? { ...state.customer, ...partial } : null,
        })),

      clearAuth: () =>
        set({ customer: null, accessToken: null, refreshToken: null, isAuthenticated: false }),
    }),
    {
      name: 'zgames-auth',
      partialize: (state) => ({
        customer: state.customer,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
