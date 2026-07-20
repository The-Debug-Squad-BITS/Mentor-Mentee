import { create } from 'zustand';

// Chat state. Messages are stored per-room in chronological (oldest→newest) order.
// typingByRoom is populated in Step 3 (real-time) — declared here so the shape is stable.
export const useChatStore = create((set) => ({
  rooms: [],
  activeRoomId: null,
  messagesByRoom: {},      // { [roomId]: [message, ...] }  (ascending)
  paginationByRoom: {},    // { [roomId]: { total, page, pages, hasMore } }
  typingByRoom: {},        // { [roomId]: [ { userId, userName } ] }

  setRooms: (rooms) => set({ rooms }),
  setActiveRoom: (activeRoomId) => set({ activeRoomId }),

  setMessages: (roomId, messages, pagination) =>
    set((s) => ({
      messagesByRoom: { ...s.messagesByRoom, [roomId]: messages },
      paginationByRoom: { ...s.paginationByRoom, [roomId]: pagination },
    })),

  // Prepend older messages (pagination "load older"), keeping ascending order.
  prependMessages: (roomId, older, pagination) =>
    set((s) => {
      const existing = s.messagesByRoom[roomId] || [];
      const seen = new Set(existing.map((m) => m._id));
      const merged = [...older.filter((m) => !seen.has(m._id)), ...existing];
      return {
        messagesByRoom: { ...s.messagesByRoom, [roomId]: merged },
        paginationByRoom: { ...s.paginationByRoom, [roomId]: pagination },
      };
    }),

  // Append a new message, de-duped by _id (REST + socket may both deliver it).
  addMessage: (roomId, message) =>
    set((s) => {
      const list = s.messagesByRoom[roomId] || [];
      if (list.some((m) => m._id === message._id)) return s;
      return { messagesByRoom: { ...s.messagesByRoom, [roomId]: [...list, message] } };
    }),

  updateMessage: (roomId, message) =>
    set((s) => ({
      messagesByRoom: {
        ...s.messagesByRoom,
        [roomId]: (s.messagesByRoom[roomId] || []).map((m) => (m._id === message._id ? message : m)),
      },
    })),

  removeMessage: (roomId, messageId) =>
    set((s) => ({
      messagesByRoom: {
        ...s.messagesByRoom,
        [roomId]: (s.messagesByRoom[roomId] || []).map((m) =>
          m._id === messageId ? { ...m, isDeleted: true, content: '', fileUrl: null } : m
        ),
      },
    })),
}));
