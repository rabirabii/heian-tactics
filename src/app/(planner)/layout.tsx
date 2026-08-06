import type { ReactNode } from "react";
import { PlannerNav } from "@/features/navigation/planner-nav";

export default function PlannerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-950">
      <PlannerNav />
      <main className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:ml-72 lg:px-8">
        {children}
      </main>
    </div>
  );
}
