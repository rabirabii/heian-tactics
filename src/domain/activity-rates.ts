import { ActivityType, ActivityYieldRates } from "@/types/domain/activity";

export const defaultActivityRates: Record<ActivityType, ActivityYieldRates> = {
  Exploration: { apCostPerRun: 3 },
  SoulZone: { soulsPerRun: 1.5, g6FodderPerRun: 0.005, apCostPerRun: 4 },
  RealmRaid: { jadePerRun: 1.67 },
  DemonEncounter: { blackDarumaShardsPerRun: 2 },
  GuildBoss: { }, // Now empty since it only dropped coins
  Event: { eventCurrencyPerRun: 100 },
  AreaBoss: { jadePerRun: 20 },
  Netherworld: { blackDarumaShardsPerRun: 3 },
  RealmCardJade: { jadePerRun: 192 },
  RealmCardAP: { apPerRun: 312 },
  EntrustJade: { jadePerRun: 50 },
  EntrustAP: { apPerRun: 84 },
  DailyMissions: { jadePerRun: 80 },
  WeeklyDuel: { jadePerRun: 1 }, 
  SpeedChallenge: { jadePerRun: 405 },
  WeeklyShops: { mysteryAmuletPerRun: 1 }, 
  MonthlyFreebies: { mysteryAmuletPerRun: 1 }, 
};
