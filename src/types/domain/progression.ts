// Domain types for Progression Systems

export type Grade = 2 | 3 | 4 | 5 | 6;

export interface GradeProgressionState {
  currentGrade: Grade;
  targetGrade: Grade;
}

export interface SkillProgressionState {
  currentSkills: number[]; // e.g. [1, 1, 1]
  targetSkills: number[];  // e.g. [5, 5, 5]
}

// A single unit's progression tracker
export interface UnitProgression {
  unitId: string;
  name: string;
  gradeProgress: GradeProgressionState;
  skillProgress: SkillProgressionState;
  soulSetTarget?: string;
  minSpdTarget?: number;
}
