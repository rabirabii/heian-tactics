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
          console.log("toggleOwnership CALLED FOR ID:", id, "PRESET:", preset);
          const newOwned = { ...state.owned };
          if (newOwned[id]) {
            delete newOwned[id];
          } else {
            newOwned[id] = { 
              id, 
              grade: preset?.grade ?? 6, 
              level: preset?.level ?? 40, 
              skills: preset?.skills ?? [], 
              projectId: preset?.projectId 
            };
            console.log("SAVED TO NEW OWNED:", newOwned[id]);
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
