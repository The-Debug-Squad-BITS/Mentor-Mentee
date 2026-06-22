import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,

      // Call this after successful login or register
      login: (user, token) => set({ user, token }),

      // Update specific user fields (e.g. mustChangePassword: false)
      updateUser: (updates) =>
        set((state) => ({ user: { ...state.user, ...updates } })),

      // Clear all auth state
      logout: () => set({ user: null, token: null }),
    }),
    {
      name: 'eduflow_auth', // key in localStorage
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);
