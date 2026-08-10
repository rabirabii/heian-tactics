"use client";

import { useMemo, useState } from "react";
import { useActivityStore } from "@/store/activity-store";
import { PageHeader } from "@/features/dashboard/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/form";
import { ActivityType } from "@/types/domain/activity";

const DAY_MAP = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

export default function TrackerPage() {
  const { plannedWeeklyPatterns, logActivity, logs } = useActivityStore();
  
  // Get today's day key (e.g. "mon")
  const todayIndex = new Date().getDay();
  const todayKey = DAY_MAP[todayIndex];

  // Derive today's planned activities
  const todaysPlan = useMemo(() => {
    const plan: { type: ActivityType; plannedRuns: number }[] = [];
    Object.entries(plannedWeeklyPatterns).forEach(([type, pattern]) => {
      const runs = pattern[todayKey];
      if (runs > 0) {
        plan.push({ type: type as ActivityType, plannedRuns: runs });
      }
    });
    return plan;
  }, [plannedWeeklyPatterns, todayKey]);

  // Form state for logging
  const [actualRuns, setActualRuns] = useState<Record<string, number>>({});

  const handleLog = (type: ActivityType, planned: number) => {
    const runs = actualRuns[type] !== undefined ? actualRuns[type] : planned;
    if (runs > 0) {
      logActivity(type, runs);
      // Reset input state for this type after logging
      setActualRuns(prev => {
        const next = { ...prev };
        delete next[type];
        return next;
      });
    }
  };

  const recentLogs = [...logs].reverse().slice(0, 20);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader
        title="Activity Tracker"
        description="Log your actual daily activities against your planned routine to build a historical record."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Today's Checklist */}
        <div className="space-y-4">
          <h2 className="font-display text-xl font-bold ink">Today's Target ({todayKey.toUpperCase()})</h2>
          {todaysPlan.length === 0 ? (
            <p className="text-sm text-[var(--text-secondary)]">No activities planned for today. Enjoy your rest!</p>
          ) : (
            <div className="space-y-3">
              {todaysPlan.map((plan) => {
                const isLogged = logs.some(
                  l => l.activityType === plan.type && new Date(l.date).toDateString() === new Date().toDateString()
                );
                
                return (
                  <div key={plan.type} className={`p-4 border rounded-[var(--radius-medium)] shadow-sm flex items-center justify-between transition-colors ${isLogged ? 'bg-[var(--surface)] border-[var(--border-ink)] opacity-70' : 'bg-[var(--surface)] border-[var(--border-ink)]'}`}>
                    <div>
                      <h3 className="font-bold text-[var(--foreground)]">{plan.type}</h3>
                      <p className="text-xs text-[var(--text-secondary)]">Target: {plan.plannedRuns} {plan.type === "SpeedChallenge" || plan.type.includes("Weekly") ? "this week" : "runs"}</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Input 
                        type="number" 
                        className="w-20 h-9 font-mono text-center"
                        placeholder={plan.plannedRuns.toString()}
                        value={actualRuns[plan.type] !== undefined ? actualRuns[plan.type] : plan.plannedRuns}
                        onChange={(e) => setActualRuns({ ...actualRuns, [plan.type]: Number(e.target.value) })}
                      />
                      <Button 
                        onClick={() => handleLog(plan.type, plan.plannedRuns)}
                        variant={isLogged ? "secondary" : "default"}
                      >
                        {isLogged ? "Log Again" : "Done"}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent History */}
        <div className="space-y-4">
          <h2 className="font-display text-xl font-bold ink">Recent History</h2>
          {recentLogs.length === 0 ? (
            <p className="text-sm text-[var(--text-secondary)]">No logs recorded yet.</p>
          ) : (
            <div className="border border-[var(--border-ink)] bg-[var(--surface)] rounded-[var(--radius-medium)] overflow-hidden shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-[var(--surface)] text-[var(--text-secondary)] text-xs uppercase">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Date & Time</th>
                    <th className="py-3 px-4 font-semibold">Activity</th>
                    <th className="py-3 px-4 font-semibold text-right">Runs</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-ink)]">
                  {recentLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-[var(--surface-hover)]">
                      <td className="py-3 px-4 whitespace-nowrap text-[var(--text-secondary)]">
                        {new Date(log.date).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3 px-4 font-medium text-[var(--foreground)]">{log.activityType}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold ink">{log.runCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
