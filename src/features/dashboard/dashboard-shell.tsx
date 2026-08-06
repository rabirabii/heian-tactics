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
import { usePlannerStore } from "@/store/planner-store";
import type { Priority, ProjectStatus } from "@/types/planner";

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

const pieColors = ["#7c3aed", "#16a34a", "#0891b2", "#db2777", "#ca8a04", "#475569"];
const statusColumns: ProjectStatus[] = ["Planning", "Building", "Ready", "Completed"];

const priorityVariant: Record<Priority, "emerald" | "amber" | "rose"> = {
  Low: "emerald",
  Medium: "amber",
  High: "rose",
};

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
        <h1 className="font-display text-2xl font-black text-zinc-950">{title}</h1>
        <p className="mt-1 max-w-2xl text-sm text-zinc-600">{description}</p>
      </div>
      {action}
    </header>
  );
}

function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  accent: string;
}) {
  return (
    <Card className="min-h-24">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-data text-xs font-semibold text-zinc-500">{label}</p>
          <p className="font-data mt-2 text-3xl font-bold text-zinc-950">{value}</p>
          <p className="mt-1 text-xs text-zinc-500">{detail}</p>
        </div>
        <div className={cn("rounded-md p-2 text-zinc-950", accent)}>
          <Icon size={18} />
        </div>
      </div>
    </Card>
  );
}

function ResourceAdjustmentForm() {
  const adjustResource = usePlannerStore((state) => state.adjustResource);
  const form = useForm<ResourceAdjustmentInput, unknown, ResourceAdjustmentValues>({
    resolver: zodResolver(resourceAdjustmentSchema),
    defaultValues: {
      type: "blackDaruma",
      change: 1,
      note: "Manual adjustment",
    },
  });

  return (
    <form
      className="grid gap-3 lg:grid-cols-[1.3fr_1fr_1.7fr_auto]"
      onSubmit={form.handleSubmit((values) => {
        adjustResource(values.type, values.change, values.note);
        form.reset({ ...values, change: 0 });
      })}
    >
      <div>
        <Label htmlFor="resource-type">Resource</Label>
        <Select id="resource-type" {...form.register("type")}>
          {resourceOrder.map((type) => (
            <option key={type} value={type}>
              {resourceLabels[type]}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor="resource-change">Adjustment</Label>
        <Input id="resource-change" type="number" step="1" {...form.register("change")} />
        <FieldError>{form.formState.errors.change?.message}</FieldError>
      </div>
      <div>
        <Label htmlFor="resource-note">Note</Label>
        <Input id="resource-note" {...form.register("note")} />
        <FieldError>{form.formState.errors.note?.message}</FieldError>
      </div>
      <Button className="self-end" type="submit">
        <Plus />
        Apply
      </Button>
    </form>
  );
}

function NewProjectForm() {
  const addProject = usePlannerStore((state) => state.addProject);
  const form = useForm<ProjectFormInput, unknown, ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
      description: "",
      priority: "High",
      blackDaruma: 0,
      jade: 0,
      souls: 0,
      minSpd: 0,
      soulSet: "Shadow",
      expectedCompletion: "2026-10-01",
      roiScore: 75,
      notes: "",
    },
  });

  return (
    <form
      className="grid gap-3 lg:grid-cols-4"
      onSubmit={form.handleSubmit((values) => {
        addProject({
          name: values.name,
          description: values.description,
          priority: values.priority,
          expectedCompletion: values.expectedCompletion,
          roiScore: values.roiScore,
          notes: values.notes ?? "",
          requirements: {
            resources: {
              blackDaruma: values.blackDaruma,
              jade: values.jade,
              souls: values.souls,
            },
            soulSet: values.soulSet,
            minSpd: values.minSpd,
          },
        });
        form.reset();
      })}
    >
      <div className="lg:col-span-2">
        <Label htmlFor="project-name">Project</Label>
        <Input id="project-name" placeholder="Finish SP Susanoo" {...form.register("name")} />
        <FieldError>{form.formState.errors.name?.message}</FieldError>
      </div>
      <div>
        <Label htmlFor="project-priority">Priority</Label>
        <Select id="project-priority" {...form.register("priority")}>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </Select>
      </div>
      <div>
        <Label htmlFor="project-date">Expected</Label>
        <Input id="project-date" type="date" {...form.register("expectedCompletion")} />
      </div>
      <div className="lg:col-span-2">
        <Label htmlFor="project-description">Description</Label>
        <Input
          id="project-description"
          placeholder="Primary burst slot for Zenith drafts"
          {...form.register("description")}
        />
        <FieldError>{form.formState.errors.description?.message}</FieldError>
      </div>
      <div>
        <Label htmlFor="project-bd">BD Required</Label>
        <Input id="project-bd" type="number" {...form.register("blackDaruma")} />
      </div>
      <div>
        <Label htmlFor="project-jade">Jade Required</Label>
        <Input id="project-jade" type="number" {...form.register("jade")} />
      </div>
      <div>
        <Label htmlFor="project-souls">Soul Pieces</Label>
        <Input id="project-souls" type="number" {...form.register("souls")} />
      </div>
      <div>
        <Label htmlFor="project-spd">SPD Target</Label>
        <Input id="project-spd" type="number" {...form.register("minSpd")} />
      </div>
      <div>
        <Label htmlFor="project-soul-set">Soul Set</Label>
        <Input id="project-soul-set" {...form.register("soulSet")} />
        <FieldError>{form.formState.errors.soulSet?.message}</FieldError>
      </div>
      <div>
        <Label htmlFor="project-roi">ROI Score</Label>
        <Input id="project-roi" type="number" min="1" max="100" {...form.register("roiScore")} />
      </div>
      <div className="lg:col-span-2">
        <Label htmlFor="project-notes">Notes</Label>
        <Input id="project-notes" {...form.register("notes")} />
      </div>
      <Button className="lg:col-span-4" type="submit">
        <Plus />
        Add Project
      </Button>
    </form>
  );
}

