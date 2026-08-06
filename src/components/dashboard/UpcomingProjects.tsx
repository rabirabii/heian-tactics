import { useMemo } from 'react';
import { rankProjects } from '@/lib/forecast';
import { usePlannerStore } from '@/store/planner-store';
import { formatNumber } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface ProjectCardProps {
  project: any; // Project type from planner-data
  allocationScore: number;
  opportunityCost: string;
  index: number;
}

function ProjectCard({ project, allocationScore, opportunityCost, index }: ProjectCardProps) {
  const { requirements, priority, roiScore, expectedCompletion } = project;
  const bdRequired = project.requirements.resources?.blackDaruma ?? 0;
  // Opportunity cost already computed, but we can recompute if needed; we'll use the passed one.
  // const opportunityCost =
  //   bdRequired > 0
  //     ? `${bdRequired} BD locks ${Math.max(0, 10 - bdRequired)} BD for parallel prep`
  //     : 'No BD cost; mostly farming time';

  // Priority indicator square (we'll render via a small div with background color based on priority)
  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'High':
        return 'var(--color-accent)';
      case 'Medium':
        return 'var(--color-secondary)';
      case 'Low':
        return 'var(--color-secondary)';
      default:
        return 'transparent';
    }
  };

  return (
    <div className="border-2-black panel-bg shadow-hard rounded-none p-4 hover-press">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-sm font-bold ink">
            {index + 1}. {project.name}
          </p>
          <p className="font-data text-xs text-secondary">
            ETA {new Date(project.expectedCompletion).toLocaleString('default', { month: 'short', year: 'numeric' })} · {opportunityCost}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2"
            style={{ backgroundColor: getPriorityColor(priority) }}
          />
          <span className="font-data text-xs ink">{allocationScore}</span>
        </div>
      </div>
      <Progress className="mt-3" value={project.resourceProgress} />
    </div>
  );
}

export function UpcomingProjects() {
  const resources = usePlannerStore((state) => state.resources);
  const projects = usePlannerStore((state) => state.projects);
  const ranked = useMemo(() => rankProjects(projects, resources), [projects, resources]);

  return (
    <div className="border-2-black panel-bg shadow-hard rounded-none p-4">
      <h3 className="font-display text-lg font-bold ink mb-4">
        Upcoming Projects
      </h3>
      <div className="space-y-3">
        {ranked.slice(0, 4).map((forecast) => {
          const { project, allocationScore, opportunityCost } = forecast;
          return (
            <ProjectCard
              key={project.id}
              project={project}
              allocationScore={allocationScore}
              opportunityCost={opportunityCost}
              index={ranked.indexOf(forecast)}
            />
          );
        })}
      </div>
    </div>
  );
}