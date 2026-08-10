/**
 * Domain rules for Grade Progression.
 * Grade progression is deterministic, ignores rarity, and only depends on current grade.
 */

export const MIN_GRADE = 2;
export const MAX_GRADE = 6;

/**
 * Returns the number of same-grade fodders required to promote a unit to the next grade.
 * Rule: Promoting to grade N+1 requires N fodders of grade N.
 * @param currentGrade The grade of the unit being promoted (e.g. 2 for G2)
 */
export function getPromotionCost(currentGrade: number): number {
  if (currentGrade < MIN_GRADE || currentGrade >= MAX_GRADE) {
    throw new Error(`Invalid grade for promotion: ${currentGrade}`);
  }
  return currentGrade;
}

/**
 * Calculates the total equivalent base G2 fodders required to create a single fodder of targetGrade.
 * Includes the base unit itself.
 * Example: To create 1 G3 fodder, you need 1 G2 base + 2 G2 fodders = 3 G2s.
 */
export function getEquivalentG2Cost(targetGrade: number): number {
  if (targetGrade < MIN_GRADE || targetGrade > MAX_GRADE) {
    throw new Error(`Invalid target grade: ${targetGrade}`);
  }
  if (targetGrade === 2) return 1;
  
  // A G(N) unit is created from a G(N-1) base plus (N-1) G(N-1) fodders.
  // So G(N) = N * G(N-1)
  let cost = 1;
  for (let grade = 2; grade < targetGrade; grade++) {
    cost *= (grade + 1);
  }
  return cost;
}

/**
 * Calculates the net G2 fodders required to promote a unit from currentGrade to targetGrade.
 */
export function calculatePromotionCost(currentGrade: number, targetGrade: number): { requiredG2Fodders: number } {
  if (targetGrade <= currentGrade) return { requiredG2Fodders: 0 };
  const targetCost = getEquivalentG2Cost(targetGrade);
  const currentCost = getEquivalentG2Cost(currentGrade);
  return { requiredG2Fodders: targetCost - currentCost };
}

/**
 * Given a starting inventory and a daily income pipeline, calculates the exact capacity 
 * of G6s currently available, and how many days it will take to reach the target G6 amount.
 * 
 * Uses greedy promotion logic respecting discrete grade boundaries.
 */
export function forecastG6Capacity(
  inventory: { g2: number; g3: number; g4: number; g5: number },
  dailyIncome: { g2: number; g3: number; g4: number; g5: number },
  targetG6: number
): { currentCapacity: number; daysToTarget: number | typeof Infinity } {
  
  // Helper to calculate max G6s achievable with a given inventory
  const calcCapacity = (inv: { g2: number; g3: number; g4: number; g5: number }) => {
    let currentG2 = inv.g2;
    let currentG3 = inv.g3;
    let currentG4 = inv.g4;
    let currentG5 = inv.g5;

    // Promote G2 -> G3
    const newG3 = Math.floor(currentG2 / 3);
    currentG2 -= newG3 * 3;
    currentG3 += newG3;

    // Promote G3 -> G4
    const newG4 = Math.floor(currentG3 / 4);
    currentG3 -= newG4 * 4;
    currentG4 += newG4;

    // Promote G4 -> G5
    const newG5 = Math.floor(currentG4 / 5);
    currentG4 -= newG5 * 5;
    currentG5 += newG5;

    // Build G6
    return Math.floor(currentG5 / 5);
  };

  const currentCapacity = calcCapacity(inventory);
  
  if (currentCapacity >= targetG6) {
    return { currentCapacity, daysToTarget: 0 };
  }

  const totalDailyIncomeG2Eq = 
    dailyIncome.g2 + 
    (dailyIncome.g3 * 3) + 
    (dailyIncome.g4 * 12) + 
    (dailyIncome.g5 * 60);

  if (totalDailyIncomeG2Eq <= 0) {
    return { currentCapacity, daysToTarget: Infinity };
  }

  // Simulate day by day
  const simInv = { ...inventory };
  let days = 0;
  
  // Cap at 10 years to prevent infinite loops if math fails
  const MAX_DAYS = 3650;

  while (days <= MAX_DAYS) {
    // Add income
    simInv.g2 += dailyIncome.g2;
    simInv.g3 += dailyIncome.g3;
    simInv.g4 += dailyIncome.g4;
    simInv.g5 += dailyIncome.g5;
    
    days++;

    // Check capacity
    const projectedCapacity = calcCapacity(simInv);
    if (projectedCapacity >= targetG6) {
      return { currentCapacity, daysToTarget: days };
    }
  }

  return { currentCapacity, daysToTarget: Infinity };
}