function SettingsForm() {
  const settings = usePlannerStore((state) => state.settings);
  const updateSettings = usePlannerStore((state) => state.updateSettings);
  const form = useForm<SettingsFormInput, unknown, SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    values: settings,
  });

  return (
    <form
      className="grid gap-3 lg:grid-cols-2"
      onSubmit={form.handleSubmit((values) => updateSettings(values))}
    >
      <div>
        <Label htmlFor="server">Game Server</Label>
        <Input id="server" {...form.register("gameServer")} />
      </div>
      <div>
        <Label htmlFor="season">Target Zenith Season</Label>
        <Input id="season" {...form.register("targetZenithSeason")} />
      </div>
      <div>
        <Label htmlFor="avg-bd">Average BD/month</Label>
        <Input id="avg-bd" type="number" {...form.register("averageBlackDarumaPerMonth")} />
      </div>
      <div>
        <Label htmlFor="avg-jade">Average Jade/month</Label>
        <Input id="avg-jade" type="number" {...form.register("averageJadePerMonth")} />
      </div>
      <div className="lg:col-span-2">
        <Label htmlFor="assumptions">Forecast Assumptions</Label>
        <Textarea id="assumptions" {...form.register("forecastAssumptions")} />
      </div>
      <Button className="lg:col-span-2" type="submit">
        <Settings />
        Save Settings
      </Button>
    </form>
  );
}

