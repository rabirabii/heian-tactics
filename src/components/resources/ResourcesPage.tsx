import { PageHeader } from '@/features/dashboard/dashboard-shell';
import { ResourceTable } from './ResourceTable';
import { ResourceHistoryLog } from './ResourceHistoryLog';

export function ResourcesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Resources"
        description="Update current amounts, observed throughput, and track changes across your resource pools."
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 border border-[var(--border-ink)] bg-[var(--surface)] rounded-[var(--radius-medium)] p-5 shadow-sm overflow-x-auto min-w-0">
          <h3 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-4">
            Resource Inventory
          </h3>
          <ResourceTable />
        </div>
        
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
            Transaction History
          </h3>
          <div className="max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
            <ResourceHistoryLog />
          </div>
        </div>
      </div>
    </div>
  );
}