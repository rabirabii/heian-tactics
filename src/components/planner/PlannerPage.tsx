"use client";

import { useMemo } from "react";
import { PageHeader } from "@/features/dashboard/dashboard-shell";
import { useActivityStore } from "@/store/activity-store";
import { useInventoryStore } from "@/store/inventory-store";
import { useProjectStore } from "@/store/project-store";
import { summarizeAccount, buildMonthlyProjection } from "@/lib/forecast";
import type { ActivityType, ActivityYieldRates } from "@/types/domain/activity";
import { calculateMonthlyYield, calculateTotalMonthlyProduction } from "@/domain/production-pipeline";
import { Input } from "@/components/ui/form";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { InventoryResourceType } from "@/types/domain/inventory";

export type ActivityCategory = "Grind" | "DailyBoss" | "WeeklyGuild" | "Event" | "Passive" | "StaticShop";

export interface ActivityMeta {
  type: ActivityType;
  label: string;
  desc: string;
  category: ActivityCategory;
  maxRuns?: number;
  activeDays?: ("mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun")[];
  isFlatInput?: boolean;
}

const ACTIVITIES: ActivityMeta[] = [
  // Grind
  { type: "Exploration", label: "Exploration", desc: "Grants EXP & Amulets", category: "Grind" },
  { type: "SoulZone", label: "Soul Zone", desc: "Grants Souls", category: "Grind" },
  { type: "RealmRaid", label: "Realm Raids", desc: "Grants Jade", category: "Grind" },
  // Bosses
  { type: "AreaBoss", label: "Area Boss", desc: "Grants Jade (Max 3/day)", category: "DailyBoss", maxRuns: 3 },
  { type: "DemonEncounter", label: "Demon Encounter", desc: "Grants BD Shards (Max 1/day)", category: "DailyBoss", maxRuns: 1 },
  // Guild
  { type: "Netherworld", label: "Netherworld", desc: "Grants BD Shards", category: "WeeklyGuild", maxRuns: 1, activeDays: ["fri", "sat", "sun"] },
  { type: "GuildBoss", label: "Kirin / Guild Boss", desc: "Grants RNG Jade", category: "WeeklyGuild", maxRuns: 1 },
  // Passive
  { type: "RealmCardJade", label: "Realm Card (Drum)", desc: "Grants Jade (Max 1/day)", category: "Passive", maxRuns: 1 },
  { type: "RealmCardAP", label: "Realm Card (Fish)", desc: "Grants AP (Max 1/day)", category: "Passive", maxRuns: 1 },
  { type: "EntrustJade", label: "Entrust (Jade)", desc: "Grants Jade (Max 4/day)", category: "Passive", maxRuns: 4 },
  { type: "EntrustAP", label: "Entrust (AP)", desc: "Grants AP (Max 4/day)", category: "Passive", maxRuns: 4 },
  // Static & Shops
  { type: "DailyMissions", label: "Daily Missions", desc: "Talisman, Pets, Quests (~80 Jade/day)", category: "StaticShop", maxRuns: 1 },
  { type: "WeeklyDuel", label: "Weekly Duel (Jade)", desc: "Input average Jade/week", category: "StaticShop", isFlatInput: true },
  { type: "SpeedChallenge", label: "Speed Challenge (405 Jade)", desc: "Toggle participation", category: "StaticShop", maxRuns: 1, isFlatInput: true },
  { type: "WeeklyShops", label: "Weekly Shops (Amulets)", desc: "Guild, Medal, Honor (Input Avg/week)", category: "StaticShop", isFlatInput: true },
  { type: "MonthlyFreebies", label: "Monthly Freebies (Amulets)", desc: "Patterns, Logins (Input Avg/month)", category: "StaticShop", isFlatInput: true },
  // Event
  { type: "Event", label: "Major Events", desc: "Loot boxes & Currency", category: "Event" },
];

