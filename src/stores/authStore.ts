import { queryClient } from '@/lib/queryClient';
import type { User } from '@/lib/types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  signin: (token: string, refreshToken?: string, user?: User) => void;
  signout: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      signin: (token: string, refreshToken?: string, user?: User) =>
        set((state) => ({
          token,
          refreshToken: refreshToken ?? state.refreshToken,
          user: user ?? state.user,
          isAuthenticated: true,
        })),
      signout: () => {
        queryClient.removeQueries();
        set({
          token: null,
          refreshToken: null,
          user: null,
          isAuthenticated: false,
        });
      },
      setUser: (user: User) => set({ user }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
