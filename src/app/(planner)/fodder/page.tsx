"use client";

import { useState, useMemo } from "react";
import { useInventoryStore } from "@/store/inventory-store";
import { useActivityStore } from "@/store/activity-store";
import { PageHeader } from "@/features/dashboard/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/form";
import { InventoryResourceType } from "@/types/domain/inventory";
import { calculateTotalMonthlyProduction } from "@/domain/production-pipeline";
import { forecastG6Capacity } from "@/domain/grade-progression";

export default function FodderFactoryPage() {
  const { resources, adjustAmount } = useInventoryStore();
  const { plannedThroughputs, plannedWeeklyPatterns } = useActivityStore();
  const [targetG6, setTargetG6] = useState(1);

  const g2 = resources.g2Fodder?.currentAmount ?? 0;
  const g3 = resources.g3Fodder?.currentAmount ?? 0;
  const g4 = resources.g4Fodder?.currentAmount ?? 0;
  const g5 = resources.g5Fodder?.currentAmount ?? 0;

  // Monthly Production from Planner
  const monthlyProduction = useMemo(() => {
    return calculateTotalMonthlyProduction(plannedThroughputs, plannedWeeklyPatterns);
  }, [plannedThroughputs, plannedWeeklyPatterns]);

  // Convert monthly production to daily income for simulation
  const dailyIncome = {
    g2: (monthlyProduction.g2Fodder ?? 0) / 30 + (monthlyProduction.brokenAmulet ?? 0) * 0.5 / 30,
    g3: (monthlyProduction.g3Fodder ?? 0) / 30,
    g4: (monthlyProduction.g4Fodder ?? 0) / 30,
    g5: (monthlyProduction.g5Fodder ?? 0) / 30,
  };

  const forecast = forecastG6Capacity({ g2, g3, g4, g5 }, dailyIncome, targetG6);

  const totalDailyIncomeG2Eq = 
    dailyIncome.g2 + 
    (dailyIncome.g3 * 3) + 
    (dailyIncome.g4 * 12) + 
    (dailyIncome.g5 * 60);

  // True G2 Equivalent
  const g2Equiv = g2 + (g3 * 3) + (g4 * 12) + (g5 * 60);
  const targetEquiv = 300;
  const readyG6 = Math.floor(g2Equiv / targetEquiv);
  const progressPercent = Math.min((g2Equiv % targetEquiv) / targetEquiv * 100, 100);

  const handlePromote = (from: InventoryResourceType, to: InventoryResourceType | null, cost: number) => {
    if ((resources[from]?.currentAmount ?? 0) >= cost) {
      const transactionDate = new Date().toISOString();
      adjustAmount(from, -cost, "System: Fodder Promotion", transactionDate);
      if (to) {
        adjustAmount(to, 1, "System: Fodder Promotion", transactionDate);
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader
        title="Fodder Factory"
        description="Visualize your fodder pipeline. Fodders represent your supply for promoting Shikigami. Sacrifice fodders do not need to be max level."
      />

      {/* Hero Metric: True G6 Readiness */}
      <div className="border border-[var(--border-ink)] bg-[var(--surface)] rounded-[var(--radius-medium)] p-6 shadow-sm">
        <h2 className="font-display text-xl font-bold ink mb-2">True G6 Readiness</h2>
        <p className="text-sm text-[var(--text-secondary)] mb-6">
          Your entire fodder inventory converted into base G2 equivalents. 1 G6 requires 5 G5 Fodders = 300 G2s.
        </p>

        <div className="flex justify-between text-sm mb-2">
          <span className="font-medium text-[var(--foreground)]">{g2Equiv} / {targetEquiv} G2 Equivalents</span>
          <span className="font-bold ink">{readyG6} G6 Upgrades Ready</span>
        </div>

        <div className="w-full bg-[var(--surface)] h-4 rounded-full overflow-hidden flex relative">
          {readyG6 > 0 && (
            <div 
              className="bg-[var(--foreground)] h-full transition-all duration-500 ease-in-out border-r border-white/20"
              style={{ width: `${(readyG6 * targetEquiv) / Math.max(g2Equiv, targetEquiv) * 100}%` }}
              title={`${readyG6} Full G6 Upgrades`}
            />
          )}
          <div 
            className="bg-[var(--border-ink)] h-full transition-all duration-500 ease-in-out relative"
            style={{ width: `${(g2Equiv % targetEquiv) / Math.max(g2Equiv, targetEquiv) * 100}%` }}
          >
            {/* Animated gleam effect for progress */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
          </div>
        </div>
      </div>

      {/* Fodder Inventory & Pipeline */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* G2 Fodder */}
        <div className="border border-[var(--border-ink)] bg-[var(--surface)] p-4 rounded-[var(--radius-medium)] shadow-sm flex flex-col justify-between hover:border-[var(--border-ink)] transition-colors">
          <div>
            <h3 className="font-display font-bold text-lg text-[var(--foreground)]">G2 Fodder</h3>
            <p className="text-xs text-[var(--text-secondary)] mb-4">Base Fodder</p>
            <div className="text-3xl font-mono mb-6">{g2}</div>
          </div>
          <div className="flex gap-2">
            <div className="flex gap-1 flex-[1.2]">
              <Button 
                variant="secondary" 
                className="flex-1 text-xs px-1"
                disabled={g2 <= 0}
                onClick={() => adjustAmount("g2Fodder", -1, "Manual Input")}
              >
                -1
              </Button>
              <Button 
                variant="secondary" 
                className="flex-1 text-xs px-1"
                onClick={() => adjustAmount("g2Fodder", 1, "Manual Input")}
              >
                +1
              </Button>
            </div>
            <Button 
              className="flex-[2] justify-between text-xs px-2"
              disabled={g2 < 3}
              onClick={() => handlePromote("g2Fodder", "g3Fodder", 3)}
            >
              <span>To G3</span>
              <span className="text-[10px] bg-[var(--surface)] px-1 rounded">-3 G2</span>
            </Button>
          </div>
        </div>

        {/* G3 Fodder */}
        <div className="border border-[var(--border-ink)] bg-[var(--surface)] p-4 rounded-[var(--radius-medium)] shadow-sm flex flex-col justify-between hover:border-[var(--border-ink)] transition-colors">
          <div>
            <h3 className="font-display font-bold text-lg text-[var(--foreground)]">G3 Fodder</h3>
            <p className="text-xs text-[var(--text-secondary)] mb-4">= 3 G2 Equivalents</p>
            <div className="text-3xl font-mono mb-6">{g3}</div>
          </div>
          <div className="flex gap-2">
            <div className="flex gap-1 flex-[1.2]">
              <Button 
                variant="secondary" 
                className="flex-1 text-xs px-1"
                disabled={g3 <= 0}
                onClick={() => adjustAmount("g3Fodder", -1, "Manual Input")}
              >
                -1
              </Button>
              <Button 
                variant="secondary" 
                className="flex-1 text-xs px-1"
                onClick={() => adjustAmount("g3Fodder", 1, "Manual Input")}
              >
                +1
              </Button>
            </div>
            <Button 
              className="flex-[2] justify-between text-xs px-2"
              disabled={g3 < 4}
              onClick={() => handlePromote("g3Fodder", "g4Fodder", 4)}
            >
              <span>To G4</span>
              <span className="text-[10px] bg-[var(--surface)] px-1 rounded">-4 G3</span>
            </Button>
          </div>
        </div>

        {/* G4 Fodder */}
        <div className="border border-[var(--border-ink)] bg-[var(--surface)] p-4 rounded-[var(--radius-medium)] shadow-sm flex flex-col justify-between hover:border-[var(--border-ink)] transition-colors">
          <div>
            <h3 className="font-display font-bold text-lg text-[var(--foreground)]">G4 Fodder</h3>
            <p className="text-xs text-[var(--text-secondary)] mb-4">= 12 G2 Equivalents</p>
            <div className="text-3xl font-mono mb-6">{g4}</div>
          </div>
          <div className="flex gap-2">
            <div className="flex gap-1 flex-[1.2]">
              <Button 
                variant="secondary" 
                className="flex-1 text-xs px-1"
                disabled={g4 <= 0}
                onClick={() => adjustAmount("g4Fodder", -1, "Manual Input")}
              >
                -1
              </Button>
              <Button 
                variant="secondary" 
                className="flex-1 text-xs px-1"
                onClick={() => adjustAmount("g4Fodder", 1, "Manual Input")}
              >
                +1
              </Button>
            </div>
            <Button 
              className="flex-[2] justify-between text-xs px-2"
              disabled={g4 < 5}
              onClick={() => handlePromote("g4Fodder", "g5Fodder", 5)}
            >
              <span>To G5</span>
              <span className="text-[10px] bg-[var(--surface)] px-1 rounded">-5 G4</span>
            </Button>
          </div>
        </div>

        {/* G5 Fodder */}
        <div className="border border-[var(--border-ink)] bg-[var(--surface)] p-4 rounded-[var(--radius-medium)] shadow-sm flex flex-col justify-between border-[var(--foreground)]/30 hover:border-[var(--foreground)] transition-colors">
          <div>
            <h3 className="font-display font-bold text-lg text-[var(--foreground)]">G5 Fodder</h3>
            <p className="text-xs text-[var(--text-secondary)] mb-4">= 60 G2 Equivalents</p>
            <div className="text-3xl font-mono mb-6 ink font-bold">{g5}</div>
          </div>
          <div className="flex gap-2">
            <div className="flex gap-1 flex-[1.2]">
              <Button 
                variant="secondary" 
                className="flex-1 text-xs px-1"
                disabled={g5 <= 0}
                onClick={() => adjustAmount("g5Fodder", -1, "Manual Input")}
              >
                -1
              </Button>
              <Button 
                variant="secondary" 
                className="flex-1 text-xs px-1"
                onClick={() => adjustAmount("g5Fodder", 1, "Manual Input")}
              >
                +1
              </Button>
            </div>
            <Button 
              className="flex-[2] justify-between text-xs px-2"
              disabled={g5 < 5}
              onClick={() => handlePromote("g5Fodder", null, 5)}
              title="Consume 5 G5s to represent upgrading a unit to G6"
            >
              <span>Build G6</span>
              <span className="text-[10px] bg-[var(--background)]/20 px-1 rounded">-5 G5</span>
            </Button>
          </div>
        </div>

      </div>
      
      {/* Fodder Goal Seeker */}
      <div className="border border-[var(--border-ink)] bg-[var(--surface)] rounded-[var(--radius-medium)] p-6 shadow-sm mt-8">
        <h2 className="font-display text-xl font-bold ink mb-2">Fodder Goal Seeker</h2>
        <p className="text-sm text-[var(--text-secondary)] mb-6">
          See how many days it will take to reach your target number of G6 Shikigami based on your current inventory and planned farming routines.
        </p>

        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="w-full md:w-1/3">
            <label className="text-sm font-bold text-[var(--foreground)] mb-2 block">Target G6 Amount</label>
            <div className="flex items-center gap-4">
              <Input 
                type="number" 
                value={targetG6}
                onChange={(e) => setTargetG6(Math.max(1, Number(e.target.value)))}
                className="font-mono text-xl h-12"
              />
            </div>
            
            <div className="mt-6 space-y-2 text-sm">
              <div className="flex justify-between border-b border-[var(--border-ink)] pb-2">
                <span className="text-[var(--text-secondary)]">Current G6 Capacity</span>
                <span className="font-bold">{forecast.currentCapacity}</span>
              </div>
              <div className="flex justify-between border-b border-[var(--border-ink)] pb-2">
                <span className="text-[var(--text-secondary)]">Target G6 Amount</span>
                <span className="font-bold">{targetG6}</span>
              </div>
            </div>
          </div>
          
          <div className="w-full md:w-2/3 bg-[var(--surface)] p-6 rounded-[var(--radius-medium)] border border-[var(--border-ink)]">
            <h3 className="font-bold text-[var(--foreground)] mb-4">Pipeline Forecast</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-3 bg-[var(--surface)] rounded text-sm">
                <span className="block text-[var(--text-secondary)] mb-1">Estimated Completion</span>
                {forecast.daysToTarget === 0 ? (
                  <span className="text-xl font-bold text-green-500">Ready Now!</span>
                ) : forecast.daysToTarget === Infinity ? (
                  <span className="text-xl font-bold text-red-500">Unreachable</span>
                ) : (
                  <span className="text-xl font-bold text-[var(--foreground)]">{forecast.daysToTarget} Days</span>
                )}
              </div>
              <div className="p-3 bg-[var(--surface)] rounded text-sm">
                <span className="block text-[var(--text-secondary)] mb-1">Monthly G2 Equivalent Income</span>
                <span className="text-xl font-bold text-[var(--foreground)]">
                  {Math.round(totalDailyIncomeG2Eq * 30).toLocaleString()}
                </span>
              </div>
            </div>

            {forecast.daysToTarget === Infinity && forecast.currentCapacity < targetG6 && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-sm text-red-500">
                <strong>Target Unreachable!</strong> Your planned activities do not generate enough fodder. Go to the Planner and increase your Exploration runs or other fodder-generating activities.
              </div>
            )}
            
            {forecast.daysToTarget > 0 && forecast.daysToTarget !== Infinity && (
              <p className="text-sm text-[var(--text-secondary)]">
                Based on your Planner, you are generating approx. <strong>{totalDailyIncomeG2Eq.toFixed(1)}</strong> G2 equivalents per day. The simulation recursively promotes your daily income through the G2→G3→G4→G5 pipeline until the target is met.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
