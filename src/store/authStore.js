import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { connectSocket, disconnectSocket } from '../lib/socket';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,

      // Call this after successful login or register.
      // Opens the real-time socket connection (Phase 3).
      login: (user, token) => {
        set({ user, token });
        connectSocket(token);
      },

      // Update specific user fields (e.g. mustChangePassword: false)
      updateUser: (updates) =>
        set((state) => ({ user: { ...state.user, ...updates } })),

      // Clear all auth state and close the real-time socket (Phase 3).
      logout: () => {
        disconnectSocket();
        set({ user: null, token: null });
      },
    }),
    {
      name: 'eduflow_auth', // key in localStorage
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);
