import { resourceOrder, resourceUnits } from "@/lib/planner-data";
import { calculateBlackDarumaCost } from "@/domain/skill-progression";
import { calculatePromotionCost } from "@/domain/grade-progression";
import type { DomainProject } from "@/types/domain/project";
import type { InventoryResource, InventoryResourceType } from "@/types/domain/inventory";

export interface ResourceGap {
  type: InventoryResourceType;
  required: number;
  available: number;
  gap: number;
  observedYield: number;
  months: number;
}

export interface ProjectForecast {
  project: DomainProject;
  gaps: ResourceGap[];
  monthsToComplete: number;
  completionDate: string;
  resourceProgress: number;
  opportunityCost: string;
}

export interface DashboardSummary {
  currentBlackDaruma: number;
  blackDarumaIncome: number;
  currentJade: number;
  jadeIncome: number;
  currentG6Count: number;
  metaUnitsCompleted: number;
  projectsCompleted: number;
  zenithReadyPercent: number;
  averageCompletionRate: number;
}

const priorityWeight = {
  High: 3,
  Medium: 2,
  Low: 1,
};

export function effectiveAmount(resource: InventoryResource | undefined) {
  if (!resource) return 0;
  return resource.currentAmount + (resource.manualAdjustment ?? 0);
}

export function addMonths(date: Date, months: number) {
  const projectedDate = new Date(date);
  projectedDate.setMonth(projectedDate.getMonth() + Math.ceil(Math.max(months, 0)));
  return projectedDate;
}

export function formatMonth(date: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    year: "numeric",
  }).format(date);
}

export function monthsForRequirement(required: number, current: number, monthlyIncome: number) {
  const gap = Math.max(required - current, 0);
  if (gap === 0) {
    return 0;
  }
  if (monthlyIncome <= 0) {
    return Number.POSITIVE_INFINITY;
  }
  return gap / monthlyIncome;
}

export function forecastProject(
  project: DomainProject,
  resources: Record<InventoryResourceType, InventoryResource>,
  simulatedYieldOverrides?: Partial<Record<InventoryResourceType, number>>,
  now = new Date(),
): ProjectForecast {
  
  const bdRequired = calculateBlackDarumaCost(
    project.unitProgression.skillProgress.currentSkills,
    project.unitProgression.skillProgress.targetSkills
  );
  
  const { requiredG2Fodders } = calculatePromotionCost(
    project.unitProgression.gradeProgress.currentGrade,
    project.unitProgression.gradeProgress.targetGrade
  );
  
  // Note: G2 fodders conceptually map to EXP and g2Fodder inventory, 
  // but for Phase 1, we use a simple placeholder logic based on our inventory types.
  // We approximate 1 G2 Fodder = 1 unit of "exp" resource (just to keep the chart working)
  
  const requirements: Partial<Record<InventoryResourceType, number>> = {
    blackDaruma: bdRequired,
    exp: requiredG2Fodders, // Map G2 fodders directly to the 'exp' track for legacy UI compatibility in Phase 1
  };

    const gaps = resourceOrder
    .map((typeStr) => {
      const type = typeStr as InventoryResourceType;
      const required = requirements[type] ?? 0;
      const available = resources[type] ? effectiveAmount(resources[type]) : 0;
      const gap = Math.max(required - available, 0);
      const observedYield = simulatedYieldOverrides?.[type] ?? resources[type]?.observedYield ?? 0;

      let months = monthsForRequirement(required, available, observedYield);

      // --- BD SYNTHESIS BOTTLENECK LOGIC ---
      if (type === "blackDaruma" && gap > 0) {
        const shardIncome = simulatedYieldOverrides?.blackDarumaShards ?? resources.blackDarumaShards?.observedYield ?? 0;
        const currentShards = resources.blackDarumaShards ? effectiveAmount(resources.blackDarumaShards) : 0;
        
        const effectiveCurrentBD = available + Math.floor(currentShards / 25);
        const effectiveBDIncome = observedYield + (shardIncome / 25);
        
        // Recalculate months based on combined BD + Shards income
        months = monthsForRequirement(required, effectiveCurrentBD, effectiveBDIncome);
      }

      // --- EXP SYNTHESIS BOTTLENECK LOGIC ---
      // 'exp' represents Max Level G2 Fodder requirements in Phase 1.
      // To produce a Max Level G2, you need both EXP (Processing) and Fresh G2s (Supply).
      if (type === "exp" && gap > 0) {
        const amuletIncome = simulatedYieldOverrides?.brokenAmulet ?? resources.brokenAmulet?.observedYield ?? 0;
        const currentAmulets = resources.brokenAmulet ? effectiveAmount(resources.brokenAmulet) : 0;
        
        const expMonths = monthsForRequirement(required, available, observedYield);
        
        // 1 Broken Amulet = 0.5 Fresh G2s
        const freshG2Available = currentAmulets * 0.5;
        const freshG2Income = amuletIncome * 0.5;
        const amuletMonths = monthsForRequirement(gap, freshG2Available, freshG2Income);

        // The true bottleneck is whichever takes longer: getting the EXP or getting the Amulets
        months = Math.max(expMonths, amuletMonths);
      }

      return {
        type,
        required,
        available,
        gap,
        observedYield,
        months,
      };
    })
    .filter((gap) => gap.required > 0);

  const monthsToComplete = gaps.reduce(
    (maxMonths, gap) => Math.max(maxMonths, gap.months),
    0,
  );
  const finiteMonths = Number.isFinite(monthsToComplete) ? monthsToComplete : 999;
  const completionDate = formatMonth(addMonths(now, finiteMonths));
  const resourceProgress = gaps.length
    ? Math.round(
        gaps.reduce((total, gap) => {
          if (gap.required === 0) {
            return total;
          }
          return total + Math.min(gap.available / gap.required, 1);
        }, 0) /
          gaps.length *
          100,
      )
    : 100;

  const opportunityCost =
    bdRequired > 0
      ? `${bdRequired} BD locks ${Math.max(0, 10 - bdRequired)} BD for parallel prep`
      : "No BD cost; mostly farming time";

  return {
    project,
    gaps,
    monthsToComplete,
    completionDate,
    resourceProgress,
    opportunityCost,
  };
}

