import type {
  FarmingDay,
  MonthlyGoal,
  PlannerSettings,
  Project,
  Resource,
  ResourceType,
  Shikigami,
} from "@/types/planner";

export const resourceOrder: ResourceType[] = [
  "blackDaruma",
  "blackDarumaShards",
  "jade",
  "ap",
  "coins",
  "realmRaidTickets",
  "exp",
  "souls",
  "eventCurrency",
];

export const resourceLabels: Record<ResourceType, string> = {
  blackDaruma: "Black Daruma",
  blackDarumaShards: "Black Daruma Shards",
  jade: "Jade",
  ap: "AP",
  coins: "Coins",
  realmRaidTickets: "Realm Raid Tickets",
  exp: "EXP",
  souls: "Souls",
  eventCurrency: "Event Currency",
};

export const resourceUnits: Record<ResourceType, string> = {
  blackDaruma: "BD",
  blackDarumaShards: "shards",
  jade: "jade",
  ap: "AP",
  coins: "coins",
  realmRaidTickets: "tickets",
  exp: "EXP",
  souls: "sets",
  eventCurrency: "currency",
};

export const initialResources: Record<ResourceType, Resource> = {
  blackDaruma: {
    type: "blackDaruma",
    label: "Black Daruma",
    currentAmount: 14,
    monthlyIncome: 10,
    manualAdjustment: 0,
    notes: "Baseline from weekly, event, and shrine sources.",
    history: [],
  },
  blackDarumaShards: {
    type: "blackDarumaShards",
    label: "Black Daruma Shards",
    currentAmount: 23,
    monthlyIncome: 35,
    manualAdjustment: 0,
    notes: "Convert at 25 shards per Black Daruma.",
    history: [],
  },
  jade: {
    type: "jade",
    label: "Jade",
    currentAmount: 8200,
    monthlyIncome: 4800,
    manualAdjustment: 0,
    notes: "Planning reserve excludes emergency summon fund.",
    history: [],
  },
  ap: {
    type: "ap",
    label: "AP",
    currentAmount: 5200,
    monthlyIncome: 9200,
    manualAdjustment: 0,
    notes: "Mostly allocated to soul weekends.",
    history: [],
  },
  coins: {
    type: "coins",
    label: "Coins",
    currentAmount: 18500000,
    monthlyIncome: 9000000,
    manualAdjustment: 0,
    notes: "Skill upgrades and soul rolling reserve.",
    history: [],
  },
  realmRaidTickets: {
    type: "realmRaidTickets",
    label: "Realm Raid Tickets",
    currentAmount: 112,
    monthlyIncome: 820,
    manualAdjustment: 0,
    notes: "Monthly goal tied to 800 raids.",
    history: [],
  },
  exp: {
    type: "exp",
    label: "EXP",
    currentAmount: 74,
    monthlyIncome: 52,
    manualAdjustment: 0,
    notes: "Tracked as G6-equivalent fodder blocks.",
    history: [],
  },
  souls: {
    type: "souls",
    label: "Souls",
    currentAmount: 18,
    monthlyIncome: 8,
    manualAdjustment: 0,
    notes: "Usable high-quality soul pieces.",
    history: [],
  },
  eventCurrency: {
    type: "eventCurrency",
    label: "Event Currency",
    currentAmount: 4600,
    monthlyIncome: 6000,
    manualAdjustment: 0,
    notes: "Event shop planning pool.",
    history: [],
  },
};

export const initialProjects: Project[] = [
  {
    id: "project-sp-susanoo",
    name: "Finish SP Susanoo",
    description: "Primary burst slot for Zenith draft flexibility.",
    priority: "High",
    status: "Building",
    expectedCompletion: "2026-10-01",
    currentProgress: 72,
    requirements: {
      resources: { blackDaruma: 9, souls: 4, coins: 3500000 },
      g6Count: 1,
      soulSet: "Shadow",
      minSpd: 161,
    },
    roiScore: 94,
    notes: "Biggest immediate PvP roster impact.",
  },
  {
    id: "project-sp-kaguya",
    name: "Prepare SP Kaguya",
    description: "Support core for orb stability and draft resilience.",
    priority: "High",
    status: "Planning",
    expectedCompletion: "2026-11-01",
    currentProgress: 38,
    requirements: {
      resources: { blackDaruma: 8, souls: 3, jade: 1200 },
      g6Count: 1,
      soulSet: "Azure Basan",
      minSpd: 154,
    },
    roiScore: 86,
    notes: "Good partial build if BD is constrained.",
  },
  {
    id: "project-control-core",
    name: "Control Core Refresh",
    description: "Upgrade effect hit and speed benchmarks for control units.",
    priority: "Medium",
    status: "Building",
    expectedCompletion: "2026-09-15",
    currentProgress: 54,
    requirements: {
      resources: { souls: 7, coins: 5000000, ap: 2400 },
      soulSet: "Mixed Control",
      minSpd: 158,
    },
    roiScore: 72,
    notes: "No BD cost, high farming dependency.",
  },
  {
    id: "project-summon-buffer",
    name: "Zenith Summon Buffer",
    description: "Rebuild jade reserve before season banner pressure.",
    priority: "Low",
    status: "Planning",
    expectedCompletion: "2026-12-01",
    currentProgress: 22,
    requirements: {
      resources: { jade: 18000, eventCurrency: 9000 },
    },
    roiScore: 58,
    notes: "Defer if current roster closes earlier.",
  },
];

