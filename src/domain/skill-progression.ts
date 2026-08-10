/**
 * Domain rules for Skill Progression.
 * Skill progression is independent of grade and exclusively uses Black Daruma.
 */

/**
 * Validates a skill string array (e.g. ["1/1/1", "5/5/5"])
 */
export function parseSkillLevel(skillString: string): number[] {
  const parts = skillString.split('/').map(Number);
  if (parts.some(isNaN)) {
    throw new Error(`Invalid skill format: ${skillString}`);
  }
  return parts;
}

/**
 * Calculates the number of Black Daruma required to reach the target skill level.
 * @param currentSkill The current skill level (e.g. "1/1/1" or [1,1,1])
 * @param targetSkill The target skill level (e.g. "5/5/5" or [5,5,5])
 */
export function calculateBlackDarumaCost(currentSkill: string | number[], targetSkill: string | number[]): number {
  const current = typeof currentSkill === 'string' ? parseSkillLevel(currentSkill) : currentSkill;
  const target = typeof targetSkill === 'string' ? parseSkillLevel(targetSkill) : targetSkill;

  if (current.length !== target.length) {
    throw new Error("Current and target skill arrays must have the same length");
  }

  let totalCost = 0;
  for (let i = 0; i < current.length; i++) {
    if (target[i] < current[i]) {
      throw new Error(`Target skill level cannot be lower than current skill level (Skill ${i + 1})`);
    }
    totalCost += (target[i] - current[i]);
  }

  return totalCost;
}
