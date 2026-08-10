"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { UnitProgression, Grade, GradeProgressionState, SkillProgressionState } from "@/types/domain/progression";

interface ProgressionStore {
  units: Record<string, UnitProgression>;
  registerUnit: (unitId: string, name: string) => void;
  updateGradeProgress: (unitId: string, progress: Partial<GradeProgressionState>) => void;
  updateSkillProgress: (unitId: string, progress: Partial<SkillProgressionState>) => void;
  removeUnit: (unitId: string) => void;
}

export const useProgressionStore = create<ProgressionStore>()(
  persist(
    (set) => ({
      units: {},
      registerUnit: (unitId, name) =>
        set((state) => ({
          units: {
            ...state.units,
            [unitId]: {
              unitId,
              name,
              gradeProgress: { currentGrade: 2, targetGrade: 6 },
              skillProgress: { currentSkills: [1, 1, 1], targetSkills: [1, 1, 1] },
            },
          },
        })),
      updateGradeProgress: (unitId, progress) =>
        set((state) => {
          const unit = state.units[unitId];
          if (!unit) return state;
          return {
            units: {
              ...state.units,
              [unitId]: {
                ...unit,
                gradeProgress: {
                  ...unit.gradeProgress,
                  ...progress,
                },
              },
            },
          };
        }),
      updateSkillProgress: (unitId, progress) =>
        set((state) => {
          const unit = state.units[unitId];
          if (!unit) return state;
          return {
            units: {
              ...state.units,
              [unitId]: {
                ...unit,
                skillProgress: {
                  ...unit.skillProgress,
                  ...progress,
                },
              },
            },
          };
        }),
      removeUnit: (unitId) =>
        set((state) => {
          const newUnits = { ...state.units };
          delete newUnits[unitId];
          return { units: newUnits };
        }),
    }),
    {
      name: "domain-progression-store",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