export const initialShikigami: Shikigami[] = [
  {
    id: "shiki-sp-susanoo",
    name: "SP Susanoo",
    grade: 6,
    skillLevel: "5/5/3",
    blackDarumaRequired: 9,
    soulSet: "Shadow",
    currentBuild: "Build A",
    priority: "High",
    pvpStatus: "Core",
    metaTier: "S",
    notes: "Target full skill before Zenith.",
    status: "Building",
    soulPresets: [
      {
        id: "susanoo-a",
        name: "Build A",
        soulSet: "Shadow",
        stats: { SPD: 161, CRT: 100, "CRT DMG": 246, ATK: 7900 },
        notes: "Main speed contest set.",
      },
      {
        id: "susanoo-b",
        name: "Build B",
        soulSet: "Shadow",
        stats: { SPD: 154, CRT: 100, "CRT DMG": 268, ATK: 8200 },
        notes: "Damage-biased fallback.",
      },
      {
        id: "susanoo-c",
        name: "Build C",
        soulSet: "Broken Set",
        stats: { SPD: 168, CRT: 92, "CRT DMG": 231 },
        notes: "Emergency speed benchmark.",
      },
    ],
  },
  {
    id: "shiki-sp-kaguya",
    name: "SP Kaguya",
    grade: 5,
    skillLevel: "3/4/4",
    blackDarumaRequired: 8,
    soulSet: "Azure Basan",
    currentBuild: "Draft Support",
    priority: "High",
    pvpStatus: "Flex",
    metaTier: "S",
    notes: "Needs G6 and skill investment.",
    status: "Planning",
    soulPresets: [
      {
        id: "kaguya-support",
        name: "Draft Support",
        soulSet: "Azure Basan",
        stats: { SPD: 154, HP: 25000, DEF: 760, "Effect RES": 48 },
        notes: "Stable support configuration.",
      },
    ],
  },
];

export const initialMonthlyGoals: MonthlyGoal[] = [
  { id: "goal-rr", label: "Farm Realm Raid", target: 800, current: 486, unit: "runs" },
  { id: "goal-exploration", label: "Farm Exploration", target: 1200, current: 735, unit: "runs" },
  { id: "goal-bd", label: "Obtain Black Daruma", target: 10, current: 6, unit: "BD" },
  { id: "goal-g6": label: "Complete G6", target: 2, current: 1, unit: "units" },
  { id: "goal-souls": label: "Farm Soul", target: 16, current: 9, unit: "sessions" },
  { id: "goal-event": label: "Complete Event", target: 100, current: 62, unit: "%" },
];

export const initialFarmingWeek: FarmingDay[] = [
  { date: "Mon", exploration: 92, soul: 18, realmRaid: 96, boss: 4, guild: 7, events: 42 },
  { date: "Tue", exploration: 118, soul: 22, realmRaid: 108, boss: 5, guild: 7, events: 54 },
  { date: "Wed", exploration: 74, soul: 14, realmRaid: 82, boss: 3, guild: 6, events: 38 },
  { date: "Thu": exploration: 136, soul: 26, realmRaid: 121, boss: 5, guild: 7, events: 66 },
  { date: "Fri": exploration: 88, soul: 20, realmRaid: 92, boss: 4, guild: 7, events: 44 },
  { date: "Sat": exploration: 154, soul: 38, realmRaid: 148, boss: 5, guild: 7, events: 88 },
  { date: "Sun": exploration: 128, soul: 34, realmRaid: 136, boss: 5, guild: 7, events: 76 },
];

export const initialSettings: PlannerSettings = {
  gameServer: "Global",
  targetZenithSeason: "Zenith S9",
  averageBlackDarumaPerMonth: 10,
  averageJadePerMonth: 4800,
  forecastAssumptions: "Linear monthly income, no surprise event windfalls.",
};

// Exported constants for UI
export const statusColumns: ProjectStatus[] = ["Planning", "Building", "Ready", "Completed"];

export const pieColors = ["#7c3aed", "#16a34a", "#0891b2", "#db2777", "#ca8a04", "#475569"];