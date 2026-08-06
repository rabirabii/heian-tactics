"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  initialFarmingWeek,
  initialMonthlyGoals,
  initialProjects,
  initialResources,
  initialSettings,
  initialShikigami,
} from "@/lib/planner-data";
import type {
  FarmingDay,
  MonthlyGoal,
  PlannerSettings,
  Project,
  ProjectStatus,
  Resource,
  ResourceType,
  Shikigami,
  ShikigamiStatus,
} from "@/types/planner";

interface PlannerStore {
  resources: Record<ResourceType, Resource>;
  projects: Project[];
  shikigami: Shikigami[];
  monthlyGoals: MonthlyGoal[];
  farmingWeek: FarmingDay[];
  settings: PlannerSettings;
  updateResource: (type: ResourceType, updates: Partial<Resource>) => void;
  adjustResource: (type: ResourceType, change: number, note: string) => void;
  addProject: (project: Omit<Project, "id" | "currentProgress" | "status">) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  updateProjectStatus: (id: string, status: ProjectStatus) => void;
  updateShikigamiStatus: (id: string, status: ShikigamiStatus) => void;
  updateMonthlyGoal: (id: string, current: number) => void;
  updateSettings: (updates: Partial<PlannerSettings>) => void;
  resetDemoData: () => void;
}

function createId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}`;
}

export const usePlannerStore = create<PlannerStore>()(
  persist(
    (set) => ({
      resources: initialResources,
      projects: initialProjects,
      shikigami: initialShikigami,
      monthlyGoals: initialMonthlyGoals,
      farmingWeek: initialFarmingWeek,
      settings: initialSettings,
      updateResource: (type, updates) =>
        set((state) => ({
          resources: {
            ...state.resources,
            [type]: {
              ...state.resources[type],
              ...updates,
            },
          },
        })),
      adjustResource: (type, change, note) =>
        set((state) => {
          const resource = state.resources[type];
          return {
            resources: {
              ...state.resources,
              [type]: {
                ...resource,
                currentAmount: Math.max(resource.currentAmount + change, 0),
                history: [
                  {
                    id: createId("history"),
                    date: new Date().toISOString(),
                    change,
                    note,
                  },
                  ...resource.history,
                ].slice(0, 8),
              },
            },
          };
        }),
      addProject: (project) =>
        set((state) => ({
          projects: [
            {
              ...project,
              id: createId("project"),
              currentProgress: 0,
              status: "Planning",
            },
            ...state.projects,
          ],
        })),
      updateProject: (id, updates) =>
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === id ? { ...project, ...updates } : project,
          ),
        })),
      updateProjectStatus: (id, status) =>
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === id
              ? {
                  ...project,
                  status,
                  currentProgress:
                    status === "Completed" ? 100 : Math.min(project.currentProgress, 95),
                }
              : project,
          ),
        })),
      updateShikigamiStatus: (id, status) =>
        set((state) => ({
          shikigami: state.shikigami.map((unit) =>
            unit.id === id ? { ...unit, status } : unit,
          ),
        })),
      updateMonthlyGoal: (id, current) =>
        set((state) => ({
          monthlyGoals: state.monthlyGoals.map((goal) =>
            goal.id === id ? { ...goal, current } : goal,
          ),
        })),
      updateSettings: (updates) =>
        set((state) => ({
          settings: {
            ...state.settings,
            ...updates,
          },
        })),
      resetDemoData: () =>
        set({
          resources: initialResources,
          projects: initialProjects,
          shikigami: initialShikigami,
          monthlyGoals: initialMonthlyGoals,
          farmingWeek: initialFarmingWeek,
          settings: initialSettings,
        }),
    }),
    {
      name: "onmyoji-resource-planner",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
