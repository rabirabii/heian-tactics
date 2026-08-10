"use client";

import { useInventoryStore } from '@/store/inventory-store';
import { resourceOrder, resourceLabels } from '@/lib/planner-data';
import { InventoryResourceType } from '@/types/domain/inventory';
import { Input } from '@/components/ui/form';

export function ResourceTable() {
  const resources = useInventoryStore((state) => state.resources);
  const updateResource = useInventoryStore((state) => state.updateResource);

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm border-collapse">
        <thead>
          <tr className="border-b border-[var(--border-ink)] text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
            <th className="py-3 px-3">Resource</th>
            <th className="py-3 px-3 w-36">Current</th>
            <th className="py-3 px-3 w-36">Observed Throughput / Mo</th>
            <th className="py-3 px-3 w-36">Manual Adj</th>
            <th className="py-3 px-3">Notes</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border-ink)]">
          {resourceOrder.map((typeString) => {
            const type = typeString as InventoryResourceType;
            const stateResource = resources[type];
            const resource = stateResource || {
              label: resourceLabels[type] || type,
              currentAmount: 0,
              observedYield: 0,
              manualAdjustment: 0,
              notes: "",
            };

            return (
              <tr key={type} className="hover:bg-[var(--surface)]/50 transition-colors">
                <td className="py-2.5 px-3 font-medium text-[var(--foreground)]">{resource.label}</td>
                <td className="py-2.5 px-3">
                  <Input
                    aria-label={`${resource.label} current amount`}
                    type="number"
                    value={resource.currentAmount}
                    onChange={(event) =>
                      updateResource(type, { currentAmount: Number(event.target.value) })
                    }
                    className="h-8 text-xs font-mono"
                  />
                </td>
                <td className="py-2.5 px-3">
                  <Input
                    aria-label={`${resource.label} observed yield`}
                    type="number"
                    value={resource.observedYield ?? 0}
                    onChange={(event) =>
                      updateResource(type, { observedYield: Number(event.target.value) })
                    }
                    className="h-8 text-xs font-mono"
                  />
                </td>
                <td className="py-2.5 px-3">
                  <Input
                    aria-label={`${resource.label} manual adjustment`}
                    type="number"
                    value={resource.manualAdjustment}
                    onChange={(event) =>
                      updateResource(type, { manualAdjustment: Number(event.target.value) })
                    }
                    className="h-8 text-xs font-mono"
                  />
                </td>
                <td className="py-2.5 px-3">
                  <Input
                    aria-label={`${resource.label} notes`}
                    value={resource.notes}
                    onChange={(event) => updateResource(type, { notes: event.target.value })}
                    className="h-8 text-xs font-sans"
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