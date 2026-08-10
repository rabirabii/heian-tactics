/**
 * Domain rules for Production Pipeline.
 * Maps player activities to raw resource yields.
 */

import type { ActivityType, ActivityYieldRates } from "@/types/domain/activity";

/**
 * Calculates the total yield from a given number of activity runs.
 * For Phase 1, this uses simple static rates. Later phases will use historical throughput.
 * 
 * @param activity The type of activity
 * @param runCount Number of times the activity is run
 * @param rates The expected yield per run for this activity
 */
export function calculateActivityYield(
  activity: ActivityType,
  runCount: number,
  rates: ActivityYieldRates
): Partial<Record<keyof ActivityYieldRates, number>> {
  if (runCount < 0) {
    throw new Error("Run count cannot be negative");
  }

  const yieldResult: Partial<Record<keyof ActivityYieldRates, number>> = {};
  
  for (const [key, value] of Object.entries(rates)) {
    if (typeof value === "number") {
      yieldResult[key as keyof ActivityYieldRates] = runCount * value;
    }
  }

  return yieldResult;
}

/**
 * Calculates the monthly (30-day) yield given a daily average run count.
 * 
 * @param activity The type of activity
 * @param averageRunsPerDay Number of times the activity is run per day
 * @param rates The expected yield per run for this activity
 */
export function calculateMonthlyYield(
  activity: ActivityType,
  averageRunsPerDay: number,
  rates: ActivityYieldRates
): Partial<Record<keyof ActivityYieldRates, number>> {
  return calculateActivityYield(activity, averageRunsPerDay * 30, rates);
}

/**
 * Single source of truth for calculating expected monthly resource yields
 * based on planned throughputs and weekly patterns.
 */
export function calculateTotalMonthlyProduction(
  plannedThroughputs: Record<ActivityType, any>,
  plannedWeeklyPatterns: Record<ActivityType, any>
): Partial<Record<"coins" | "exp" | "brokenAmulet" | "mysteryAmulet" | "jade" | "ap" | "blackDaruma" | "g2Fodder" | "g3Fodder" | "g4Fodder" | "g5Fodder", number>> {
  
  const overrides: Partial<Record<string, number>> = {};
  
  let totalCoins = 0;
  let totalJade = 0;
  let totalBD = 0;
  let totalAmulets = 0;
  let totalMysteryAmulets = 0;
  let netAP = 0;
  
  let totalG2 = 0;
  let totalG3 = 0;
  let totalG4 = 0;
  let totalG5 = 0;

  Object.values(plannedThroughputs).forEach((throughput: any) => {
    let monthly: Partial<ActivityYieldRates> = {};
    
    // Hardcoded macro flat inputs logic from the UI domain. 
    // This allows the production pipeline to be the single source of truth for these custom rules.
    const pattern = plannedWeeklyPatterns[throughput.activityType as ActivityType];
    const val = pattern?.mon ?? 0;

    if (throughput.activityType === "MonthlyFreebies") {
      monthly = { mysteryAmuletPerRun: val };
    } else if (throughput.activityType === "SpeedChallenge") {
      monthly = { jadePerRun: val > 0 ? (405 * 4.33) : 0 };
    } else if (throughput.activityType === "WeeklyDuel") {
      monthly = { jadePerRun: val * 4.33 };
    } else if (throughput.activityType === "WeeklyShops") {
      monthly = { mysteryAmuletPerRun: val * 4.33 };
    } else if (throughput.activityType === "DailyMissions") {
      monthly = { jadePerRun: val * 30 };
    } else {
      monthly = calculateMonthlyYield(
        throughput.activityType as ActivityType,
        throughput.averageRunsPerDay,
        throughput.rollingYieldRates
      );
    }
    
    totalCoins += monthly.coinsPerRun ?? 0;
    totalJade += monthly.jadePerRun ?? 0;
    totalBD += monthly.blackDarumaPerRun ?? 0;
    totalAmulets += monthly.brokenAmuletPerRun ?? 0;
    totalMysteryAmulets += monthly.mysteryAmuletPerRun ?? 0;
    netAP += (monthly.apPerRun ?? 0) - (monthly.apCostPerRun ?? 0);
    
    totalG2 += monthly.g2FodderPerRun ?? 0;
    totalG3 += monthly.g3FodderPerRun ?? 0;
    totalG4 += monthly.g4FodderPerRun ?? 0;
    totalG5 += monthly.g5FodderPerRun ?? 0;
  });

  overrides.coins = totalCoins;
  overrides.jade = totalJade;
  overrides.blackDaruma = totalBD;
  overrides.brokenAmulet = totalAmulets;
  overrides.mysteryAmulet = totalMysteryAmulets;
  overrides.ap = netAP;
  
  overrides.g2Fodder = totalG2;
  overrides.g3Fodder = totalG3;
  overrides.g4Fodder = totalG4;
  overrides.g5Fodder = totalG5;
  
  return overrides;
}