function ResourceTable() {
  const resources = usePlannerStore((state) => state.resources);
  const updateResource = usePlannerStore((state) => state.updateResource);

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="font-data text-xs font-semibold text-zinc-500">
          <tr className="border-b border-zinc-200">
            <th className="py-3 pr-4">Resource</th>
            <th className="py-3 pr-4">Current</th>
            <th className="py-3 pr-4">Income/month</th>
            <th className="py-3 pr-4">Manual</th>
            <th className="py-3">Notes</th>
          </tr>
        </thead>
        <tbody>
          {resourceOrder.map((type) => {
            const resource = resources[type];

            return (
              <tr key={type} className="border-b border-zinc-100">
                <td className="py-3 pr-4 font-medium text-zinc-950">{resource.label}</td>
                <td className="py-3 pr-4">
                  <Input
                    aria-label={`${resource.label} current amount`}
                    type="number"
                    value={resource.currentAmount}
                    onChange={(event) =>
                      updateResource(type, { currentAmount: Number(event.target.value) })
                    }
                  />
                </td>
                <td className="py-3 pr-4">
                  <Input
                    aria-label={`${resource.label} monthly income`}
                    type="number"
                    value={resource.monthlyIncome}
                    onChange={(event) =>
                      updateResource(type, { monthlyIncome: Number(event.target.value) })
                    }
                  />
                </td>
                <td className="py-3 pr-4">
                  <Input
                    aria-label={`${resource.label} manual adjustment`}
                    type="number"
                    value={resource.manualAdjustment}
                    onChange={(event) =>
                      updateResource(type, { manualAdjustment: Number(event.target.value) })
                    }
                  />
                </td>
                <td className="py-3">
                  <Input
                    aria-label={`${resource.label} notes`}
                    value={resource.notes}
                    onChange={(event) => updateResource(type, { notes: event.target.value })}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ProjectBoard() {
  const projects = usePlannerStore((state) => state.projects);
  const updateProjectStatus = usePlannerStore((state) => state.updateProjectStatus);

  return (
    <div className="grid gap-3 xl:grid-cols-4">
      {statusColumns.map((status) => (
        <div key={status} className="rounded-lg border border-zinc-200 bg-white p-3">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-display text-sm font-black text-zinc-950">{status}</h3>
            <Badge>{projects.filter((project) => project.status === status).length}</Badge>
          </div>
          <div className="space-y-3">
            {projects
              .filter((project) => project.status === status)
              .map((project) => (
                <div key={project.id} className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-display text-sm font-bold text-zinc-950">{project.name}</p>
                      <p className="mt-1 text-xs leading-5 text-zinc-500">{project.description}</p>
                    </div>
                    <Badge variant={priorityVariant[project.priority]}>{project.priority}</Badge>
                  </div>
                  <div className="mt-3 space-y-2">
                    <div className="font-data flex justify-between text-xs text-zinc-500">
                      <span>Progress</span>
                      <span>{project.currentProgress}%</span>
                    </div>
                    <Progress value={project.currentProgress} />
                  </div>
                  <div className="font-data mt-3 grid grid-cols-2 gap-2 text-xs text-zinc-500">
                    <span>BD {project.requirements.resources.blackDaruma ?? 0}</span>
                    <span>SPD {project.requirements.minSpd ?? "-"}</span>
                    <span>{project.requirements.soulSet ?? "No soul set"}</span>
                    <span>ROI {project.roiScore}</span>
                  </div>
                  <Select
                    className="mt-3"
                    aria-label={`${project.name} status`}
                    value={project.status}
                    onChange={(event) =>
                      updateProjectStatus(project.id, event.target.value as ProjectStatus)
                    }
                  >
                    {statusColumns.map((columnStatus) => (
                      <option key={columnStatus} value={columnStatus}>
                        {columnStatus}
                      </option>
                    ))}
                  </Select>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function MonthlyForecastCard() {
  const resources = usePlannerStore((state) => state.resources);
  const monthlyProjection = useMemo(() => buildMonthlyProjection(resources), [resources]);

  return (
    <Card className="min-h-0">
      <CardHeader>
        <div>
          <CardTitle>Monthly Forecast</CardTitle>
          <CardDescription>Black Daruma, jade, and G6-equivalent projection.</CardDescription>
        </div>
      </CardHeader>
      <div className="h-[330px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={monthlyProjection}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(113,113,122,0.22)" />
            <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
            <YAxis tickLine={false} axisLine={false} fontSize={12} />
            <Tooltip
              contentStyle={{
                background: "#ffffff",
                border: "1px solid #e4e4e7",
                borderRadius: 8,
                color: "#18181b",
              }}
            />
            <Area type="monotone" dataKey="blackDaruma" stroke="#7c3aed" fill="#7c3aed26" />
            <Area type="monotone" dataKey="jade" stroke="#ca8a04" fill="#ca8a0426" />
            <Area type="monotone" dataKey="g6" stroke="#0891b2" fill="#0891b226" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

function ResourceAllocationCard() {
  const resources = usePlannerStore((state) => state.resources);
  const allocation = useMemo(
    () =>
      buildResourceAllocation(resources)
        .filter((item) => item.value > 0)
        .slice(0, 6),
    [resources],
  );

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Resource Allocation</CardTitle>
          <CardDescription>Top available resource pools for planning.</CardDescription>
        </div>
      </CardHeader>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={allocation} innerRadius={54} outerRadius={88} dataKey="value" nameKey="name">
              {allocation.map((entry, index) => (
                <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "#ffffff",
                border: "1px solid #e4e4e7",
                borderRadius: 8,
                color: "#18181b",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="font-data grid grid-cols-2 gap-2 text-xs">
        {allocation.map((item, index) => (
          <div key={item.name} className="flex items-center gap-2 text-zinc-500">
            <span
              className="size-2 rounded-full"
              style={{ backgroundColor: pieColors[index % pieColors.length] }}
            />
            {item.name}: {formatNumber(item.value)}
          </div>
        ))}
      </div>
    </Card>
  );
}

export function DashboardOverviewPage() {
  const resources = usePlannerStore((state) => state.resources);
  const projects = usePlannerStore((state) => state.projects);
  const summary = useMemo(() => summarizeAccount(resources, projects), [projects, resources]);
  const rankedProjects = useMemo(() => rankProjects(projects, resources), [projects, resources]);

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Account readiness, monthly forecast, and the next few build decisions."
      />
      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Current Black Daruma"
          value={formatNumber(summary.currentBlackDaruma)}
          detail={`${summary.blackDarumaIncome} BD/month`}
          icon={Target}
          accent="bg-violet-300"
        />
        <MetricCard
          label="Current Jade"
          value={formatNumber(summary.currentJade)}
          detail={`${formatNumber(summary.jadeIncome)} jade/month`}
          icon={TrendingUp}
          accent="bg-lime-300"
        />
        <MetricCard
          label="Current G6 Count"
          value={formatNumber(summary.currentG6Count)}
          detail={`${summary.metaUnitsCompleted} meta units near ready`}
          icon={Gauge}
          accent="bg-cyan-300"
        />
        <MetricCard
          label="Projects Completed"
          value={`${summary.projectsCompleted}/${projects.length}`}
          detail={`${summary.zenithReadyPercent}% Zenith ready`}
          icon={Activity}
          accent="bg-pink-300"
        />
      </section>

      <section className="mt-4 grid min-h-0 gap-4 xl:grid-cols-[1.35fr_0.65fr]">
        <MonthlyForecastCard />
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Upcoming Projects</CardTitle>
              <CardDescription>Top allocation candidates only.</CardDescription>
            </div>
            <BarChart3 size={18} className="text-zinc-400" />
          </CardHeader>
          <div className="space-y-3">
            {rankedProjects.slice(0, 4).map((forecast, index) => (
              <div key={forecast.project.id} className="rounded-lg border border-zinc-200 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-sm font-bold text-zinc-950">
                      {index + 1}. {forecast.project.name}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      ETA {forecast.completionDate} · {forecast.opportunityCost}
                    </p>
                  </div>
                  <Badge variant={priorityVariant[forecast.project.priority]}>
                    {forecast.allocationScore}
                  </Badge>
                </div>
                <Progress className="mt-3" value={forecast.resourceProgress} />
              </div>
            ))}
          </div>
        </Card>
      </section>
    </>
  );
}

export function ResourcesPage() {
  return (
    <>
      <PageHeader
        title="Resources"
        description="Update current amounts, monthly income, adjustments, notes, and allocation mix."
      />
      <section className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
        <ResourceAllocationCard />
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Resource Ledger</CardTitle>
              <CardDescription>Manual adjustments are logged in local browser state.</CardDescription>
            </div>
          </CardHeader>
          <ResourceAdjustmentForm />
          <div className="mt-4">
            <ResourceTable />
          </div>
        </Card>
      </section>
    </>
  );
}

export function ProjectsPage() {
  return (
    <>
      <PageHeader
        title="Projects"
        description="Manage long-term build projects, status, requirements, priority, and ROI."
      />
      <section className="grid gap-5 xl:grid-cols-[1fr_0.9fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Build Projects</CardTitle>
              <CardDescription>Kanban view for roster investments.</CardDescription>
            </div>
          </CardHeader>
          <ProjectBoard />
        </Card>
        <Card>
          <CardHeader>
            <div>
              <CardTitle>New Project</CardTitle>
              <CardDescription>Create a build goal with resource requirements and ROI.</CardDescription>
            </div>
          </CardHeader>
          <NewProjectForm />
        </Card>
      </section>
    </>
  );
}

export function RosterPage() {
  const shikigami = usePlannerStore((state) => state.shikigami);

  return (
    <>
      <PageHeader
        title="Roster"
        description="Track PvP status, Black Daruma demand, skill state, and multiple soul presets."
      />
      <section className="grid gap-4 lg:grid-cols-2">
        {shikigami.map((unit) => (
          <Card key={unit.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-lg font-black text-zinc-950">{unit.name}</h2>
                <p className="font-data mt-1 text-xs text-zinc-500">
                  G{unit.grade} · Skills {unit.skillLevel} · {unit.pvpStatus}
                </p>
              </div>
              <Badge variant={priorityVariant[unit.priority]}>{unit.metaTier}</Badge>
            </div>
            <div className="mt-4 grid gap-2">
              {unit.soulPresets.map((preset) => (
                <div key={preset.id} className="rounded-md bg-zinc-100 p-3 text-xs">
                  <div className="flex justify-between gap-2">
                    <span className="font-display font-bold text-zinc-950">{preset.name}</span>
                    <span className="font-data text-zinc-500">{preset.soulSet}</span>
                  </div>
                  <div className="font-data mt-2 text-zinc-500">
                    {Object.entries(preset.stats)
                      .map(([stat, value]) => `${stat} ${value}`)
                      .join(" · ")}
                  </div>
                  <p className="mt-2 text-zinc-500">{preset.notes}</p>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </section>
    </>
  );
}

export function PlannerPage() {
  const monthlyGoals = usePlannerStore((state) => state.monthlyGoals);
  const farmingWeek = usePlannerStore((state) => state.farmingWeek);
  const updateMonthlyGoal = usePlannerStore((state) => state.updateMonthlyGoal);
  const weeklyTotals = useMemo(
    () =>
      farmingWeek.reduce(
        (totals, day) => ({
          exploration: totals.exploration + day.exploration,
          soul: totals.soul + day.soul,
          realmRaid: totals.realmRaid + day.realmRaid,
          boss: totals.boss + day.boss,
          guild: totals.guild + day.guild,
          events: totals.events + day.events,
        }),
        { exploration: 0, soul: 0, realmRaid: 0, boss: 0, guild: 0, events: 0 },
      ),
    [farmingWeek],
  );

  return (
    <>
      <PageHeader
        title="Planner"
        description="Monthly goals and weekly farming pace for repeatable account loops."
      />
      <section className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Monthly Planner</CardTitle>
              <CardDescription>Calendar-style monthly account goals.</CardDescription>
            </div>
            <CalendarDays size={18} className="text-zinc-400" />
          </CardHeader>
          <div className="space-y-4">
            {monthlyGoals.map((goal) => {
              const progress = Math.round((goal.current / goal.target) * 100);

              return (
                <div key={goal.id}>
                  <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium text-zinc-900">{goal.label}</span>
                    <span className="font-data text-xs text-zinc-500">
                      {goal.current}/{goal.target} {goal.unit}
                    </span>
                  </div>
                  <div className="grid grid-cols-[1fr_84px] gap-3">
                    <Progress value={progress} />
                    <Input
                      aria-label={`${goal.label} current progress`}
                      type="number"
                      value={goal.current}
                      onChange={(event) => updateMonthlyGoal(goal.id, Number(event.target.value))}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Farming Tracker</CardTitle>
              <CardDescription>Weekly pace across repeatable farming loops.</CardDescription>
            </div>
            <Moon size={18} className="text-zinc-400" />
          </CardHeader>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={farmingWeek}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(113,113,122,0.22)" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "#ffffff",
                    border: "1px solid #e4e4e7",
                    borderRadius: 8,
                    color: "#18181b",
                  }}
                />
                <Bar dataKey="exploration" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                <Bar dataKey="realmRaid" fill="#0891b2" radius={[4, 4, 0, 0]} />
                <Bar dataKey="soul" fill="#ca8a04" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="font-data mt-4 grid grid-cols-2 gap-2 text-xs text-zinc-500 sm:grid-cols-3">
            <span>Exploration {weeklyTotals.exploration}</span>
            <span>Realm Raid {weeklyTotals.realmRaid}</span>
            <span>Soul {weeklyTotals.soul}</span>
            <span>Boss {weeklyTotals.boss}</span>
            <span>Guild {weeklyTotals.guild}</span>
            <span>Events {weeklyTotals.events}</span>
          </div>
        </Card>
      </section>
    </>
  );
}

export function SettingsPage() {
  const resources = usePlannerStore((state) => state.resources);
  const projects = usePlannerStore((state) => state.projects);
  const settings = usePlannerStore((state) => state.settings);
  const summary = useMemo(() => summarizeAccount(resources, projects), [projects, resources]);

  return (
    <>
      <PageHeader
        title="Settings"
        description="Planning assumptions, server profile, account statistics, and current averages."
      />
      <section className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Statistics</CardTitle>
              <CardDescription>Monthly planning averages and completion rate.</CardDescription>
            </div>
          </CardHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ["BD gained", `${settings.averageBlackDarumaPerMonth}/mo`],
              ["BD spent", "12 planned"],
              ["Jade spent", "3.2k planned"],
              ["Summons", "60 saved"],
              ["SSR/SP obtained", "2 target slots"],
              ["G6/month", `${Math.max(1, Math.round(resources.exp.monthlyIncome / 50))}`],
              ["Completion Rate", `${summary.averageCompletionRate}%`],
              ["Average Jade/month", formatNumber(settings.averageJadePerMonth)],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border border-zinc-200 p-3">
                <p className="text-xs text-zinc-500">{label}</p>
                <p className="font-data mt-1 text-lg font-bold text-zinc-950">{value}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Settings</CardTitle>
              <CardDescription>Server, target season, averages, and forecast assumptions.</CardDescription>
            </div>
          </CardHeader>
          <SettingsForm />
        </Card>
      </section>
    </>
  );
}
