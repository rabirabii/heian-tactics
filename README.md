# Onmyoji Resource Planner

A local-first planning dashboard for long-term resource allocation and roster forecasting in Onmyoji.

The app is not a wiki or game database. It is a personal decision tool for answering:

- What should I build next?
- How many resources do I need?
- Is my current farming pace realistic?
- When will I complete my PvP roster?
- Which project gives the highest ROI?

## Stack

- Next.js 16 App Router
- TypeScript
- Tailwind CSS
- shadcn-style UI primitives
- Zustand persistence
- React Hook Form
- Zod
- Recharts
- Lucide icons

## Run

```bash
npm run dev
```

Open `http://localhost:3000`.

## Validate

```bash
npm run lint
npm run build
```

## Current Scope

- Dashboard metrics and readiness score
- Resource management with amounts, income, adjustments, notes, and history
- Project kanban with priority, progress, ROI, ETA, and opportunity cost
- Forecast engine for monthly Black Daruma, Jade, and G6-equivalent projection
- Allocation planner ranked by priority, ROI, affordability, and completion time
- Shikigami planner with multiple soul presets per unit
- Monthly goals, farming tracker, statistics, and forecast settings

Data is persisted in browser localStorage under `onmyoji-resource-planner`.
