"use client";

import { useState } from 'react';
import { PageHeader } from '@/features/dashboard/dashboard-shell';
import { ProjectBoard } from './ProjectBoard';
import { NewProjectForm } from './NewProjectForm';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';

export function ProjectsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        description="Manage long-term build projects, status, requirements, priority, and ROI."
        action={
          <Button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 font-bold px-4 py-2"
          >
            <Plus size={16} />
            Add Project
          </Button>
        }
      />

      <section className="w-full">
        <ProjectBoard />
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-3xl border border-[var(--border-ink)] bg-[var(--surface)] p-6 shadow-2xl rounded-[var(--radius-medium)] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-ink)]">
              <div>
                <h3 className="text-lg font-bold text-[var(--foreground)]">Create New Project</h3>
                <p className="text-xs text-[var(--text-secondary)]">Set up resource requirements and priority targets</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-[var(--radius-small)] text-[var(--text-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--surface)] transition-colors"
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>
            </div>
            <NewProjectForm onSuccess={() => setIsModalOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}