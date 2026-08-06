import Link from 'next/link';
import { cn } from '@/lib/utils';
import { usePlannerStore } from '@/store/planner-store';

export function SidebarNav({ className }: { className?: string }) {
  const { resetDemoData } = usePlannerStore();
  const routes = [
    { href: '/(planner)/dashboard', label: 'Dashboard' },
    { href: '/(planner)/resources', label: 'Resources' },
    { href: '/(planner)/projects', label: 'Projects' },
    { href: '/(planner)/roster', label: 'Roster' },
    { href: '/(planner)/planner', label: 'Planner' },
    { href: '/(planner)/settings', label: 'Settings' },
  ];

  return (
    <aside className={cn(
      "w-64 bg-[var(--color-panel)] border-r-[2px] border-[var(--color-ink)] p-4 space-y-2",
      className
    )}>
      <h2 className="font-display text-lg ink uppercase tracking-wide mb-4">
        Planner
      </h2>
      <nav className="space-y-1">
        {routes.map(({ href, label }) => (
          <Link key={href} href={href} className="flex w-full items-center px-3 py-2 text-sm font-data ink border-2-black rounded-none shadow-hard hover-press">
            {label}
          </Link>
        ))}
      </nav>
      <button
        onClick={resetDemoData}
        className="mt-auto w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-data ink border-2-black rounded-none shadow-hard hover-press"
      >
        <svg className="icon-16 ink" /* reset icon placeholder */>Reset Icon</svg>
        Reset Demo
      </button>
    </aside>
  );
}