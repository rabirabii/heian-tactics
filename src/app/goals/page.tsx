"use client";

import { useState } from "react";
import { PageHeader } from "@/features/dashboard/dashboard-shell";
import { useGoalStore, SummonGoal } from "@/store/goal-store";
import { useInventoryStore } from "@/store/inventory-store";
import { useActivityStore } from "@/store/activity-store";
import { calculateMonthlyYield } from "@/domain/production-pipeline";
import { effectiveAmount } from "@/lib/forecast";
import { Input } from "@/components/ui/form";
import { Button } from "@/components/ui/button";

export default function GoalsPage() {
  const { activeGoal, setActiveGoal } = useGoalStore();
  const resources = useInventoryStore(state => state.resources);
  const plannedThroughputs = useActivityStore(state => state.plannedThroughputs);

  const [name, setName] = useState(activeGoal?.name || "");
  const [targetDate, setTargetDate] = useState(activeGoal?.targetDate || "");
  const [requiredPulls, setRequiredPulls] = useState(activeGoal?.requiredPulls?.toString() || "");

  const handleSave = () => {
    if (!name || !targetDate || !requiredPulls) return;
    setActiveGoal({
      id: Date.now().toString(),
      name,
      targetDate,
      requiredPulls: Number(requiredPulls),
    });
  };

  const handleClear = () => {
    setActiveGoal(null);
    setName("");
    setTargetDate("");
    setRequiredPulls("");
  };

  // Calculate trajectory if there is an active goal
  let trajectorySummary = null;
  if (activeGoal) {
    const today = new Date();
    const target = new Date(activeGoal.targetDate);
    
    if (target < today) {
      trajectorySummary = <div className="text-red-500">Target date is in the past!</div>;
    } else {
      const daysUntil = Math.floor((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      const monthsUntil = daysUntil / 30; // Approximation

      // Sum up monthly income for Jade and Amulets
      let monthlyJadeIncome = resources.jade?.observedYield ?? 0;
      let monthlyAmuletIncome = resources.mysteryAmulet?.observedYield ?? 0;
      
      Object.values(plannedThroughputs).forEach((throughput) => {
        const monthly = calculateMonthlyYield(
          throughput.activityType,
          throughput.averageRunsPerDay,
          throughput.rollingYieldRates
        );
        monthlyJadeIncome += monthly.jadePerRun ?? 0;
        monthlyAmuletIncome += monthly.mysteryAmuletPerRun ?? 0;
      });

      const currentJade = resources.jade ? effectiveAmount(resources.jade) : 0;
      const currentAmulets = resources.mysteryAmulet ? effectiveAmount(resources.mysteryAmulet) : 0;
      
      const projectedJade = currentJade + (monthlyJadeIncome * monthsUntil);
      const projectedAmulets = currentAmulets + (monthlyAmuletIncome * monthsUntil);
      const projectedPulls = Math.floor(projectedJade / 100) + Math.floor(projectedAmulets);
      
      const deficit = activeGoal.requiredPulls - projectedPulls;
      const isReachable = deficit <= 0;

      trajectorySummary = (
        <div className="mt-6 p-4 border border-[var(--border-ink)] rounded-[var(--radius-medium)] bg-[var(--surface)] shadow-sm">
          <h3 className="font-display font-bold ink text-lg mb-2">Trajectory Analysis</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-[var(--text-secondary)]">Days Remaining</p>
              <p className="font-mono text-lg">{daysUntil} days</p>
            </div>
            <div>
              <p className="text-[var(--text-secondary)]">Projected Hoard</p>
              <p className="font-mono text-lg">{Math.round(projectedJade).toLocaleString()} Jade + {Math.floor(projectedAmulets)} Tix</p>
            </div>
            <div>
              <p className="text-[var(--text-secondary)]">Projected Pulls</p>
              <p className="font-mono text-lg">{projectedPulls}</p>
            </div>
            <div>
              <p className="text-[var(--text-secondary)]">Status</p>
              {isReachable ? (
                <p className="font-mono text-lg text-emerald-500 font-bold">REACHABLE 🎉</p>
              ) : (
                <p className="font-mono text-lg text-red-500 font-bold">SHORT BY {deficit} PULLS</p>
              )}
            </div>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <PageHeader 
        title="Summon Goals" 
        description="Set a gacha target and see if your current passive income and grinding routine can afford it." 
      />
      
      <div className="p-6 border border-[var(--border-ink)] rounded-[var(--radius-large)] bg-[var(--surface)] shadow-sm space-y-4">
        <div>
          <label className="block text-sm font-bold ink mb-1">Banner Name</label>
          <Input 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder="e.g. SP Susabi Banner" 
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold ink mb-1">Target Date</label>
            <Input 
              type="date" 
              value={targetDate} 
              onChange={(e) => setTargetDate(e.target.value)} 
            />
          </div>
          <div>
            <label className="block text-sm font-bold ink mb-1">Required Pulls</label>
            <Input 
              type="number" 
              value={requiredPulls} 
              onChange={(e) => setRequiredPulls(e.target.value)} 
              placeholder="e.g. 200" 
            />
          </div>
        </div>
        
        <div className="flex gap-2 pt-2">
          <Button onClick={handleSave} className="bg-blue-600 text-white font-bold px-6">Set Goal</Button>
          {activeGoal && <Button onClick={handleClear} variant="ghost" className="text-red-500 font-bold">Clear Goal</Button>}
        </div>
      </div>

      {trajectorySummary}
    </div>
  );
}
