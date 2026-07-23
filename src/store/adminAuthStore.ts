'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { StaffUser } from '@/types';

interface AdminAuthState {
  user: StaffUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (accessToken: string, refreshToken: string, user?: StaffUser | null) => void;
  updateToken: (accessToken: string) => void;
  updateUser: (user: Partial<StaffUser>) => void;
  clearAuth: () => void;
}

export const useAdminAuthStore = create<AdminAuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      setAuth: (accessToken, refreshToken, user) =>
        set({ user: user ?? null, accessToken, refreshToken, isAuthenticated: true }),

      updateToken: (accessToken) => set({ accessToken }),

      updateUser: (partial) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...partial } : null,
        })),

      clearAuth: () =>
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false }),
    }),
    {
      name: 'cgagames-admin-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
