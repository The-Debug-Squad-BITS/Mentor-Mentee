import { create } from 'zustand';

// Meetings list state. Lists are reloaded after each mutation for correctness.
export const useMeetingStore = create((set) => ({
  meetings: [],
  pagination: null,
  setMeetings: (meetings, pagination = null) => set({ meetings, pagination }),
}));
