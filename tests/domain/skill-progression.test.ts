import { expect, test, describe } from 'vitest';
import { calculateBlackDarumaCost, parseSkillLevel } from '../../src/domain/skill-progression';

describe('Skill Progression Domain Rules', () => {
  test('parseSkillLevel correctly parses strings', () => {
    expect(parseSkillLevel("1/1/1")).toEqual([1, 1, 1]);
    expect(parseSkillLevel("5/5/5")).toEqual([5, 5, 5]);
    expect(parseSkillLevel("1/5/4")).toEqual([1, 5, 4]);
  });

  test('parseSkillLevel throws on invalid input', () => {
    expect(() => parseSkillLevel("1/a/1")).toThrow();
  });

  test('calculateBlackDarumaCost calculates exact BD cost', () => {
    // 1 to 5 on three skills is 4 * 3 = 12
    expect(calculateBlackDarumaCost("1/1/1", "5/5/5")).toBe(12);
    
    // Partial upgrades
    expect(calculateBlackDarumaCost("1/1/1", "1/5/1")).toBe(4);
    expect(calculateBlackDarumaCost("1/4/4", "5/5/5")).toBe(4 + 1 + 1);
    
    // Array inputs
    expect(calculateBlackDarumaCost([1, 1, 1], [5, 5, 5])).toBe(12);
  });

  test('calculateBlackDarumaCost throws on mismatched lengths', () => {
    expect(() => calculateBlackDarumaCost("1/1/1", "5/5")).toThrow();
  });

  test('calculateBlackDarumaCost throws if target is lower', () => {
    expect(() => calculateBlackDarumaCost("5/5/5", "1/1/1")).toThrow();
  });
});
