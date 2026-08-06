import { usePlannerStore } from '@/store/planner-store';
import { statusColumns } from '@/lib/planner-data';
import { Priority } from '@/types/planner';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/form';
import { Progress } from '@/components/ui/progress';
import { cn } from "@/lib/utils";

const priorityVariant: Record<Priority, string> = {
  Low: 'var(--color-secondary)',
  Medium: 'var(--color-secondary)',
  High: 'var(--color-accent)',
};

export function ProjectBoard() {
  const projects = usePlannerStore((state) => state.projects);
  const updateProjectStatus = usePlannerStore((state) => state.updateProjectStatus);

  return (
    <div className="grid gap-3 xl:grid-cols-4">
      {statusColumns.map((status) => (
        <div key={status} className="rounded-lg border border-2-black bg-white p-3">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-display text-sm font-black ink">{status}</h3>
            <Badge className="ink">{projects.filter((project) => project.status === status).length}</Badge>
          </div>
          <div className="space-y-3">
            {projects
              .filter((project) => project.status === status)
              .map((project) => (
                <div key={project.id} className="border-2-black panel-bg shadow-hard rounded-none p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-display text-sm font-bold ink">{project.name}</p>
                      <p className="font-data text-xs text-secondary leading-5">{project.description}</p>
                    </div>
                    <Badge className="ml-2 ink">{project.priority}</Badge>
                  </div>
                  <div className="mt-3 space-y-2">
                    <div className="font-data flex justify-between text-xs text-secondary ink">
                      <span>Progress</span>
                      <span>{project.currentProgress}%</span>
                    </div>
                    <Progress
                      className="w-full"
                      value={project.currentProgress}
                    />
                  </div>
                  <div className="font-data mt-3 grid grid-cols-2 gap-2 text-xs text-secondary ink">
                    <span>BD {project.requirements.resources?.blackDaruma ?? 0}</span>
                    <span>SPD {project.requirements.minSpd ?? '-'}</span>
                  </div>
                  <div className="mt-2">
                    <Select
                      className="select-base w-full"
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
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}