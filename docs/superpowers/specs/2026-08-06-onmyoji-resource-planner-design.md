# Onmyoji Resource Planner Dashboard - Design Specification

**Date:** 2026-08-06  
**Phase:** 1 - Core Loop (Resources, Projects, Forecast, Dashboard)

## Overview
This document outlines the design for Phase 1 of the Onmyoji Resource Planner Dashboard, a personal planning tool for long-term resource allocation and forecasting in the Onmyoji game. Phase 1 focuses on implementing the core loop: resource tracking, project management, forecasting engine, and dashboard overview.

## Goals
- Enable users to track key resources (Black Daruma, Jade, AP, Coins, etc.)
- Allow creation and management of long-term build projects
- Provide forecasting based on current resources and income rates
- Display overall account progress via an intuitive dashboard
- Establish a foundation for future phases (Shikigami planning, soul builds, etc.)

## Architecture

### Technology Stack
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS with shadcn/ui components
- **State Management:** Zustand
- **Form Handling:** React Hook Form
- **Validation:** Zod
- **Charts:** Recharts
- **Data Storage:** LocalStorage (initial implementation, with Prisma/SQLite planned for future)

### Folder Structure (Feature-Based)
```
/app
  /(features)
    /dashboard
      page.tsx
      layout.tsx
      components/
        DashboardOverview.tsx
        MetricsCards.tsx
        ChartsContainer.tsx
    /resources
      page.tsx
      layout.tsx
      components/
        ResourceTable.tsx
        ResourceForm.tsx
        ResourceCard.tsx
    /projects
      page.tsx
      layout.tsx
      components/
        ProjectList.tsx
        ProjectForm.tsx
        ProjectCard.tsx
        ForecastTimeline.tsx
    /forecast
      page.tsx
      layout.tsx
      components/
        ForecastCalculator.tsx
        ProjectionChart.tsx
/shared
  /components
    ui/ (shadcn/ui components)
    Layout.tsx
    Header.tsx
  /hooks
    useResources.ts
    useProjects.ts
    useForecast.ts
  /lib
    utils.ts
    constants.ts
    storage.ts (localStorage wrapper)
  /store
    resources.ts
    projects.ts
    forecast.ts
    dashboard.ts
  /types
    resource.ts
    project.ts
    forecast.ts
    index.ts
  /validators
    resourceSchema.ts
    projectSchema.ts
```

## Components & Data Flow

### Resource Management
Each resource (Black Daruma, Jade, AP, Coins, etc.) will have:
- Current Amount (user-editable)
- Expected Monthly Income (configurable)
- Manual Adjustment field (for temporary boosts/drains)
- Notes field
- History log (changes over time)

**Data Flow:**
1. User updates resource value in ResourceForm
2. Form validates with Zod schema
3. Zustand store updates resource state
4. LocalStorage persists changes via useEffect hook
5. Dashboard and Forecast components re-render with updated data

### Project Management
Projects represent long-term goals (e.g., "Finish SP Susanoo") with:
- Name and Description
- Requirements (resources needed, G6 count, soul sets, SPD targets)
- Priority (Low/Medium/High)
- Expected Completion Date
- Current Progress (percentage)
- Status (Planning/Building/Ready/Completed)

**Data Flow:**
1. User creates/edits project in ProjectForm
2. Form validates requirements against current resources
3. Zustand store updates project list
4. Forecast engine recalculates completion estimates
5. Dashboard shows progress summary

### Forecast Engine
Automatically calculates:
- Estimated BD completion date for each project
- Estimated G6 completion timeline
- Monthly resource projections
- Opportunity cost analysis (given limited BD, what's optimal allocation)

**Algorithm:**
```
For each resource type:
  months_to_complete = (requirement - current_amount) / monthly_income
  completion_date = today + months_to_complete

For projects with multiple requirements:
  completion_date = max(requirement_completion_dates)
  progress_percentage = min(current_amount/requirement for each resource)
```

### Dashboard
Displays:
- **Metrics Row:** Current Black Daruma, Expected BD/month, Current Jade, Jade income/month
- **Progress Bars:** Meta Units Completed, Projects Completed, Estimated Zenith Ready %
- **Charts:** Monthly BD Forecast, Jade Trend, Resource Allocation pie chart
- **Upcoming Projects:** List sorted by priority and expected completion

## State Management (Zustand)
Separate stores for concerns:
- **resourcesStore:** Tracks all resource types with income rates and history
- **projectsStore:** Manages project list and progress calculations
- **forecastStore:** Handles forecasting calculations and projections
- **dashboardStore:** Computes summary metrics for dashboard display

Each store follows the pattern:
```typescript
interface State {
  // state properties
}
interface Actions {
  // mutator functions
}
const useStore = create<State & Actions>()((set, get) => ({
  // initial state
  // actions
}));
```

## Error Handling & Validation
- **Form Validation:** Zod schemas for resource and project forms
- **Error Boundaries:** React error boundaries around major components
- **Loading States:** Suspense and spinner components for async operations
- **Validation Feedback:** Real-time form validation with helpful error messages
- **Persistence Errors:** Fallback to memory state if localStorage fails, with user notification

## Testing Approach
- **Unit Tests:** Jest + React Testing Library for store logic and utilities
- **Integration Tests:** Testing Library for component interactions
- **E2E Tests:** Playwright for critical user flows (resource update → forecast change → project completion)
- **Test Coverage Goal:** 80%+ for core logic

## Styling & UI Principles
- **Dark Mode First:** Tailwind dark variant with system preference detection
- **Glassmorphism:** Background-blur effects on cards and panels using Tailwind
- **Responsive Design:** Mobile-first breakpoint approach
- **Accessibility:** ARIA labels, keyboard navigation, sufficient color contrast
- **Modern Enterprise Aesthetic:** Clean lines, subtle animations, information-dense but not cluttered

## Security Considerations
- **Data Privacy:** All data stored locally (localStorage/IndexedDB), no external transmission
- **Input Sanitization:** All user input validated and sanitized before storage
- **XSS Prevention:** Proper escaping in dynamic content rendering
- **CSRF:** Not applicable for local-first application

## Performance Considerations
- **Memoization:** React.memo and useMemo for expensive computations
- **Virtual Scrolling:** For large resource/project lists (future enhancement)
- **Debouncing:** Input fields to prevent excessive state updates
- **Lazy Loading:** Route-based code splitting for feature modules
- **Storage Efficiency:** Minimal localStorage usage, only essential data persisted

## Future Extension Points
Designed for Phase 2 and beyond:
- **Plugin System:** Exportable interfaces for adding new resource types
- **Multi-Game Support:** Abstracted game-specific logic in shared/lib
- **JSON Import/Export:** Storage adapter pattern already in place
- **Templates:** Pre-defined project templates accessible via store
- **Notifications:** Event-based system ready for web push integration

## Open Questions & Assumptions
1. **Storage Solution:** Starting with localStorage, planning migration to IndexedDB/Prisma when data complexity grows
2. **Resource Types:** Initial implementation includes core resources; extensible for game-specific currencies
3. **Forecast Accuracy:** Simple linear projection; can be enhanced with seasonal/event-based adjustments
4. **User Authentication:** Not required for Phase 1 (local-only); future phases may add cloud sync

---
*This design has been reviewed and approved for implementation. Next step: Create detailed implementation plan using writing-plans skill.*