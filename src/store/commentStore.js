import { create } from 'zustand';

export const useCommentStore = create((set) => ({
  comments: [], // threaded: [{ ...comment, replies: [...] }]
  setComments: (comments) => set({ comments }),
}));
