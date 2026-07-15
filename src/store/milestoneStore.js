import { create } from 'zustand';

export const useMilestoneStore = create((set) => ({
  milestones: [],
  currentMilestone: null, // includes progress, totalTasks, completedTasks, pendingTasks
  setMilestones: (milestones) => set({ milestones }),
  setCurrentMilestone: (milestone) => set({ currentMilestone: milestone }),
}));
