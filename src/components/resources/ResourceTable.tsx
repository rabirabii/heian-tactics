import { usePlannerStore } from '@/store/planner-store';
import { resourceOrder, resourceLabels } from '@/lib/planner-data';
import { Input } from '@/components/ui/form';

export function ResourceTable() {
  const resources = usePlannerStore((state) => state.resources);
  const updateResource = usePlannerStore((state) => state.updateResource);

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="font-data text-xs font-semibold text-secondary">
          <tr className="border-b border-2-black">
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
              <tr key={type} className="border-b border-2-black">
                <td className="py-3 pr-4 font-medium ink">{resource.label}</td>
                <td className="py-3 pr-4">
                  <Input
                    aria-label={`${resource.label} current amount`}
                    type="number"
                    value={resource.currentAmount}
                    onChange={(event) =>
                      updateResource(type, { currentAmount: Number(event.target.value) })
                    }
                    className="input-base"
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
                    className="input-base"
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
                    className="input-base"
                  />
                </td>
                <td className="py-3">
                  <Input
                    aria-label={`${resource.label} notes`}
                    value={resource.notes}
                    onChange={(event) => updateResource(type, { notes: event.target.value })}
                    className="input-base"
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