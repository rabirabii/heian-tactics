import { PageHeader } from '@/features/dashboard/dashboard-shell';
import { usePlannerStore } from '@/store/planner-store';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Priority } from '@/types/planner';

const priorityVariant: Record<Priority, string> = {
  Low: 'var(--color-secondary)',
  Medium: 'var(--color-secondary)',
  High: 'var(--color-accent)',
};

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
          <Card key={unit.id} className="border-2-black panel-bg shadow-hard rounded-none p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-lg font-black ink">
                  G{unit.grade} · {unit.name}
                </h2>
                <p className="font-data mt-1 text-xs text-secondary">
                  Skills {unit.skillLevel} · {unit.pvpStatus}
                </p>
              </div>
              <Badge
                className={`ml-2 ink ${unit.priority === 'High' ? 'accent' : ''}`}
              >
                {unit.metaTier}
              </Badge>
            </div>
            <div className="mt-4 grid gap-2">
              {unit.soulPresets.map((preset) => (
                <div key={preset.id} className="border-2-black panel-bg rounded-none p-3 text-xs">
                  <div className="flex justify-between gap-2">
                    <span className="font-display font-bold ink">{preset.name}</span>
                    <span className="font-data text-secondary">{preset.soulSet}</span>
                  </div>
                  <div className="font-data mt-2 text-secondary">
                    {Object.entries(preset.stats)
                      .map(([stat, value]) => `${stat} ${value}`)
                      .join(" · ")}
                  </div>
                  <p className="mt-2 text-secondary">{preset.notes}</p>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </section>
    </>
  );
}