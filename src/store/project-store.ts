"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { DomainProject, ProjectPriority, ProjectStatus } from "@/types/domain/project";

interface ProjectStore {
  projects: Record<string, DomainProject>;
  addProject: (project: Omit<DomainProject, "status">) => void;
  updateProject: (id: string, updates: Partial<DomainProject>) => void;
  updateProjectStatus: (id: string, status: ProjectStatus) => void;
  removeProject: (id: string) => void;
}

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set) => ({
      projects: {},
      addProject: (project) =>
        set((state) => ({
          projects: {
            ...state.projects,
            [project.id]: {
              ...project,
              status: "Planning",
            },
          },
        })),
      updateProject: (id, updates) =>
        set((state) => {
          const p = state.projects[id];
          if (!p) return state;
          return {
            projects: {
              ...state.projects,
              [id]: { ...p, ...updates },
            },
          };
        }),
      updateProjectStatus: (id, status) =>
        set((state) => {
          const p = state.projects[id];
          if (!p) return state;
          return {
            projects: {
              ...state.projects,
              [id]: { ...p, status },
            },
          };
        }),
      removeProject: (id) =>
        set((state) => {
          const newProjects = { ...state.projects };
          delete newProjects[id];
          return { projects: newProjects };
        }),
    }),
    {
      name: "domain-project-store",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