export function rankProjects(
  projects: DomainProject[], 
  resources: Record<InventoryResourceType, InventoryResource>,
  simulatedYieldOverrides?: Partial<Record<InventoryResourceType, number>>
) {
  return projects
    .filter((project) => project.status !== "Completed")
    .map((project) => {
      const forecast = forecastProject(project, resources, simulatedYieldOverrides);
      const blackDarumaCost = calculateBlackDarumaCost(
        project.unitProgression.skillProgress.currentSkills,
        project.unitProgression.skillProgress.targetSkills
      );
      
      const affordability =
        blackDarumaCost === 0
          ? 1
          : Math.min(effectiveAmount(resources.blackDaruma) / blackDarumaCost, 1);
          
      // Fixed ROI Score for now since DomainProject doesn't have it natively,
      // or we can fallback to Priority weight.
      const roiScore = 75; // Placeholder
      const score =
        roiScore * 0.55 +
        priorityWeight[project.priority] * 12 +
        affordability * 18 -
        Math.min(forecast.monthsToComplete, 12) * 2;

      return {
        ...forecast,
        allocationScore: Math.round(score),
      };
    })
    .sort((firstProject, secondProject) => secondProject.allocationScore - firstProject.allocationScore);
}

export function buildMonthlyProjection(
  resources: Record<InventoryResourceType, InventoryResource>, 
  simulatedYieldOverrides?: Partial<Record<InventoryResourceType, number>>,
  months = 6
) {
  const now = new Date();

  return Array.from({ length: months }, (_, index) => {
    const monthOffset = index + 1;
    const getYield = (type: InventoryResourceType) => simulatedYieldOverrides?.[type] ?? resources[type]?.observedYield ?? 0;
    
    // Calculate synthesized G6
    const maxG2Exp = Math.round(resources.exp ? effectiveAmount(resources.exp) + getYield('exp') * monthOffset : 0);
    const maxAmulets = Math.round(resources.brokenAmulet ? effectiveAmount(resources.brokenAmulet) + getYield('brokenAmulet') * monthOffset : 0);
    // 1 G6 requires 50 Max G2s. 
    // To get Max G2s, we need both EXP and Amulets (0.5 G2 per Amulet).
    // G6 Count = min(maxG2Exp, maxAmulets * 0.5) / 50
    const synthesizedG6 = Math.floor(Math.min(maxG2Exp, maxAmulets * 0.5) / 50);

    // Calculate synthesized Black Daruma (25 shards = 1 BD)
    const baseBD = Math.round(resources.blackDaruma ? effectiveAmount(resources.blackDaruma) + getYield('blackDaruma') * monthOffset : 0);
    const shards = Math.round(resources.blackDarumaShards ? effectiveAmount(resources.blackDarumaShards) + getYield('blackDarumaShards') * monthOffset : 0);
    const synthesizedBD = baseBD + Math.floor(shards / 25);

    // Calculate AP (Sushi) - including Natural Regeneration (288/day = 8640/month)
    const naturalAPRegenMonthly = 8640;
    const apIncomeMonthly = getYield('ap') + naturalAPRegenMonthly;
    const projectedAP = Math.round(resources.ap ? effectiveAmount(resources.ap) + apIncomeMonthly * monthOffset : 0);

    const projectedMysteryAmulets = Math.round(resources.mysteryAmulet ? effectiveAmount(resources.mysteryAmulet) + getYield('mysteryAmulet') * monthOffset : 0);

    return {
      month: formatMonth(addMonths(now, monthOffset)),
      blackDaruma: synthesizedBD,
      jade: Math.round(resources.jade ? effectiveAmount(resources.jade) + getYield('jade') * monthOffset : 0),
      g6: synthesizedG6,
      brokenAmulet: maxAmulets,
      ap: projectedAP,
      mysteryAmulet: projectedMysteryAmulets,
    };
  });
}

