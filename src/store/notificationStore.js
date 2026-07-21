import { create } from 'zustand';

export const useNotificationStore = create((set) => ({
  notifications: [],
  unreadCount: 0,

  setNotifications: (notifications) => set({ notifications }),
  
  setUnreadCount: (unreadCount) => set({ unreadCount }),
  
  prependNotification: (n) =>
    set((s) => ({ 
      notifications: [n, ...s.notifications], 
      unreadCount: s.unreadCount + 1 
    })),

  // Update a single notification to isRead: true (optimistic update)
  markRead: (id) =>
    set((state) => {
      const isAlreadyRead = state.notifications.find((n) => n._id === id)?.isRead;
      return {
        notifications: state.notifications.map((n) =>
          n._id === id ? { ...n, isRead: true } : n
        ),
        unreadCount: isAlreadyRead ? state.unreadCount : Math.max(0, state.unreadCount - 1),
      };
    }),
}));
