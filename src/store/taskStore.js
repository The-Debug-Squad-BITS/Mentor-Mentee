import { create } from 'zustand';

export const useTaskStore = create((set) => ({
  tasks: [],
  setTasks: (tasks) => set({ tasks }),
  addTask: (task) => set((state) => ({ tasks: [task, ...state.tasks] })),
  removeTask: (taskId) => set((state) => ({ tasks: state.tasks.filter(t => t._id !== taskId) })),
}));
