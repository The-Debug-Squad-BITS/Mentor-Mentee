import { create } from 'zustand';

export const useActivityStore = create((set) => ({
  activities: [],
  pagination: null,
  setActivities: (activities, pagination) => set({ activities, pagination }),
}));
