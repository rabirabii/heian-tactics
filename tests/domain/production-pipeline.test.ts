import { expect, test, describe } from 'vitest';
import { calculateActivityYield, calculateMonthlyYield } from '../../src/domain/production-pipeline';

describe('Production Pipeline Domain Rules', () => {
  test('calculateActivityYield scales yields based on run count', () => {
    const rates = { coinsPerRun: 500, g2FodderPerRun: 0.1 };
    
    const yield10 = calculateActivityYield("Exploration", 10, rates);
    expect(yield10.coinsPerRun).toBe(5000);
    expect(yield10.g2FodderPerRun).toBe(1);
    expect(yield10.soulsPerRun).toBeUndefined();
  });

  test('calculateMonthlyYield scales yields by 30 days', () => {
    const ratesWithSouls = { coinsPerRun: 200, soulsPerRun: 1.5, g6FodderPerRun: 0.01 };
    
    // 10 runs per day * 30 days = 300 runs
    const yieldMonth = calculateMonthlyYield("SoulZone", 10, ratesWithSouls);
    
    expect(yieldMonth.coinsPerRun).toBe(10 * 30 * 200);
    expect(yieldMonth.soulsPerRun).toBe(10 * 30 * 1.5);
    expect(yieldMonth.g6FodderPerRun).toBe(10 * 30 * 0.01);
  });

  test('calculateActivityYield throws on negative runs', () => {
    expect(() => calculateActivityYield("Exploration", -5, { coinsPerRun: 100 })).toThrow();
  });
});
