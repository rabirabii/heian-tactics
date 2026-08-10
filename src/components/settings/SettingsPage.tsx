"use client";

import { PageHeader } from "@/features/dashboard/dashboard-shell";
import { Button } from "@/components/ui/button";

export function SettingsPage() {
  const handleReset = () => {
    if (confirm("Are you sure you want to completely reset all application data? This action cannot be undone.")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your application data and preferences."
      />

      <div className="max-w-xl space-y-6">
        <div className="border border-[var(--border-ink)] bg-[var(--surface)] rounded-[var(--radius-medium)] p-6 shadow-sm">
          <h3 className="font-display text-lg font-bold ink">Danger Zone</h3>
          <p className="text-sm text-[var(--text-secondary)] mt-1 mb-6">
            Permanently delete all your local planning data, rosters, projects, and activities.
          </p>
          <Button variant="destructive" onClick={handleReset}>
            Reset All Application Data
          </Button>
        </div>
      </div>
    </div>
  );
}