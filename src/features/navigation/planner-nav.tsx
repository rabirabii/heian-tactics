"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  FolderKanban,
  Gauge,
  RefreshCcw,
  Settings,
  Sparkles,
  TableProperties,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { summarizeAccount } from "@/lib/forecast";
import { cn } from "@/lib/utils";
import { usePlannerStore } from "@/store/planner-store";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Gauge },
  { href: "/resources", label: "Resources", icon: TableProperties },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/roster", label: "Roster", icon: Users },
  { href: "/planner", label: "Planner", icon: CalendarDays },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function PlannerNav() {
  const pathname = usePathname();
  const resources = usePlannerStore((state) => state.resources);
  const projects = usePlannerStore((state) => state.projects);
  const settings = usePlannerStore((state) => state.settings);
  const resetDemoData = usePlannerStore((state) => state.resetDemoData);
  const summary = summarizeAccount(resources, projects);

  return (
    <aside className="border-b border-zinc-200 bg-white lg:fixed lg:inset-y-0 lg:left-0 lg:w-72 lg:border-b-0 lg:border-r">
      <div className="flex h-full flex-col gap-5 p-4 lg:p-5">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-lime-300 p-2 text-zinc-950">
            <Sparkles size={18} />
          </div>
          <div>
            <p className="font-display text-base font-black text-zinc-950">
              Onmyoji Planner
            </p>
            <p className="text-xs text-zinc-500">
              {settings.gameServer} · {settings.targetZenithSeason}
            </p>
          </div>
        </div>

        <nav className="flex gap-2 overflow-x-auto lg:grid lg:overflow-visible">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex h-10 shrink-0 items-center gap-2 rounded-md px-3 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-950",
                  active &&
                    "bg-zinc-950 text-white hover:bg-zinc-950 hover:text-white",
                )}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto hidden space-y-3 lg:block">
          <div className="rounded-lg border border-zinc-200 p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-500">Zenith ready</span>
              <Badge variant="default">{summary.zenithReadyPercent}%</Badge>
            </div>
            <div className="font-data mt-3 grid grid-cols-2 gap-2 text-xs text-zinc-500">
              <span>BD {summary.currentBlackDaruma}</span>
              <span>Jade {summary.currentJade}</span>
              <span>G6 {summary.currentG6Count}</span>
              <span>Done {summary.projectsCompleted}</span>
            </div>
          </div>
          <Button
            className="w-full"
            variant="secondary"
            onClick={resetDemoData}
          >
            <RefreshCcw />
            Reset Demo
          </Button>
        </div>
      </div>
    </aside>
  );
}
