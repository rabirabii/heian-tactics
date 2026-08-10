import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface OwnedShikigami {
  id: string;
  grade: number; // e.g. 6 for G6
  skills: [number, number, number]; // e.g. [5, 5, 5]
  level: number;
}

interface RosterState {
  owned: Record<string, OwnedShikigami>;
  toggleOwnership: (id: string) => void;
  updateShikigami: (id: string, updates: Partial<OwnedShikigami>) => void;
}

export const useRosterStore = create<RosterState>()(
  persist(
    (set) => ({
      owned: {},
      toggleOwnership: (id) =>
        set((state) => {
          const newOwned = { ...state.owned };
          if (newOwned[id]) {
            delete newOwned[id];
          } else {
            newOwned[id] = { id, grade: 6, skills: [1, 1, 1], level: 40 };
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