export function buildResourceAllocation(resources: Record<InventoryResourceType, InventoryResource>) {
  return resourceOrder.map((typeStr) => {
    const type = typeStr as InventoryResourceType;
    return {
      name: resourceUnits[type as keyof typeof resourceUnits],
      value: Math.max(effectiveAmount(resources[type]), 0),
    };
  });
}

export function summarizeAccount(
  resources: Record<InventoryResourceType, InventoryResource>,
  projects: DomainProject[],
  simulatedYieldOverrides?: Partial<Record<InventoryResourceType, number>>
): DashboardSummary {
  const projectsCompleted = projects.filter((project) => project.status === "Completed").length;
  
  // Calculate average completion rate across all projects using their gaps
  const averageCompletionRate = projects.length
    ? Math.round(
        projects.reduce((total, project) => {
          const forecast = forecastProject(project, resources, simulatedYieldOverrides);
          return total + forecast.resourceProgress;
        }, 0) / projects.length
      )
    : 0;
    
  const currentG6Count = Math.floor(effectiveAmount(resources.exp) / 50);
  const metaUnitsCompleted = projects.filter(
    (project) => project.status === "Completed" || forecastProject(project, resources).resourceProgress >= 90
  ).length;
  
  const zenithReadyPercent = Math.min(
    100,
    Math.round(
      averageCompletionRate * 0.45 +
        Math.min(effectiveAmount(resources.blackDaruma) / 27, 1) * 25 +
        Math.min(effectiveAmount(resources.jade) / 18000, 1) * 15 +
        Math.min(currentG6Count / 6, 1) * 15,
    ),
  );

  return {
    currentBlackDaruma: effectiveAmount(resources.blackDaruma),
    blackDarumaIncome: simulatedYieldOverrides?.blackDaruma ?? resources.blackDaruma.observedYield ?? 0,
    currentJade: effectiveAmount(resources.jade),
    jadeIncome: simulatedYieldOverrides?.jade ?? resources.jade.observedYield ?? 0,
    currentG6Count,
    metaUnitsCompleted,
    projectsCompleted,
    zenithReadyPercent,
    averageCompletionRate,
  };
}
