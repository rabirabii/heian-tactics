export type ActivityType = 
  | "Exploration" 
  | "SoulZone" 
  | "RealmRaid" 
  | "DemonEncounter" 
  | "GuildBoss" 
  | "Event" 
  | "AreaBoss" 
  | "Netherworld"
  | "RealmCardJade"
  | "RealmCardAP"
  | "EntrustJade"
  | "EntrustAP"
  | "DailyMissions"
  | "WeeklyDuel"
  | "SpeedChallenge"
  | "WeeklyShops"
  | "MonthlyFreebies";

export interface ActivityYieldRates {
  coinsPerRun?: number;
  apCostPerRun?: number;
  apPerRun?: number; // Passive AP income
  mysteryAmuletPerRun?: number; // For Summon tracking
  soulsPerRun?: number;
  g2FodderPerRun?: number;
  g3FodderPerRun?: number;
  g4FodderPerRun?: number;
  g5FodderPerRun?: number;
  g6FodderPerRun?: number;
  jadePerRun?: number;
  brokenAmuletPerRun?: number;
  blackDarumaPerRun?: number;
  blackDarumaShardsPerRun?: number;
  realmRaidTicketsPerRun?: number;
  eventCurrencyPerRun?: number;
}

export interface WeeklyActivityPattern {
  mon: number;
  tue: number;
  wed: number;
  thu: number;
  fri: number;
  sat: number;
  sun: number;
}

export interface ActivityLog {
  id: string;
  activityType: ActivityType;
  runCount: number;
  date: string;
}

export interface ActivityThroughput {
  activityType: ActivityType;
  averageRunsPerDay: number;
  rollingYieldRates: ActivityYieldRates;
}
