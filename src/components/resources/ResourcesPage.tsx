import { PageHeader } from '@/features/dashboard/dashboard-shell'; // We'll keep the PageHeader in dashboard-shell for now, but we can also move it to a shared location. For now, we import from dashboard-shell.
import { ResourceAdjustmentForm } from './ResourceAdjustmentForm';
import { ResourceTable } from './ResourceTable';
import { ResourceAllocationCard } from './ResourceAllocationCard';
import { cn } from '@/lib/utils';

export function ResourcesPage() {
  return (
    <>
      <PageHeader
        title="Resources"
        description="Update current amounts, monthly income, adjustments, notes, and allocation mix."
      />
      <section className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
        <ResourceAllocationCard />
        <div className="border-2-black panel-bg shadow-hard rounded-none p-4">
          <ResourceAdjustmentForm />
          <div className="mt-4">
            <ResourceTable />
          </div>
        </div>
      </section>
    </>
  );
}