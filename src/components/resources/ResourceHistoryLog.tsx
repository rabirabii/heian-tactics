"use client";

import { useMemo } from "react";
import { useInventoryStore } from "@/store/inventory-store";
import { resourceLabels } from "@/lib/planner-data";
import { InventoryResourceType } from "@/types/domain/inventory";

interface LogEntry {
  type: InventoryResourceType;
  label: string;
  activityType?: string;
  date: string;
  amount: number;
}

interface TransactionGroup {
  date: string;
  source: string;
  entries: LogEntry[];
}

export function ResourceHistoryLog() {
  const resources = useInventoryStore((state) => state.resources);

  const transactions = useMemo(() => {
    // 1. Flatten all origins into a single array
    const allLogs: LogEntry[] = [];
    
    Object.entries(resources).forEach(([key, resource]) => {
      if (!resource.origins) return;
      const type = key as InventoryResourceType;
      const label = resourceLabels[type] || resource.label || type;
      
      resource.origins.forEach((origin) => {
        allLogs.push({
          type,
          label,
          activityType: origin.activityType,
          date: origin.date,
          amount: origin.amount,
        });
      });
    });

    // 2. Sort by date descending (newest first)
    allLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // 3. Group by identical date string + activityType
    const groups: TransactionGroup[] = [];
    let currentGroup: TransactionGroup | null = null;

    allLogs.forEach((log) => {
      const sourceLabel = log.activityType || "Manual Adjustment";
      
      if (
        currentGroup && 
        currentGroup.date === log.date && 
        currentGroup.source === sourceLabel
      ) {
        currentGroup.entries.push(log);
      } else {
        currentGroup = {
          date: log.date,
          source: sourceLabel,
          entries: [log],
        };
        groups.push(currentGroup);
      }
    });

    return groups;
  }, [resources]);

  if (transactions.length === 0) {
    return (
      <div className="p-8 text-center text-[var(--text-secondary)] border border-[var(--border-ink)] rounded-[var(--radius-medium)] bg-[var(--surface)] border-dashed">
        <p>No transactions yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {transactions.slice(0, 50).map((group, i) => (
        <div key={`${group.date}-${i}`} className="border border-[var(--border-ink)] bg-[var(--surface)] rounded-[var(--radius-medium)] p-4 shadow-sm">
          <div className="flex justify-between items-center mb-3 pb-2 border-b border-[var(--border-ink)]">
            <span className="text-sm font-bold text-[var(--foreground)]">{group.source}</span>
            <span className="text-xs text-[var(--text-secondary)]">
              {new Date(group.date).toLocaleString()}
            </span>
          </div>
          
          <div className="space-y-2">
            {group.entries.map((entry, j) => (
              <div key={j} className="flex justify-between items-center text-sm">
                <span className="text-[var(--text-secondary)]">{entry.label}</span>
                <span className={`font-mono font-bold ${entry.amount > 0 ? "text-green-500" : "text-red-500"}`}>
                  {entry.amount > 0 ? "+" : ""}{entry.amount}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
