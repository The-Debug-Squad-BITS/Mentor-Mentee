import { create } from 'zustand';

export const useTemplateStore = create((set) => ({
  templates: [],
  currentTemplate: null,
  setTemplates: (templates) => set({ templates }),
  setCurrentTemplate: (template) => set({ currentTemplate: template }),
}));
