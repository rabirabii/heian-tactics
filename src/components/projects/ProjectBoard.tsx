"use client";

import { useMemo } from 'react';
import { useProjectStore } from '@/store/project-store';
import { ProjectStatus } from '@/types/domain/project';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/form';
import { Progress } from '@/components/ui/progress';
import { calculateBlackDarumaCost } from '@/domain/skill-progression';
import { calculatePromotionCost } from '@/domain/grade-progression';

const statusColumns: ProjectStatus[] = ["Planning", "Building", "Ready", "Completed"];

export function ProjectBoard() {
  const projectsMap = useProjectStore((state) => state.projects);
  const projects = useMemo(() => Object.values(projectsMap), [projectsMap]);
  const updateProjectStatus = useProjectStore((state) => state.updateProjectStatus);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {statusColumns.map((status) => {
        const columnProjects = projects.filter((project) => project.status === status);

        return (
          <div
            key={status}
            className="border border-[var(--border-ink)] bg-[var(--surface)] rounded-[var(--radius-medium)] p-4 shadow-sm flex flex-col h-full min-h-[500px]"
          >
            <div className="mb-4 flex items-center justify-between pb-3 border-b border-[var(--border-ink)]">
              <div className="flex items-center gap-2">
                <h3 className="font-display text-sm font-bold text-[var(--foreground)] uppercase tracking-wider">
                  {status}
                </h3>
                <span className="bg-[var(--surface)] text-[var(--text-secondary)] text-xs font-mono font-bold px-2 py-0.5 rounded-[var(--radius-small)]">
                  {columnProjects.length}
                </span>
              </div>
            </div>
            <div className="space-y-4 flex-1">
              {columnProjects.length === 0 ? (
                <div className="h-32 border border-dashed border-[var(--border-ink)] rounded-[var(--radius-medium)] flex items-center justify-center text-xs text-[var(--text-secondary)] font-mono">
                  No projects in {status}
                </div>
              ) : (
                columnProjects.map((project) => {
                  const bdCost = calculateBlackDarumaCost(
                    project.unitProgression.skillProgress.currentSkills,
                    project.unitProgression.skillProgress.targetSkills
                  );
                  const { requiredG2Fodders } = calculatePromotionCost(
                    project.unitProgression.gradeProgress.currentGrade,
                    project.unitProgression.gradeProgress.targetGrade
                  );
                  // Mock progress calculation for UI
                  const totalG2Needed = calculatePromotionCost(2, project.unitProgression.gradeProgress.targetGrade).requiredG2Fodders;
                  const currentG2Equivalent = calculatePromotionCost(2, project.unitProgression.gradeProgress.currentGrade).requiredG2Fodders;
                  const progress = totalG2Needed > 0 ? Math.round((currentG2Equivalent / totalG2Needed) * 100) : 100;

                  return (
                    <div
                      key={project.id}
                      className="border border-[var(--border-ink)] bg-[var(--surface)] rounded-[var(--radius-medium)] p-4 shadow-sm space-y-3 hover:border-[var(--border-ink)] transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-bold text-sm text-[var(--foreground)]">{project.name}</h4>
                          <p className="text-xs text-[var(--text-secondary)] leading-relaxed mt-0.5">
                            {project.description}
                          </p>
                        </div>
                        <Badge
                          variant={project.priority === "High" ? "accent" : "default"}
                          className="text-[10px] uppercase font-bold shrink-0"
                        >
                          {project.priority}
                        </Badge>
                      </div>

                      <div className="space-y-1.5 pt-1">
                        <div className="flex justify-between text-xs font-mono text-[var(--text-secondary)]">
                          <span>Grade Progress</span>
                          <span className="font-bold text-[var(--foreground)]">G{project.unitProgression.gradeProgress.currentGrade} → G{project.unitProgression.gradeProgress.targetGrade}</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs font-mono text-[var(--text-secondary)] pt-1 border-t border-[var(--border-ink)]">
                        <span>BD Req: <strong className="text-[var(--foreground)]">{bdCost}</strong></span>
                        <span>Fodder (G2): <strong className="text-[var(--foreground)]">{requiredG2Fodders}</strong></span>
                        <span className="col-span-2">Skills: <strong className="text-[var(--foreground)]">{project.unitProgression.skillProgress.currentSkills.join('/')} → {project.unitProgression.skillProgress.targetSkills.join('/')}</strong></span>
                      </div>

                      <div className="pt-2">
                        <Select
                          className="h-8 text-xs font-medium w-full"
                          aria-label={`${project.name} status`}
                          value={project.status}
                          onChange={(event) =>
                            updateProjectStatus(project.id, event.target.value as ProjectStatus)
                          }
                        >
                          {statusColumns.map((columnStatus) => (
                            <option key={columnStatus} value={columnStatus}>
                              Move to: {columnStatus}
                            </option>
                          ))}
                        </Select>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}