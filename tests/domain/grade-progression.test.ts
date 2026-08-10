import { expect, test, describe } from 'vitest';
import { getPromotionCost, getEquivalentG2Cost } from '../../src/domain/grade-progression';

describe('Grade Progression Domain Rules', () => {
  test('getPromotionCost returns correct fodder count', () => {
    // G2 -> G3 requires 2 G2s
    expect(getPromotionCost(2)).toBe(2);
    // G3 -> G4 requires 3 G3s
    expect(getPromotionCost(3)).toBe(3);
    // G4 -> G5 requires 4 G4s
    expect(getPromotionCost(4)).toBe(4);
    // G5 -> G6 requires 5 G5s
    expect(getPromotionCost(5)).toBe(5);
  });

  test('getPromotionCost throws on invalid grades', () => {
    expect(() => getPromotionCost(1)).toThrow();
    expect(() => getPromotionCost(6)).toThrow();
  });

  test('getEquivalentG2Cost calculates compounding cost correctly', () => {
    // A G2 unit is just 1 G2
    expect(getEquivalentG2Cost(2)).toBe(1);
    
    // A G3 unit requires: 1 G2 base + 2 G2 fodders = 3 G2s
    expect(getEquivalentG2Cost(3)).toBe(3);
    
    // A G4 unit requires: 1 G3 base + 3 G3 fodders = 4 G3s = 4 * 3 = 12 G2s
    expect(getEquivalentG2Cost(4)).toBe(12);
    
    // A G5 unit requires: 1 G4 base + 4 G4 fodders = 5 G4s = 5 * 12 = 60 G2s
    expect(getEquivalentG2Cost(5)).toBe(60);
    
    // A G6 unit requires: 1 G5 base + 5 G5 fodders = 6 G5s = 6 * 60 = 360 G2s
    expect(getEquivalentG2Cost(6)).toBe(360);
  });
});
