import { PageHeader } from '@/features/dashboard/dashboard-shell';
import { usePlannerStore } from '@/store/planner-store';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { CalendarDays } from 'lucide-react';
import { Moon } from 'lucide-react';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar } from 'recharts';
import { useMemo } from 'react';

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
        <Card className="border-2-black panel-bg shadow-hard rounded-none p-4">
          <div className="flex items-start justify-between">
            <CalendarDays className="text-secondary" />
            <div>
              <h3 className="font-display text-lg font-bold ink">Monthly Planner</h3>
              <p className="font-data text-sm text-secondary">Calendar-style monthly account goals.</p>
            </div>
          </div>
          <div className="space-y-4">
            {monthlyGoals.map((goal) => {
              const progress = Math.round((goal.current / goal.target) * 100);
              return (
                <div key={goal.id}>
                  <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium text-zinc-900">{goal.label}</span>
                    <span className="font-data text-xs text-secondary">
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
                      className="input-base"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="border-2-black panel-bg shadow-hard rounded-none p-4">
          <div className="flex items-start justify-between">
            <Moon className="text-secondary" />
            <div>
              <h3 className="font-display text-lg font-bold ink">Farming Tracker</h3>
              <p className="font-data text-sm text-secondary">Weekly pace across repeatable farming loops.</p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={farmingWeek}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-ink)" strokeOpacity={0.15} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--color-bg)',
                    border: '2px solid var(--color-ink)',
                    borderRadius: 0,
                    boxShadow: '4px 4px 0 0 var(--color-ink)',
                  }}
                  labelStyle={{
                    color: 'var(--color-ink)',
                    fontWeight: 600,
                  }}
                  wrapperStyle={{}}
                />
                <Bar dataKey="exploration" fill="var(--color-accent)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="realmRaid" fill="var(--color-secondary)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="soul" fill="var(--color-secondary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="font-data mt-4 grid grid-cols-2 gap-2 text-xs text-secondary">
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