function ForecastChart({ data, title }: { data: any[]; title: string }) {
  return (
    <div className="border border-[var(--border-ink)] bg-[var(--surface)] rounded-[var(--radius-medium)] p-4 shadow-sm h-72">
      <h3 className="font-display text-sm font-bold ink mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-ink)" strokeOpacity={0.15} />
          <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
          <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
          <Tooltip contentStyle={{ background: 'var(--surface)', borderRadius: 'var(--radius-small)' }} />
          <Area type="monotone" dataKey="blackDaruma" name="Black Daruma" stroke="var(--foreground)" fill="var(--foreground)" fillOpacity={0.15} />
          <Area type="monotone" dataKey="jade" name="Jade" stroke="var(--text-secondary)" fill="var(--text-secondary)" fillOpacity={0.1} />
          <Area type="monotone" dataKey="ap" name="AP (Sushi)" stroke="#ff7a59" fill="#ff7a59" fillOpacity={0.1} />
          <Area type="monotone" dataKey="mysteryAmulet" name="Mystery Amulets" stroke="#0099ff" fill="#0099ff" fillOpacity={0.15} />
          <Area type="monotone" dataKey="brokenAmulet" name="Broken Amulets" stroke="var(--text-secondary)" fill="var(--text-secondary)" fillOpacity={0.1} />
          <Area type="monotone" dataKey="g6" name="G6 Units (Synthesized)" stroke="var(--border-ink)" fill="var(--border-ink)" fillOpacity={0.05} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function PlannerPage() {
  const { plannedThroughputs, plannedWeeklyPatterns, setPlannedWeeklyPattern } = useActivityStore();
  const resources = useInventoryStore((state) => state.resources);
  const projectsMap = useProjectStore((state) => state.projects);
  const projects = useMemo(() => Object.values(projectsMap), [projectsMap]);

  // Compute the simulated overrides by summing up monthly yields from all planned activities
  const simulatedYieldOverrides = useMemo(() => {
    const production = calculateTotalMonthlyProduction(plannedThroughputs, plannedWeeklyPatterns);
    
    // PlannerPage maps some domain fields to UI fields (e.g. g2 equivalent to exp track)
    const totalG2Equivalent = 
      (production.g2Fodder ?? 0) + 
      ((production.g3Fodder ?? 0) * 3) + 
      ((production.g4Fodder ?? 0) * 12) + 
      ((production.g5Fodder ?? 0) * 60) + 
      ((production.brokenAmulet ?? 0) * 0.5);
      
    return {
      coins: production.coins,
      jade: production.jade,
      blackDaruma: production.blackDaruma,
      brokenAmulet: production.brokenAmulet,
      mysteryAmulet: production.mysteryAmulet,
      ap: production.ap,
      exp: totalG2Equivalent, // 1 G2 = 1 EXP in legacy phase 1 model
    } as Partial<Record<InventoryResourceType, number>>;
  }, [plannedThroughputs, plannedWeeklyPatterns]);

  const observedProjection = useMemo(() => buildMonthlyProjection(resources), [resources]);
  const simulatedProjection = useMemo(() => buildMonthlyProjection(resources, simulatedYieldOverrides), [resources, simulatedYieldOverrides]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Activity Planner & Simulation"
        description="Plan your daily throughput to simulate how it affects your account's long-term forecast."
      />

      <div className="grid grid-cols-1 gap-8">
        
        {/* Planned Activity Configuration */}
        <div className="space-y-4">
          <h2 className="font-display text-xl font-bold ink">Planned Weekly Farming Pattern</h2>
          <p className="text-sm text-secondary mb-4">Set your expected farming routine for the week. The forecast engine uses the resulting daily average to simulate progress.</p>
          
          {["Grind", "DailyBoss", "WeeklyGuild", "Passive", "StaticShop", "Event"].map((categoryStr) => {
            const category = categoryStr as ActivityCategory;
            const categoryActivities = ACTIVITIES.filter(a => a.category === category);
            if (categoryActivities.length === 0) return null;

            let sectionTitle = "";
            let sectionDesc = "";
            if (category === "Grind") {
              sectionTitle = "Infinite Grind (Farming)";
              sectionDesc = "Activities that can be farmed infinitely based on AP or Tickets. Input runs per day.";
            } else if (category === "DailyBoss") {
              sectionTitle = "Daily Bosses & Encounters";
              sectionDesc = "Activities with strict daily limits. Input expected participation/runs per day.";
            } else if (category === "WeeklyGuild") {
              sectionTitle = "Weekly & Guild Events";
              sectionDesc = "Activities available only on specific days. Input expected participation per day.";
            } else if (category === "Passive") {
              sectionTitle = "Passive Income (Realm & Entrust)";
              sectionDesc = "Set your active Realm Card (max 1/day) and Entrusts (max 4/day). Mutually exclusive cards will be handled gracefully.";
            } else if (category === "StaticShop") {
              sectionTitle = "Static Income & Shops";
              sectionDesc = "Weekly and Monthly static income from shops, duels, and events.";
            } else {
              sectionTitle = "Major Events";
              sectionDesc = "Periodic events granting loot boxes and currency.";
            }

            return (
              <div key={category} className="mb-6">
                <h3 className="font-display text-md font-bold ink mb-1">{sectionTitle}</h3>
                <p className="text-xs text-[var(--text-secondary)] mb-3">{sectionDesc}</p>
                <div className="border border-[var(--border-ink)] bg-[var(--surface)] rounded-[var(--radius-medium)] overflow-x-auto shadow-sm">
                  
                  {category === "StaticShop" ? (
                    <table className="w-full text-left border-collapse min-w-[500px]">
                      <thead>
                        <tr className="border-b border-[var(--border-ink)] bg-[var(--surface)] text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                          <th className="py-3 px-4 w-64">Activity</th>
                          <th className="py-3 px-4 text-left">Expected Amount</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        {categoryActivities.map((act) => {
                          const pattern = plannedWeeklyPatterns[act.type];
                          const throughput = plannedThroughputs[act.type];
                          if (!pattern || !throughput) return null;
                          
                          // For static flat inputs, we store the amount in the 'mon' slot.
                          // Speed Challenge is a toggle, the others are raw numbers.
                          const isToggle = act.type === "SpeedChallenge";

                          return (
                            <tr key={act.type} className="border-b border-[var(--border-ink)] hover:bg-[var(--surface-hover)] transition-colors">
                              <td className="py-3 px-4">
                                <div className="font-bold text-[var(--foreground)]">{act.label}</div>
                                <div className="text-[10px] text-[var(--text-secondary)]">{act.desc}</div>
                              </td>
                              <td className="py-3 px-4">
                                {isToggle ? (
                                  <input 
                                    type="checkbox"
                                    className="w-5 h-5 rounded border-[var(--border-ink)]"
                                    checked={pattern.mon > 0}
                                    onChange={(e) => {
                                      setPlannedWeeklyPattern(
                                        act.type, 
                                        { ...pattern, mon: e.target.checked ? 1 : 0 }, 
                                        throughput.rollingYieldRates
                                      );
                                    }}
                                  />
                                ) : (
                                  <Input
                                    type="number"
                                    min={0}
                                    className="w-32 h-8 font-mono text-sm px-2"
                                    value={pattern.mon === 0 ? "" : pattern.mon}
                                    placeholder="0"
                                    onChange={(e) => {
                                      let val = e.target.value === "" ? 0 : Number(e.target.value);
                                      setPlannedWeeklyPattern(
                                        act.type, 
                                        { ...pattern, mon: val }, 
                                        throughput.rollingYieldRates
                                      );
                                    }}
                                  />
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  ) : (
                    <table className="w-full text-left border-collapse min-w-[800px]">
                      <thead>
                        <tr className="border-b border-[var(--border-ink)] bg-[var(--surface)] text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                          <th className="py-3 px-4 w-48">Activity</th>
                          <th className="py-3 px-2 text-center">Mon</th>
                          <th className="py-3 px-2 text-center">Tue</th>
                          <th className="py-3 px-2 text-center">Wed</th>
                          <th className="py-3 px-2 text-center">Thu</th>
                          <th className="py-3 px-2 text-center">Fri</th>
                          <th className="py-3 px-2 text-center">Sat</th>
                          <th className="py-3 px-2 text-center">Sun</th>
                          <th className="py-3 px-4 text-right bg-[var(--surface-hover)]">Daily Avg</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        {categoryActivities.map((act) => {
                          const pattern = plannedWeeklyPatterns[act.type];
                          const throughput = plannedThroughputs[act.type];
                          if (!pattern || !throughput) return null;
                          
                          const days: (keyof typeof pattern)[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
                          
                          return (
                            <tr key={act.type} className="border-b border-[var(--border-ink)] hover:bg-[var(--surface-hover)] transition-colors">
                              <td className="py-3 px-4">
                                <div className="font-bold text-[var(--foreground)]">{act.label}</div>
                                <div className="text-[10px] text-[var(--text-secondary)]">{act.desc}</div>
                              </td>
                              {days.map((day) => {
                                const isDisabled = act.activeDays && !act.activeDays.includes(day);
                                return (
                                  <td key={day} className="py-3 px-1">
                                    <Input
                                      type="number"
                                      min={0}
                                      max={act.maxRuns}
                                      disabled={isDisabled}
                                      className={`w-16 h-8 text-center font-mono text-xs mx-auto px-1 ${isDisabled ? "opacity-30 bg-[var(--surface)]" : ""}`}
                                      value={pattern[day] === 0 ? "" : pattern[day]}
                                      placeholder={isDisabled ? "-" : "0"}
                                      onChange={(e) => {
                                        let val = e.target.value === "" ? 0 : Number(e.target.value);
                                        if (act.maxRuns && val > act.maxRuns) val = act.maxRuns;
                                        
                                        // Mutually Exclusive Realm Cards
                                        if (act.type === "RealmCardJade" && val > 0) {
                                          const otherPattern = plannedWeeklyPatterns["RealmCardAP"];
                                          const otherThroughput = plannedThroughputs["RealmCardAP"];
                                          if (otherPattern && otherThroughput) {
                                            setPlannedWeeklyPattern("RealmCardAP", { ...otherPattern, [day]: 0 }, otherThroughput.rollingYieldRates);
                                          }
                                        } else if (act.type === "RealmCardAP" && val > 0) {
                                          const otherPattern = plannedWeeklyPatterns["RealmCardJade"];
                                          const otherThroughput = plannedThroughputs["RealmCardJade"];
                                          if (otherPattern && otherThroughput) {
                                            setPlannedWeeklyPattern("RealmCardJade", { ...otherPattern, [day]: 0 }, otherThroughput.rollingYieldRates);
                                          }
                                        }

                                        setPlannedWeeklyPattern(
                                          act.type, 
                                          { ...pattern, [day]: val }, 
                                          throughput.rollingYieldRates
                                        );
                                      }}
                                    />
                                  </td>
                                );
                              })}
                              <td className="py-3 px-4 text-right bg-[var(--surface-hover)]">
                                <span className="font-mono font-bold text-[var(--foreground)]">
                                  {throughput.averageRunsPerDay.toFixed(1)}
                                </span>
                                <span className="text-[10px] text-[var(--text-secondary)] ml-1 block">{category === "Grind" ? "runs/day" : "avg/day"}</span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}

                </div>
              </div>
            );
          })}
        </div>

        {/* Forecast Comparison */}
        <div className="space-y-4">
          <h2 className="font-display text-xl font-bold ink">Decision Support Sandbox</h2>
          <p className="text-sm text-secondary mb-4">Compare your Observed Reality against your Planned Simulation.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ForecastChart data={observedProjection} title="Current Forecast (Observed)" />
            <ForecastChart data={simulatedProjection} title="Simulated Forecast (Planned)" />
          </div>
        </div>
      </div>
    </div>
  );
}