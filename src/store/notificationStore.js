import { create } from 'zustand';

export const useNotificationStore = create((set) => ({
  notifications: [],

  setNotifications: (notifications) => set({ notifications }),

  // Update a single notification to isRead: true (no re-fetch needed)
  markRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n._id === id ? { ...n, isRead: true } : n
      ),
    })),
}));
