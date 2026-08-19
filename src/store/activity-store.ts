"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { ActivityType, ActivityLog, ActivityThroughput, ActivityYieldRates, WeeklyActivityPattern } from "@/types/domain/activity";

interface ActivityStore {
  logs: ActivityLog[];
  
  // Observed Reality: Derived from actual logs (or manually set baseline)
  observedThroughputs: Record<ActivityType, ActivityThroughput>;
  
  // Planned Simulation: User overrides for forecasting
  plannedThroughputs: Record<ActivityType, ActivityThroughput>;

  // Planned Simulation Pattern: The day-by-day breakdown of the planned throughput
  plannedWeeklyPatterns: Record<ActivityType, WeeklyActivityPattern>;

  logActivity: (activityType: ActivityType, runCount: number) => void;
  
  setObservedThroughput: (activityType: ActivityType, averageRunsPerDay: number, rates: ActivityYieldRates) => void;
  setPlannedThroughput: (activityType: ActivityType, averageRunsPerDay: number, rates: ActivityYieldRates) => void;
  setPlannedWeeklyPattern: (activityType: ActivityType, pattern: WeeklyActivityPattern, rates: ActivityYieldRates) => void;
  
  // Helper to get the active throughput for simulations
  getActiveThroughput: (activityType: ActivityType, useSimulation: boolean) => ActivityThroughput;
}

import { defaultActivityRates } from "@/domain/activity-rates";

const defaultRates = defaultActivityRates;

const defaultThroughputs = Object.fromEntries(
  (Object.keys(defaultRates) as ActivityType[]).map((type) => [
    type,
    { activityType: type, averageRunsPerDay: 0, rollingYieldRates: defaultRates[type] },
  ])
) as Record<ActivityType, ActivityThroughput>;

const defaultPatterns = Object.fromEntries(
  (Object.keys(defaultRates) as ActivityType[]).map((type) => [
    type,
    { mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0 },
  ])
) as Record<ActivityType, WeeklyActivityPattern>;

export const useActivityStore = create<ActivityStore>()(
  persist(
    (set, get) => ({
      logs: [],
      observedThroughputs: { ...defaultThroughputs },
      plannedThroughputs: { ...defaultThroughputs },
      plannedWeeklyPatterns: { ...defaultPatterns },
      
      logActivity: (activityType, runCount) =>
        set((state) => ({
          logs: [
            ...state.logs,
            {
              id: `${activityType}-${Date.now()}`,
              activityType,
              runCount,
              date: new Date().toISOString(),
            },
          ],
        })),
        
      setObservedThroughput: (activityType, averageRunsPerDay, rates) =>
        set((state) => ({
          observedThroughputs: {
            ...state.observedThroughputs,
            [activityType]: {
              activityType,
              averageRunsPerDay,
              rollingYieldRates: rates,
            },
          },
        })),
        
      setPlannedThroughput: (activityType, averageRunsPerDay, rates) =>
        set((state) => ({
          plannedThroughputs: {
            ...state.plannedThroughputs,
            [activityType]: {
              activityType,
              averageRunsPerDay,
              rollingYieldRates: rates,
            },
          },
        })),

      setPlannedWeeklyPattern: (activityType, pattern, rates) =>
        set((state) => {
          const sum = pattern.mon + pattern.tue + pattern.wed + pattern.thu + pattern.fri + pattern.sat + pattern.sun;
          const averageRunsPerDay = sum / 7;
          
          return {
            plannedWeeklyPatterns: {
              ...state.plannedWeeklyPatterns,
              [activityType]: pattern,
            },
            plannedThroughputs: {
              ...state.plannedThroughputs,
              [activityType]: {
                activityType,
                averageRunsPerDay,
                rollingYieldRates: rates,
              }
            }
          };
        }),

      getActiveThroughput: (activityType, useSimulation) => {
        const state = get();
        return useSimulation 
          ? state.plannedThroughputs[activityType] 
          : state.observedThroughputs[activityType];
      }
    }),
    {
      name: "domain-activity-store",
      storage: createJSONStorage(() => localStorage),
      merge: (persistedState: any, currentState) => {
        const mergedState = { ...currentState, ...persistedState };
        
        if (persistedState?.throughputs) {
          // Migration from very old flat throughputs
          mergedState.logs = persistedState.logs || currentState.logs;
          mergedState.observedThroughputs = { ...currentState.observedThroughputs, ...persistedState.throughputs };
          mergedState.plannedThroughputs = { ...currentState.plannedThroughputs, ...persistedState.throughputs };
        }
        
        // Migration to populate plannedWeeklyPatterns if missing
        if (!persistedState?.plannedWeeklyPatterns && mergedState.plannedThroughputs) {
          const populatedPatterns: Record<string, WeeklyActivityPattern> = {};
          for (const type of Object.keys(mergedState.plannedThroughputs)) {
            const avg = mergedState.plannedThroughputs[type as ActivityType].averageRunsPerDay;
            // Distribute evenly for backwards compatibility
            populatedPatterns[type] = {
              mon: avg, tue: avg, wed: avg, thu: avg, fri: avg, sat: avg, sun: avg
            };
          }
          mergedState.plannedWeeklyPatterns = populatedPatterns as Record<ActivityType, WeeklyActivityPattern>;
        }

        return mergedState;
      }
    }
  )
);
