import { PageHeader } from '@/features/dashboard/dashboard-shell';
import { usePlannerStore } from '@/store/planner-store';
import { Card } from '@/components/ui/card';
import { Input, Label } from '@/components/ui/form';
import { Select } from '@/components/ui/form';
import { Textarea } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatNumber } from '@/lib/utils';
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';

const settingsSchema = z.object({
  gameServer: z.string().min(2),
  targetZenithSeason: z.string().min(2),
  averageBlackDarumaPerMonth: z.coerce.number().min(0),
  averageJadePerMonth: z.coerce.number().min(0),
  forecastAssumptions: z.string().min(3),
});

type SettingsFormInput = z.input<typeof settingsSchema>;
type SettingsFormValues = z.output<typeof settingsSchema>;

export function SettingsPage() {
  const resources = usePlannerStore((state) => state.resources);
  const projects = usePlannerStore((state) => state.projects);
  const settings = usePlannerStore((state) => state.settings);
  const summary = useMemo(() => {
    const projectsCompleted = projects.filter((project) => project.status === "Completed").length;
    const currentG6Count = Math.floor(resources.exp.currentAmount / 50);
    const metaUnitsCompleted = projects.filter(
      (project) => project.status === "Completed" || project.currentProgress >= 90,
    ).length;
    const zenithReadyPercent = Math.min(
      100,
      Math.round(
        (projects.reduce((total, project) => total + project.currentProgress, 0) / projects.length) * 0.45 +
          Math.min(resources.blackDaruma.currentAmount / 27, 1) * 25 +
          Math.min(resources.jade.currentAmount / 18000, 1) * 15 +
          Math.min(currentG6Count / 6, 1) * 15,
      ),
    );

    return {
      currentBlackDaruma: resources.blackDaruma.currentAmount,
      blackDarumaIncome: resources.blackDaruma.monthlyIncome,
      currentJade: resources.jade.currentAmount,
      jadeIncome: resources.jade.monthlyIncome,
      currentG6Count,
      metaUnitsCompleted,
      projectsCompleted,
      zenithReadyPercent,
      averageCompletionRate: projects.length
        ? Math.round(
            projects.reduce((total, project) => total + project.currentProgress, 0) / projects.length,
          )
        : 0,
    };
  }, [projects, resources]);

  return (
    <>
      <PageHeader
        title="Settings"
        description="Planning assumptions, server profile, account statistics, and current averages."
      />
      <section className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
        <Card className="border-2-black panel-bg shadow-hard rounded-none p-4">
          <div className="flex items-start justify-between">
            <span className="font-display text-lg font-bold ink">Statistics</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ["BD gained", `${settings.averageBlackDarumaPerMonth}/mo`],
              ["BD spent", "12 planned"],
              ["Jade spent", "3.2k planned"],
              ["Summons", "60 saved"],
              ["SSR/SP obtained", "2 target slots"],
              ["G6/month", `${Math.max(1, Math.round(resources.exp.monthlyIncome / 50))}`],
              ["Completion Rate", `${summary.averageCompletionRate}%`],
              ["Average Jade/month", `${formatNumber(settings.averageJadePerMonth)}`],
            ].map(([label, value]) => (
              <div key={label} className="border-2-black panel-bg rounded-none p-3">
                <p className="text-xs text-secondary">{label}</p>
                <p className="font-data mt-1 text-lg font-bold ink">{value}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="border-2-black panel-bg shadow-hard rounded-none p-4">
          <div className="flex items-start justify-between">
            <span className="font-display text-lg font-bold ink">Settings</span>
          </div>
          <div className="mt-4">
            <SettingsForm />
          </div>
        </Card>
      </section>
    </>
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
        Save Settings
      </Button>
    </form>
  );
}