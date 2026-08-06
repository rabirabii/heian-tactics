import { SidebarNav } from '@/components/sidebar';
import type { ReactNode } from 'react';

export default function PlannerLayout({
  children,
}: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[var(--color-bg)]">
      <SidebarNav className="flex-shrink-0" />
      <div className="flex-1 p-6">
        {/* Outlet for page components */}
        {children}
      </div>
    </div>
  );
}