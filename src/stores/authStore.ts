import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AdminUser } from '@/types';

interface AuthState {
  token: string | null;
  tokenExpiry: number | null; // NEW: Store when token expires
  user: AdminUser | null;
  isAuthenticated: boolean;
  login: (token: string, user: AdminUser) => void;
  logout: () => void;
  setUser: (user: AdminUser) => void;
  clearAuth: () => void;
  isTokenValid: () => boolean; // NEW: Check if token is still valid
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({ // CHANGED: Added 'get' parameter to access state
      token: null,
      tokenExpiry: null, // NEW
      user: null,
      isAuthenticated: false,

      login: (token, user) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('access_token', token);
        }

        // NEW: Calculate when token expires (30 min from now, minus 1 min buffer)
        const expiryTime = Date.now() + (29 * 60 * 1000);

        set({
          token,
          user,
          tokenExpiry: expiryTime, // NEW: Store expiry time
          isAuthenticated: true
        });
      },

      clearAuth: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
        }
        set({
          token: null,
          tokenExpiry: null, // NEW: Clear expiry
          user: null,
          isAuthenticated: false
        });
      },

      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
        }
        set({
          token: null,
          tokenExpiry: null, // NEW: Clear expiry
          user: null,
          isAuthenticated: false
        });
      },

      setUser: (user) => set({ user }),

      // NEW: Method to check if token is still valid
      isTokenValid: () => {
        const { token, tokenExpiry } = get();

        // No token or expiry? Not valid
        if (!token || !tokenExpiry) return false;

        // Check if current time is before expiry time
        return Date.now() < tokenExpiry;
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);