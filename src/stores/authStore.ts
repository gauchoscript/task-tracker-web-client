import type { User } from '@/lib/types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  signin: (token: string, user?: User) => void;
  signout: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      signin: (token: string, user?: User) =>
        set({
          token,
          user: user ?? null,
          isAuthenticated: true,
        }),
      signout: () =>
        set({
          token: null,
          user: null,
          isAuthenticated: false,
        }),
      setUser: (user: User) => set({ user }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
