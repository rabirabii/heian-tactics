import { PageHeader } from '@/features/dashboard/dashboard-shell';
import { ProjectBoard } from './ProjectBoard';
import { NewProjectForm } from './NewProjectForm';
import { cn } from '@/lib/utils';

export function ProjectsPage() {
  return (
    <>
      <PageHeader
        title="Projects"
        description="Manage long-term build projects, status, requirements, priority, and ROI."
      />
      <section className="grid gap-5 xl:grid-cols-[1fr_0.9fr]">
        <ProjectBoard />
        <div className="border-2-black panel-bg shadow-hard rounded-none p-4">
          <NewProjectForm />
        </div>
      </section>
    </>
  );
}