export type ResourceType =
  | "blackDaruma"
  | "blackDarumaShards"
  | "jade"
  | "ap"
  | "coins"
  | "realmRaidTickets"
  | "exp"
  | "souls"
  | "eventCurrency";

export type Priority = "Low" | "Medium" | "High";
export type ProjectStatus = "Planning" | "Building" | "Ready" | "Completed";
export type PvpStatus = "Bench" | "Core" | "Flex" | "Testing";
export type ShikigamiStatus = "Planning" | "Building" | "Ready" | "Completed";
export type MetaTier = "S" | "A" | "B" | "Niche";

export type SoulStat =
  | "SPD"
  | "CRT"
  | "CRT DMG"
  | "Effect Hit"
  | "Effect RES"
  | "ATK"
  | "HP"
  | "DEF";

export interface ResourceHistoryEntry {
  id: string;
  date: string;
  change: number;
  note: string;
}

export interface Resource {
  type: ResourceType;
  label: string;
  currentAmount: number;
  monthlyIncome: number;
  manualAdjustment: number;
  notes: string;
  history: ResourceHistoryEntry[];
}

export type ResourceRequirement = Partial<Record<ResourceType, number>>;

export interface ProjectRequirement {
  resources: ResourceRequirement;
  g6Count?: number;
  soulSet?: string;
  minSpd?: number;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  priority: Priority;
  status: ProjectStatus;
  expectedCompletion: string;
  currentProgress: number;
  requirements: ProjectRequirement;
  roiScore: number;
  notes: string;
}

export interface SoulPreset {
  id: string;
  name: string;
  soulSet: string;
  stats: Partial<Record<SoulStat, number>>;
  notes: string;
}

export interface Shikigami {
  id: string;
  name: string;
  grade: number;
  skillLevel: string;
  blackDarumaRequired: number;
  soulSet: string;
  currentBuild: string;
  priority: Priority;
  pvpStatus: PvpStatus;
  metaTier: MetaTier;
  notes: string;
  status: ShikigamiStatus;
  soulPresets: SoulPreset[];
}

export interface FarmingDay {
  date: string;
  exploration: number;
  soul: number;
  realmRaid: number;
  boss: number;
  guild: number;
  events: number;
}

export interface MonthlyGoal {
  id: string;
  label: string;
  target: number;
  current: number;
  unit: string;
}

export interface PlannerSettings {
  gameServer: string;
  targetZenithSeason: string;
  averageBlackDarumaPerMonth: number;
  averageJadePerMonth: number;
  forecastAssumptions: string;
}
