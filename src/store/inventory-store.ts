"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { InventoryResource, InventoryResourceType } from "@/types/domain/inventory";

interface InventoryStore {
  resources: Record<InventoryResourceType, InventoryResource>;
  updateAmount: (type: InventoryResourceType, newAmount: number, originActivity?: string) => void;
  adjustAmount: (type: InventoryResourceType, change: number, originActivity?: string, transactionDate?: string) => void;
  // Legacy method for UI compatibility
  updateResource: (type: InventoryResourceType, updates: Partial<InventoryResource>) => void;
}

const initialInventory: Record<InventoryResourceType, InventoryResource> = {
  mysteryAmulet: { type: "mysteryAmulet", label: "Mystery Amulets", currentAmount: 0, origins: [] },
  brokenAmulet: { type: "brokenAmulet", label: "Broken Amulets", currentAmount: 0, origins: [] },
  blackDaruma: { type: "blackDaruma", label: "Black Daruma", currentAmount: 0, origins: [] },
  blackDarumaShards: { type: "blackDarumaShards", label: "Black Daruma Shards", currentAmount: 0, origins: [] },
  jade: { type: "jade", label: "Jade", currentAmount: 0, origins: [] },
  ap: { type: "ap", label: "AP", currentAmount: 0, origins: [] },
  coins: { type: "coins", label: "Coins", currentAmount: 0, origins: [] },
  realmRaidTickets: { type: "realmRaidTickets", label: "Realm Raid Tickets", currentAmount: 0, origins: [] },
  exp: { type: "exp", label: "EXP", currentAmount: 0, origins: [] },
  souls: { type: "souls", label: "Souls", currentAmount: 0, origins: [] },
  eventCurrency: { type: "eventCurrency", label: "Event Currency", currentAmount: 0, origins: [] },
  g2Fodder: { type: "g2Fodder", label: "G2 Fodder", currentAmount: 0, origins: [] },
  g3Fodder: { type: "g3Fodder", label: "G3 Fodder", currentAmount: 0, origins: [] },
  g4Fodder: { type: "g4Fodder", label: "G4 Fodder", currentAmount: 0, origins: [] },
  g5Fodder: { type: "g5Fodder", label: "G5 Fodder", currentAmount: 0, origins: [] },
};

export const useInventoryStore = create<InventoryStore>()(
  persist(
    (set) => ({
      resources: initialInventory,
      updateAmount: (type, newAmount, originActivity) =>
        set((state) => {
          const resource = state.resources[type];
          const change = newAmount - resource.currentAmount;
          return {
            resources: {
              ...state.resources,
              [type]: {
                ...resource,
                currentAmount: Math.max(newAmount, 0),
                origins: change !== 0 ? [
                  {
                    activityType: originActivity,
                    date: new Date().toISOString(),
                    amount: change,
                  },
                  ...resource.origins,
                ].slice(0, 50) : resource.origins,
              },
            },
          };
        }),
      adjustAmount: (type, change, originActivity, transactionDate) =>
        set((state) => {
          const resource = state.resources[type];
          return {
            resources: {
              ...state.resources,
              [type]: {
                ...resource,
                currentAmount: Math.max(resource.currentAmount + change, 0),
                origins: change !== 0 ? [
                  {
                    activityType: originActivity,
                    date: transactionDate ?? new Date().toISOString(),
                    amount: change,
                  },
                  ...resource.origins,
                ].slice(0, 50) : resource.origins,
              },
            },
          };
        }),
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
    }),
    {
      name: "domain-inventory-store",
      storage: createJSONStorage(() => localStorage),
      merge: (persistedState: any, currentState) => {
        return {
          ...currentState,
          ...persistedState,
          resources: {
            ...currentState.resources,
            ...(persistedState?.resources || {}),
          },
        };
      },
    }
  )
);
