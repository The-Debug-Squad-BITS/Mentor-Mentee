import { create } from 'zustand';

export const useUserStore = create((set) => ({
  users: [],
  pagination: null,
  setUsers: (users, pagination) => set({ users, pagination }),
}));
