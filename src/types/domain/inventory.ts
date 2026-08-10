// Domain types for Inventory / Resource Pools

export type InventoryResourceType =
  | "mysteryAmulet"
  | "brokenAmulet"
  | "blackDaruma"
  | "blackDarumaShards"
  | "jade"
  | "ap"
  | "coins"
  | "realmRaidTickets"
  | "exp"           // Tracked internally, but models intermediate resource
  | "souls"
  | "eventCurrency"
  | "g2Fodder"      // Added specifically for the domain model
  | "g3Fodder"
  | "g4Fodder"
  | "g5Fodder";

export interface ResourceOrigin {
  activityType?: string; // If null, it was a manual/system adjustment
  date: string;
  amount: number;
}

export interface InventoryResource {
  type: InventoryResourceType;
  label: string;
  currentAmount: number;
  origins: ResourceOrigin[];
  // Legacy fields kept for cold-start defaults only
  /** 
   * Observed production throughput per month.
   * Derived from historical activities, representing the empirical baseline of the account.
   */
  observedYield?: number; 
  manualAdjustment?: number;
  notes?: string;
}
