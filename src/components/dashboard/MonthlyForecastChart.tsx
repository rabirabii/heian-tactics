import { useMemo } from 'react';
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import { buildMonthlyProjection } from '@/lib/forecast';
import { usePlannerStore } from '@/store/planner-store';

export function MonthlyForecastChart() {
  const resources = usePlannerStore((state) => state.resources);
  const monthlyProjection = useMemo(() => buildMonthlyProjection(resources), [resources]);

  return (
    <div className="panel-bg border-2-black shadow-hard rounded-none p-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={monthlyProjection}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-ink)" strokeOpacity={0.15} />
          <XAxis dataKey="month" tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{
              background: 'var(--color-bg)',
              border: '2px solid var(--color-ink)',
              borderRadius: 0,
              boxShadow: '4px 4px 0 0 var(--color-ink)',
              padding: '4px 8px',
            }}
            labelStyle={{
              color: 'var(--color-ink)',
              fontWeight: 600,
            }}
            wrapperStyle={{}}
          />
          <Area type="monotone" dataKey="blackDaruma" stroke="var(--color-accent)" fill="rgba(214, 255, 31, 0.4)" />
          <Area type="monotone" dataKey="jade" stroke="var(--color-accent)" fill="rgba(214, 255, 31, 0.2)" />
          <Area type="monotone" dataKey="g6" stroke="var(--color-accent)" fill="rgba(214, 255, 31, 0.1)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}