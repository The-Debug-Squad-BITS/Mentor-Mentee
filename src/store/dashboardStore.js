import { create } from 'zustand';

export const useDashboardStore = create((set) => ({
  adminStats: null,
  mentorStats: null,
  menteeStats: null,
  setAdminStats: (stats) => set({ adminStats: stats }),
  setMentorStats: (stats) => set({ mentorStats: stats }),
  setMenteeStats: (stats) => set({ menteeStats: stats }),
}));
