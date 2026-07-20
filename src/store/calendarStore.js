import { create } from 'zustand';

export const useCalendarStore = create((set) => ({
  events: [],
  view: { year: new Date().getFullYear(), month: new Date().getMonth() + 1 },
  setEvents: (events) => set({ events }),
  setView: (year, month) => set({ view: { year, month } }),
  addEvent: (event) => set((s) => ({ events: [...s.events, event] })),
  updateEventInStore: (event) =>
    set((s) => ({
      events: s.events.map((e) => (e._id === event._id ? event : e)),
    })),
  removeEventFromStore: (id) =>
    set((s) => ({
      events: s.events.filter((e) => e._id !== id),
    })),
}));
