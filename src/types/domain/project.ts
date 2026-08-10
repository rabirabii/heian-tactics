// Domain types for Projects
import { UnitProgression } from "./progression";

export type ProjectPriority = "Low" | "Medium" | "High";
export type ProjectStatus = "Planning" | "Building" | "Ready" | "Completed";

export interface DomainProject {
  id: string;
  name: string;
  description: string;
  priority: ProjectPriority;
  status: ProjectStatus;
  
  // A project represents a single unit's progression from current state to target state
  unitProgression: UnitProgression;
  
  // Expected completion is populated by the forecasting engine
  forecastedCompletionDate?: string; 
}
