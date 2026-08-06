import { resourceOrder, resourceUnits } from "@/lib/planner-data";
import type { Project, Resource, ResourceType } from "@/types/planner";

export interface ResourceGap {
  type: ResourceType;
  required: number;
  available: number;
  gap: number;
  monthlyIncome: number;
  months: number;
}

export interface ProjectForecast {
  project: Project;
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

export function effectiveAmount(resource: Resource) {
  return resource.currentAmount + resource.manualAdjustment;
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
  project: Project,
  resources: Record<ResourceType, Resource>,
  now = new Date(),
): ProjectForecast {
  const gaps = resourceOrder
    .map((type) => {
      const required = project.requirements.resources[type] ?? 0;
      const available = effectiveAmount(resources[type]);
      const gap = Math.max(required - available, 0);
      const monthlyIncome = resources[type].monthlyIncome;

      return {
        type,
        required,
        available,
        gap,
        monthlyIncome,
        months: monthsForRequirement(required, available, monthlyIncome),
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
    : project.currentProgress;

  const bdRequired = project.requirements.resources.blackDaruma ?? 0;
  const opportunityCost =
    bdRequired > 0
      ? `${bdRequired} BD locks ${Math.max(0, 10 - bdRequired)} BD for parallel prep`
      : "No BD cost; mostly farming time";

  return {
    project,
    gaps,
    monthsToComplete,
    completionDate,
    resourceProgress: Math.max(project.currentProgress, resourceProgress),
    opportunityCost,
  };
}

export function rankProjects(projects: Project[], resources: Record<ResourceType, Resource>) {
  return projects
    .filter((project) => project.status !== "Completed")
    .map((project) => {
      const forecast = forecastProject(project, resources);
      const blackDarumaCost = project.requirements.resources.blackDaruma ?? 0;
      const affordability =
        blackDarumaCost === 0
          ? 1
          : Math.min(effectiveAmount(resources.blackDaruma) / blackDarumaCost, 1);
      const score =
        project.roiScore * 0.55 +
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

export function buildMonthlyProjection(resources: Record<ResourceType, Resource>, months = 6) {
  const now = new Date();

  return Array.from({ length: months }, (_, index) => {
    const monthOffset = index + 1;
    return {
      month: formatMonth(addMonths(now, monthOffset)),
      blackDaruma: Math.round(effectiveAmount(resources.blackDaruma) + resources.blackDaruma.monthlyIncome * monthOffset),
      jade: Math.round(effectiveAmount(resources.jade) + resources.jade.monthlyIncome * monthOffset),
      g6: Math.round(effectiveAmount(resources.exp) / 50 + (resources.exp.monthlyIncome / 50) * monthOffset),
    };
  });
}

export function buildResourceAllocation(resources: Record<ResourceType, Resource>) {
  return resourceOrder.map((type) => ({
    name: resourceUnits[type],
    value: Math.max(effectiveAmount(resources[type]), 0),
  }));
}

export function summarizeAccount(
  resources: Record<ResourceType, Resource>,
  projects: Project[],
): DashboardSummary {
  const projectsCompleted = projects.filter((project) => project.status === "Completed").length;
  const averageCompletionRate = projects.length
    ? Math.round(
        projects.reduce((total, project) => total + project.currentProgress, 0) /
          projects.length,
      )
    : 0;
  const currentG6Count = Math.floor(effectiveAmount(resources.exp) / 50);
  const metaUnitsCompleted = projects.filter(
    (project) => project.status === "Completed" || project.currentProgress >= 90,
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
    blackDarumaIncome: resources.blackDaruma.monthlyIncome,
    currentJade: effectiveAmount(resources.jade),
    jadeIncome: resources.jade.monthlyIncome,
    currentG6Count,
    metaUnitsCompleted,
    projectsCompleted,
    zenithReadyPercent,
    averageCompletionRate,
  };
}
