import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface OwnedShikigami {
  id: string;
  grade: number; // e.g. 6 for G6
  skills: { skillId: string; level: number }[];
  level: number;
  projectId?: string;
}

interface RosterState {
  owned: Record<string, OwnedShikigami>;
  toggleOwnership: (id: string, preset?: Omit<OwnedShikigami, 'id'>) => void;
  updateShikigami: (id: string, updates: Partial<OwnedShikigami>) => void;
}

export const useRosterStore = create<RosterState>()(
  persist(
    (set) => ({
      owned: {},
      toggleOwnership: (id, preset) =>
        set((state) => {
          const newOwned = { ...state.owned };
          if (newOwned[id]) {
            delete newOwned[id];
          } else {
            newOwned[id] = { id, ...(preset || { grade: 6, skills: [], level: 40 }) };
          }
          return { owned: newOwned };
        }),
      updateShikigami: (id, updates) =>
        set((state) => ({
          owned: {
            ...state.owned,
            [id]: {
              ...state.owned[id],
              ...updates,
            },
          },
        })),
    }),
    {
      name: 'onmyoji-roster-storage',
    }
  )
);
