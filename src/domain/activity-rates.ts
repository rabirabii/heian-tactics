import { ActivityType, ActivityYieldRates } from "@/types/domain/activity";

export const defaultActivityRates: Record<ActivityType, ActivityYieldRates> = {
  Exploration: { coinsPerRun: 500, g2FodderPerRun: 0.1, brokenAmuletPerRun: 0.3, apCostPerRun: 3 },
  SoulZone: { coinsPerRun: 200, soulsPerRun: 1.5, g6FodderPerRun: 0.005, apCostPerRun: 4 },
  RealmRaid: { coinsPerRun: 1000, jadePerRun: 1.67 },
  DemonEncounter: { coinsPerRun: 50000, blackDarumaShardsPerRun: 2 },
  GuildBoss: { coinsPerRun: 20000 },
  Event: { coinsPerRun: 1000, eventCurrencyPerRun: 100 },
  AreaBoss: { coinsPerRun: 20000, jadePerRun: 20 },
  Netherworld: { coinsPerRun: 50000, blackDarumaShardsPerRun: 3 },
  RealmCardJade: { coinsPerRun: 0, jadePerRun: 192 },
  RealmCardAP: { coinsPerRun: 0, apPerRun: 312 },
  EntrustJade: { coinsPerRun: 0, jadePerRun: 50 },
  EntrustAP: { coinsPerRun: 0, apPerRun: 84 },
  DailyMissions: { coinsPerRun: 0, jadePerRun: 80 },
  WeeklyDuel: { coinsPerRun: 0, jadePerRun: 1 }, // Flat input by user
  SpeedChallenge: { coinsPerRun: 0, jadePerRun: 405 },
  WeeklyShops: { coinsPerRun: 0, mysteryAmuletPerRun: 1 }, // Flat input by user
  MonthlyFreebies: { coinsPerRun: 0, mysteryAmuletPerRun: 1 }, // Flat input by user
};
