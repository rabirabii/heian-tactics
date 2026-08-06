import { useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { buildResourceAllocation } from '@/lib/forecast';
import { usePlannerStore } from '@/store/planner-store';
import { pieColors } from '@/lib/planner-data';

export function ResourceAllocationCard() {
  const resources = usePlannerStore((state) => state.resources);
  const allocation = useMemo(() => buildResourceAllocation(resources), [resources]);

  return (
    <div className="panel-bg border-2-black shadow-hard rounded-none p-4">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={allocation}
            innerRadius={54}
            outerRadius={88}
            dataKey="value"
            nameKey="name"
          >
            {allocation.map((entry, index) => (
              <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: '#ffffff',
              border: '1px solid #e4e4e7',
              borderRadius: 8,
              color: '#18181b',
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}