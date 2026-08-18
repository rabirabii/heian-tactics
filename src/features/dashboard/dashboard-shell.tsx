"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  BarChart3,
  CalendarDays,
  Gauge,
  Moon,
  Plus,
  Settings,
  Target,
  TrendingUp,
} from "lucide-react";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FieldError, Input, Label, Select, Textarea } from "@/components/ui/form";
import { Progress } from "@/components/ui/progress";
import {
  buildMonthlyProjection,
  buildResourceAllocation,
  rankProjects,
  summarizeAccount,
} from "@/lib/forecast";
import { resourceLabels, resourceOrder } from "@/lib/planner-data";
import { cn } from "@/lib/utils";
import { useProjectStore } from "@/store/project-store";
import { useInventoryStore } from "@/store/inventory-store";
import type { InventoryResource, InventoryResourceType } from "@/types/domain/inventory";

// Cleaned up legacy mapping

const resourceAdjustmentSchema = z.object({
  type: z.enum([
    "blackDaruma",
    "blackDarumaShards",
    "jade",
    "ap",
    "coins",
    "realmRaidTickets",
    "exp",
    "souls",
    "eventCurrency",
  ]),
  change: z.coerce.number().finite(),
  note: z.string().min(2, "Add a short note"),
});

const projectSchema = z.object({
  name: z.string().min(3, "Name is required"),
  description: z.string().min(3, "Description is required"),
  priority: z.enum(["Low", "Medium", "High"]),
  blackDaruma: z.coerce.number().min(0),
  jade: z.coerce.number().min(0),
  souls: z.coerce.number().min(0),
  minSpd: z.coerce.number().min(0),
  soulSet: z.string().min(2, "Soul set is required"),
  expectedCompletion: z.string().min(1, "Expected date is required"),
  roiScore: z.coerce.number().min(1).max(100),
  notes: z.string().optional(),
});

const settingsSchema = z.object({
  gameServer: z.string().min(2),
  targetZenithSeason: z.string().min(2),
  averageBlackDarumaPerMonth: z.coerce.number().min(0),
  averageJadePerMonth: z.coerce.number().min(0),
  forecastAssumptions: z.string().min(3),
});

type ResourceAdjustmentInput = z.input<typeof resourceAdjustmentSchema>;
type ResourceAdjustmentValues = z.output<typeof resourceAdjustmentSchema>;
type ProjectFormInput = z.input<typeof projectSchema>;
type ProjectFormValues = z.output<typeof projectSchema>;
type SettingsFormInput = z.input<typeof settingsSchema>;
type SettingsFormValues = z.output<typeof settingsSchema>;

const pieColors = ["var(--foreground)", "var(--text-secondary)", "var(--text-secondary)", "var(--border-ink)", "var(--border-ink)", "var(--surface)"];


function formatNumber(value: number) {
  return new Intl.NumberFormat("en", {
    notation: Math.abs(value) >= 1000000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(value);
}

function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-2xl font-black ink">{title}</h1>
        <p className="mt-1 max-w-2xl text-sm text-secondary">{description}</p>
      </div>
      {action}
    </header>
  );
}

export { PageHeader };

