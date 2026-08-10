"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface SummonGoal {
  id: string;
  name: string;
  targetDate: string; // ISO date string
  requiredPulls: number;
}

interface GoalStore {
  activeGoal: SummonGoal | null;
  setActiveGoal: (goal: SummonGoal | null) => void;
}

export const useGoalStore = create<GoalStore>()(
  persist(
    (set) => ({
      activeGoal: null,
      setActiveGoal: (goal) => set({ activeGoal: goal }),
    }),
    {
      name: "domain-goal-store",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