function MetricCard({
  label,
  value,
  detail,
  Icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  detail: string;
  Icon: LucideIcon;
  accent: string;
}) {
  return (
    <div className="border border-[var(--border-ink)] bg-[var(--surface)] rounded-[var(--radius-medium)] p-4 min-h-24 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-data text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">{label}</p>
          <p className="font-data mt-1.5 text-3xl font-black text-[var(--foreground)]">{value}</p>
          <p className="mt-1 text-xs font-data text-[var(--text-secondary)]">{detail}</p>
        </div>
        <div className={cn(
          "border border-[var(--border-ink)] rounded-[var(--radius-small)] p-2.5 shadow-sm flex items-center justify-center",
          accent ? "bg-[var(--foreground)] text-[var(--background)]" : "bg-[var(--surface)] text-[var(--foreground)]"
        )}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}



function MonthlyForecastChart() {
  const resources = useInventoryStore((state) => state.resources);
  const monthlyProjection = useMemo(() => buildMonthlyProjection(resources), [resources]);

  return (
    <div className="border border-[var(--border-ink)] bg-[var(--surface)] rounded-[var(--radius-medium)] p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display text-lg font-bold ink">Monthly Forecast</h3>
          <p className="font-data text-xs text-secondary">6-month resource projection for Black Daruma, Jade, & G6</p>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-xs font-data font-bold text-[var(--text-secondary)]">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-[var(--foreground)] border border-[var(--border-ink)] inline-block"></span> BD</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-[var(--text-secondary)] border border-[var(--border-ink)] inline-block"></span> Jade</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-[var(--text-secondary)] border border-[var(--border-ink)] inline-block"></span> G6</span>
        </div>
      </div>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={monthlyProjection} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-ink)" strokeOpacity={0.15} />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: 'var(--color-ink)', fontWeight: 600 }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: 'var(--color-ink)', fontWeight: 600 }} />
            <Tooltip
              contentStyle={{
                background: 'var(--surface)',
                border: '1px solid var(--border-ink)',
                borderRadius: 'var(--radius-small)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                padding: '8px 12px',
              }}
              labelStyle={{
                color: 'var(--foreground)',
                fontWeight: 700,
                marginBottom: '4px',
              }}
            />
            <Area type="monotone" dataKey="blackDaruma" name="Black Daruma" stroke="var(--foreground)" strokeWidth={2} fill="var(--foreground)" fillOpacity={0.15} />
            <Area type="monotone" dataKey="jade" name="Jade" stroke="var(--text-secondary)" strokeWidth={2} fill="var(--text-secondary)" fillOpacity={0.1} />
            <Area type="monotone" dataKey="g6" name="G6 Units" stroke="var(--text-secondary)" strokeWidth={2} fill="var(--text-secondary)" fillOpacity={0.1} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function ResourceAllocationCard() {
  const resources = useInventoryStore((state) => state.resources);
  const allocation = useMemo(
    () =>
      buildResourceAllocation(resources)
        .filter((item) => item.value > 0)
        .slice(0, 6),
    [resources],
  );

  return (
    <div className="border border-[var(--border-ink)] bg-[var(--surface)] rounded-[var(--radius-medium)] p-4 shadow-sm">
      <div className="mb-4">
        <h3 className="font-display text-lg font-bold ink">Resource Distribution</h3>
        <p className="font-data text-xs text-secondary">Breakdown of current hoard</p>
      </div>
      <div className="h-72 w-full flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={allocation}
              innerRadius={54}
              outerRadius={88}
              dataKey="value"
              nameKey="name"
              paddingAngle={2}
            >
              {allocation.map((entry, index) => (
                <Cell key={entry.name} fill={pieColors[index % pieColors.length]} stroke="var(--color-ink)" strokeWidth={1.5} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: 'var(--surface)',
                border: '1px solid var(--border-ink)',
                borderRadius: 'var(--radius-small)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                padding: '8px 12px',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function UpcomingProjectsCard() {
  const resources = useInventoryStore((state) => state.resources);
  const projectsMap = useProjectStore((state) => state.projects);
  const projects = useMemo(() => Object.values(projectsMap), [projectsMap]);
  const ranked = useMemo(() => rankProjects(projects, resources), [projects, resources]);

  return (
    <div className="border border-[var(--border-ink)] bg-[var(--surface)] rounded-[var(--radius-medium)] p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-display text-lg font-bold ink">Upcoming Build Priorities</h3>
          <p className="font-data text-xs text-secondary">Ranked by ROI and current resource allocation</p>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {ranked.slice(0, 4).map((forecast, index) => {
          const { project, opportunityCost, resourceProgress } = forecast;
          const { calculateBlackDarumaCost } = require("@/domain/skill-progression");
          const bdRequired = calculateBlackDarumaCost(
            project.unitProgression.skillProgress.currentSkills,
            project.unitProgression.skillProgress.targetSkills
          );
          
          return (
            <div key={project.id} className="border border-[var(--border-ink)] bg-[var(--surface)] p-3 shadow-sm rounded-[var(--radius-medium)]">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-display text-sm font-bold ink">
                    {index + 1}. {project.name}
                  </span>
                  <p className="font-data text-xs text-secondary mt-0.5">
                    Grade: {project.unitProgression.gradeProgress.currentGrade} → {project.unitProgression.gradeProgress.targetGrade} · BD Required: {bdRequired}
                  </p>
                </div>
                <Badge variant={project.priority === "High" ? "accent" : "default"}>
                  {project.priority}
                </Badge>
              </div>
              <div className="mt-3 space-y-1.5">
                <div className="font-data flex justify-between text-xs text-secondary">
                  <span>Build Progress</span>
                  <span className="font-bold ink">{resourceProgress}%</span>
                </div>
                <Progress value={resourceProgress} />
              </div>
              <p className="font-data mt-2 text-[11px] text-secondary border-t border-zinc-200 pt-1.5">
                {opportunityCost}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SummonGoalsCard() {
  const { activeGoal } = require("@/store/goal-store").useGoalStore();
  const resources = useInventoryStore((state) => state.resources);
  const plannedThroughputs = require("@/store/activity-store").useActivityStore((state: any) => state.plannedThroughputs);
  const { calculateMonthlyYield } = require("@/domain/production-pipeline");

  if (!activeGoal) {
    return (
      <div className="border border-[var(--border-ink)] bg-[var(--surface)] rounded-[var(--radius-medium)] p-4 shadow-sm flex flex-col items-center justify-center h-full text-center">
        <Target className="text-[var(--text-secondary)] mb-2" size={24} />
        <h3 className="font-display text-sm font-bold ink">No Active Summon Goal</h3>
        <p className="font-data text-xs text-secondary mb-3 mt-1">Set a banner target to track savings trajectory.</p>
        <Button variant="outline" size="sm" asChild>
          <a href="/goals">Set Goal</a>
        </Button>
      </div>
    );
  }

  const today = new Date();
  const target = new Date(activeGoal.targetDate);
  const daysUntil = Math.max(0, Math.floor((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
  const monthsUntil = daysUntil / 30;

  let monthlyJadeIncome = resources.jade?.observedYield ?? 0;
  let monthlyAmuletIncome = resources.mysteryAmulet?.observedYield ?? 0;
  
  Object.values(plannedThroughputs).forEach((throughput: any) => {
    const monthly = calculateMonthlyYield(
      throughput.activityType,
      throughput.averageRunsPerDay,
      throughput.rollingYieldRates
    );
    monthlyJadeIncome += monthly.jadePerRun ?? 0;
    monthlyAmuletIncome += monthly.mysteryAmuletPerRun ?? 0;
  });

  const currentJade = resources.jade ? resources.jade.currentAmount + (resources.jade.manualAdjustment ?? 0) : 0;
  const currentAmulets = resources.mysteryAmulet ? resources.mysteryAmulet.currentAmount + (resources.mysteryAmulet.manualAdjustment ?? 0) : 0;
  
  const projectedJade = currentJade + (monthlyJadeIncome * monthsUntil);
  const projectedAmulets = currentAmulets + (monthlyAmuletIncome * monthsUntil);
  const projectedPulls = Math.floor(projectedJade / 100) + Math.floor(projectedAmulets);
  
  const deficit = activeGoal.requiredPulls - projectedPulls;
  const isReachable = deficit <= 0;

  return (
    <div className="border border-[var(--border-ink)] bg-[var(--surface)] rounded-[var(--radius-medium)] p-4 shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display text-lg font-bold ink">Summon Goal</h3>
          <p className="font-data text-xs text-secondary">{activeGoal.name}</p>
        </div>
        <Badge variant={isReachable ? "accent" : "default"}>
          {isReachable ? "On Track" : "Shortfall"}
        </Badge>
      </div>
      
      <div className="flex-1 flex flex-col justify-center">
        <div className="flex items-end justify-between mb-2">
          <div>
            <p className="font-data text-3xl font-black text-[var(--foreground)]">{projectedPulls}</p>
            <p className="font-data text-xs text-[var(--text-secondary)]">Projected Pulls</p>
          </div>
          <div className="text-right">
            <p className="font-data text-xl font-bold text-[var(--text-secondary)]">/ {activeGoal.requiredPulls}</p>
            <p className="font-data text-[10px] text-[var(--text-secondary)]">Target</p>
          </div>
        </div>
        <Progress value={Math.min((projectedPulls / activeGoal.requiredPulls) * 100, 100)} className="h-2 mb-4" />
        
        <div className="grid grid-cols-2 gap-2 text-xs font-data">
          <div className="bg-[var(--surface)] p-2 rounded border border-[var(--border-ink)]">
            <span className="block text-[var(--text-secondary)] mb-0.5">Time Left</span>
            <span className="font-bold">{daysUntil} Days</span>
          </div>
          <div className="bg-[var(--surface)] p-2 rounded border border-[var(--border-ink)]">
            <span className="block text-[var(--text-secondary)] mb-0.5">Deficit</span>
            <span className="font-bold">{isReachable ? "0" : deficit} Pulls</span>
          </div>
        </div>
      </div>
    </div>
  );
}

import Link from 'next/link';

export function DashboardOverviewPage() {
  const resources = useInventoryStore((state) => state.resources);
  const projectsMap = useProjectStore((state) => state.projects);
  const projects = useMemo(() => Object.values(projectsMap), [projectsMap]);
  const summary = useMemo(() => summarizeAccount(resources, projects), [projects, resources]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Dashboard"
          description="Account readiness, monthly forecast, and upcoming build priorities."
        />
        <Link href="/changelog" className="group flex flex-col sm:items-end p-3 border border-accent-gold/30 bg-accent-gold/5 hover:bg-accent-gold/10 transition-colors">
          <div className="flex items-center gap-2 text-accent-gold font-mono text-sm font-bold">
            <span className="w-2 h-2 rounded-full bg-accent-gold animate-pulse"></span>
            v1.2.0 is live!
          </div>
          <p className="text-xs text-text-secondary font-mono group-hover:text-foreground transition-colors mt-1">
            Community Builds are now available →
          </p>
        </Link>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          label="Current Black Daruma"
          value={formatNumber(summary.currentBlackDaruma)}
          detail={`${summary.blackDarumaIncome} BD/month`}
          Icon={Target}
          accent="accent"
        />
        <MetricCard
          label="Current Jade"
          value={formatNumber(summary.currentJade)}
          detail={`${formatNumber(summary.jadeIncome)} jade/month`}
          Icon={TrendingUp}
          accent=""
        />
        <MetricCard
          label="Current G6 Count"
          value={formatNumber(summary.currentG6Count)}
          detail={`${summary.metaUnitsCompleted} meta units near ready`}
          Icon={Gauge}
          accent=""
        />
        <MetricCard
          label="Projects Completed"
          value={`${summary.projectsCompleted}/${projects.length}`}
          detail={`${summary.zenithReadyPercent}% Zenith ready`}
          Icon={Activity}
          accent=""
        />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
        <MonthlyForecastChart />
        <div className="grid grid-rows-2 gap-6 h-[290px]">
          <SummonGoalsCard />
          <ResourceAllocationCard />
        </div>
      </section>

      <section>
        <UpcomingProjectsCard />
      </section>
    </div>
  );
}