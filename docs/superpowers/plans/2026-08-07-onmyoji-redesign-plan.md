# Onmyoji Resource Planner Neo‑Brutalist Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the DashboardShell and its child components to a monochrome neo‑brutalist style, introduce feature‑based routing, and implement a persistent vertical sidebar — all while preserving existing Zustand store logic and functionality.

**Architecture:** 
- Replace the single DashboardShell with separate pages under `/app/(planner)/`: `/dashboard`, `/resources`, `/projects`, `/roster`, `/planner`, `/settings`.
- Add a persistent vertical sidebar in `src/app/(planner)/layout.tsx` for navigation.
- Define CSS design tokens in `src/app/globals.css` and create utility classes for borders, shadows, fonts, colors, button/form tokens, etc.
- Refactor each component (MetricCard, ResourceAdjustmentForm, NewProjectForm, ResourceTable, ProjectBoard, SettingsForm, charts, etc.) to use the utility classes and adhere to the neo‑brutalist spec (2px black border, hard shadows, press effect, flat fills, etc.).
- No changes to Zustand stores or data flow; all existing functionality remains intact.

**Tech Stack:** Next.js 16 (App Router), TypeScript, Tailwind CSS (retained only for preflight reset), React Hook Form, Zod, Recharts, Zustand, CSS variables for design tokens.

---

### Task 1: Setup Design Tokens and Utility Classes

**Files:**
- Create/modify: `src/app/globals.css` (add :root tokens and utility classes)

- [ ] **Step 1: Define design tokens in :root**
```css
:root {
  --color-bg: #FFFFFF;
  --color-panel: #F4F4F5;
  --color-ink: #0A0A0A;
  --color-secondary: #71717A;
  --color-accent: #D6FF1F;
  --font-display: var(--font-display, system-ui, sans-serif);
  --font-data: var(--font-data, ui-monospace, monospace);
}
```
Expected: CSS variables available.

- [ ] **Step 2: Add utility classes**
```css
/* Layout & panels */
.panel-bg { background-color: var(--color-panel); }

/* Text */
.ink { color: var(--color-ink); }
.text-secondary { color: var(--color-secondary); }
.accent { color: var(--color-accent); }

/* Borders */
.border-2-black { border: 2px solid var(--color-ink); }

/* Radius */
.rounded-none { border-radius: 0; }
.rounded-sm { border-radius: 4px; }

/* Shadows – hard offset */
.shadow-hard { box-shadow: 4px 4px 0 0 var(--color-ink); }

/* Hover/Active press effect */
.hover-press:hover,
.hover-press:active {
  transform: translate(2px, 2px);
  box-shadow: 2px 2px 0 0 var(--color-ink);
}

/* Font roles */
.font-display { font-family: var(--font-display); font-weight: 900; }
.font-data { font-family: var(--font-data); font-variant-numeric: tabular-nums; }

/* Text sizes */
.text-xs { font-size: 0.75rem; line-height: 1rem; }
.text-sm { font-size: 0.875rem; line-height: 1.25rem; }
.text-base { font-size: 1rem; line-height: 1.5rem; }
.text-lg { font-size: 1.125rem; line-height: 1.75rem; }
.text-xl { font-size: 1.25rem; line-height: 1.75rem; }
.text-2xl { font-size: 1.5rem; line-height: 2rem; }
.text-3xl { font-size: 1.875rem; line-height: 2.25rem; }

/* Tracking & case */
.tracking-wide { letter-spacing: 0.05em; }
.uppercase { text-transform: uppercase; }

/* Icon size fix */
.icon-16 { width: 1rem; height: 1rem; } /* 16px */

/* Button baseline */
.btn-base {
  @apply border-2-black rounded-sm shadow-hard hover-press font-display text-sm px-4 py-2 h-10 gap-2 flex items-center justify-center;
}

/* Badge (black-bordered, text-only) */
.badge {
  @apply border-2-black rounded-none px-2 py-0.5 font-data text-xs ink;
}

/* Input baseline */
.input-base {
  @apply border-2-black rounded-sm shadow-hard font-data text-sm px-3 py-2 h-10;
}

/* Select baseline */
.select-base {
  @apply border-2-black rounded-sm shadow-hard font-data text-sm px-3 py-2 h-10;
}

/* Textarea baseline */
.textarea-base {
  @apply border-2-black rounded-sm shadow-hard font-data text-sm px-3 py-2 h-10;
}

/* Focus visible (accessibility) */
:focus-visible {
  outline: 2px solid var(--color-ink);
  outline-offset: 2px;
}
```
Expected: Utility classes ready to use.

- [ ] **Step 3: Commit token and utility setup**
```bash
git add src/app/globals.css
git commit -m "feat: add CSS design tokens and utility classes for neo‑brutalist system"
```

### Task 2: Create Layout with Persistent Vertical Sidebar

**Files:**
- Create: `src/app/(planner)/layout.tsx`
- Create: `src/components/sidebar.tsx` (optional, can be inline)
- Modify: `src/app/(planner)/dashboard/page.tsx` (will be created later, but ensure outlet works)

- [ ] **Step 1: Write layout file**
```tsx
// src/app/(planner)/layout.tsx
import { SidebarNav } from '@/components/sidebar';
import type { ReactNode } from 'react';

export default function PlannerLayout({
  children,
}: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[var(--color-bg)]">
      <SidebarNav className="flex-shrink-0" />
      <div className="flex-1 p-6">
        {/* Outlet for page components */}
        {children}
      </div>
    </div>
  );
}
```
Expected: Layout renders sidebar and outlet.

- [ ] **Step 2: Create sidebar component**
```tsx
// src/components/sidebar.tsx
import Link from 'next/link';
import { usePlannerStore } from '@/store/planner-store';

export function SidebarNav() {
  const { resetDemoData } = usePlannerStore();
  const routes = [
    { href: '/(planner)/dashboard', label: 'Dashboard' },
    { href: '/(planner)/resources', label: 'Resources' },
    { href: '/(planner)/projects', label: 'Projects' },
    { href: '/(planner)/roster', label: 'Roster' },
    { href: '/(planner)/planner', label: 'Planner' },
    { href: '/(planner)/settings', label: 'Settings' },
  ];

  return (
    <aside className="w-64 bg-[var(--color-panel)] border-r-[2px] border-[var(--color-ink)] p-4 space-y-2">
      <h2 className="font-display text-lg ink uppercase tracking-wide mb-4">
        Planner
      </h2>
      <nav className="space-y-1">
        {routes.map(({ href, label }) => (
          <Link key={href} href={href} className="flex w-full items-center px-3 py-2 text-sm font-data ink border-2-black rounded-none shadow-hard hover-press">
            {label}
          </Link>
        ))}
      </nav>
      <button
        onClick={resetDemoData}
        className="mt-auto w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-data ink border-2-black rounded-none shadow-hard hover-press"
      >
        <svg className="icon-16 ink" /* reset icon */>…</svg>
        Reset Demo
      </button>
    </aside>
  );
}
```
Expected: Sidebar with navigation links and reset demo button.

- [ ] **Step 3: Commit layout and sidebar**
```bash
git add src/app/(planner)/layout.tsx src/components/sidebar.tsx
git commit -m "feat: add persistent vertical sidebar layout"
```

### Task 3: Refactor Dashboard Page (`/dashboard`)

**Files:**
- Create: `src/app/(planner)/dashboard/page.tsx`
- Modify: `src/features/dashboard/dashboard-shell.tsx` (we will split its children into separate files or reuse with new class names)
- Create: `src/components/dashboard/MetricCard.tsx`
- Create: `src/components/dashboard/MonthlyForecastChart.tsx`
- Create: `src/components/dashboard/UpcomingProjects.tsx`
- Potentially reuse existing files but adjust className.

Given the existing code, we can copy the existing DashboardShell content into new components and adjust classNames.

But for brevity in the plan, we describe steps.

- [ ] **Step 1: Create MetricCard component with neo‑brutalist styling**
```tsx
// src/components/dashboard/MetricCard.tsx
import { BarChart3, CalendarDays, Gauge, Target, TrendingUp, Activity } from 'lucide-react';
import { formatNumber } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  accent?: boolean; // if true, use accent color for icon and maybe value highlight
}

export function MetricCard({
  label,
  value,
  detail,
  icon,
  accent = false,
}: MetricCardProps) {
  return (
    <div className="panel-bg border-2-black shadow-hard rounded-none p-4 hover-press">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="font-data text-xs uppercase tracking-wide text-secondary">
            {label}
          </p>
          <p className={`font-display font-bold text-2xl ink tabular-nums ${accent ? 'accent' : ''}`}>
            {value}
          </p>
          <p className="font-data text-xs text-secondary">{detail}</p>
        </div>
        <div className="flex-center">
          <icon className={`icon-16 ink ${accent ? 'accent' : ''}`} />
        </div>
      </div>
    </div>
  );
}
```
Expected: MetricCard uses token classes.

- [ ] **Step 2: Create MonthlyForecastChart component**
We’ll reuse existing chart code but adjust fills, strokes, tooltip.

- [ ] **Step 3: Create UpcomingProjects component (show top 3‑4)**
Each project card similar to MetricCard but with progress bar and priority badge.

- [ ] **Step 4: Assemble dashboard page**
```tsx
// src/app/(planner)/dashboard/page.tsx
import { DashboardOverviewPage } from '@/features/dashboard/dashboard-shell';
// We'll replace this with direct composition using new components.

```
But per spec we want to keep existing functionality; we can instead modify the existing dashboard-shell to use the new layout and classes, and then route to it.

Simpler: Keep `src/features/dashboard/dashboard-shell.tsx` but replace its content with the new design, and have the route point to it. We'll do that.

Thus:

- [ ] **Step 4: Replace src/features/dashboard/dashboard-shell.tsx with neo‑brutalist version using MetricCard, MonthlyForecastChart, UpcomingProjects, etc.**

- [ ] **Step 5: Update route to point to the same file (no change needed).**

- [ ] **Step 6: Commit dashboard refactor**
```bash
git add src/components/dashboard/MetricCard.tsx src/components/dashboard/MonthlyForecastChart.tsx src/components/dashboard/UpcomingProjects.tsx src/features/dashboard/dashboard-shell.tsx
git commit -m "feat: refactor dashboard page to neo‑brutalist with feature‑based route"
```

### Task 4: Refactor Resources Page

**Files:**
- Create: `src/app/(planner)/resources/page.tsx`
- Update: `src/features/dashboard/dashboard-shell.tsx` ResourcesPage section OR create new component file.

Given that the existing dashboard-shell contains ResourcesPage, we can extract it.

We'll create a new folder `src/components/resources/` and move the logic there.

- [ ] **Step 1: Create ResourceAdjustmentForm component using .input-base, .select-base, .btn-base**

- [ ] **Step 2: Create ResourceTable component with .panel-bg, .border-2-black, etc.**

- [ ] **Step 3: Create ResourceAllocationCard (pie chart) similar to MonthlyForecastChart but for allocation**

- [ ] **Step 4: Assemble ResourcesPage**

- [ ] **Step 5: Commit resources refactor**

### Task 5: Refactor Projects Page

**Files:**
- Create: `src/app/(planner)/projects/page.tsx`
- Components: ProjectBoard, NewProjectForm, etc., using token classes.

### Task 6: Refactor Roster Page

**Files:**
- Create: `src/app/(planner)/roster/page.tsx`
- Component: Shigigami cards, soul presets, etc.

### Task 7: Refactor Planner Page

**Files:**
- Create: `src/app/(planner)/planner/page.tsx`
- Components: MonthlyPlanner, FarmingTracker.

### Task 8: Refactor Settings Page

**Files:**
- Create: `src/app/(planner)/settings/page.tsx`
- Components: Statistics cards, SettingsForm.

### Task 9: Update Charts to Neo‑Brutalist Spec

Across all chart usages (MonthlyForecastChart, ResourceAllocationChart, FarmingTracker bar chart, etc.):

- Replace gradient fills with flat solid fills: e.g., `fill: "rgba(214,255,31,0.4)"` (accent at ~40% opacity) or other colors with opacity.
- Strokes: `stroke: "var(--color-accent)"` or `var(--color-ink)` etc.
- Axis and grid: `stroke: "var(--color-ink)"`, `strokeOpacity: 0.15`, optionally dashed.
- Tooltip: custom container with `background: var(--color-bg)`, `border: 2px solid var(--color-ink)`, `border-radius: 0`, `box-shadow: 4px 4px 0 0 var(--color-ink)`.

We'll create a reusable `ChartTooltip` component.

- [ ] **Step 1: Create src/components/ui/ChartTooltip.tsx**

- [ ] **Step 2: Update each chart to use the tooltip and flat fills.**

- [ ] **Step 3: Commit chart updates**

### Task 10: Apply Button & Form Token System

Verify every button uses `.btn-base` (or `.btn-base .accent` for primary) and has correct height, padding, gap, icon size.

- [ ] **Step 1: Audit all buttons in the codebase and adjust className accordingly.**

- [ ] **Step 2: Ensure icons inside buttons are `.icon-16`.**

- [ ] **Step 3: Commit button fixes**

### Task 11: Apply Typography Roles

- Ensure headings use `.font-display` (and appropriate size like `text-2xl`, `text-lg`, etc.)
- Ensure metric numbers, table values, labels use `.font-data`.
- Update any places where uppercase/tracking is applied incorrectly.

- [ ] **Step 1: Scan components for text classes and adjust to use `.font-display` / `.font-data` as per spec.**

- [ ] **Step 2: Commit typography updates**

### Task 12: Remove Forbidden Styles

- Remove any `backdrop-blur` (e.g., in sticky header if present).
- Remove gradient fills (already addressed).
- Remove pastel badge variants; replace with `.badge`.
- Remove rounded-icon chips; replace with black-bordered square icon container.
- Replace soft 1px zinc borders with `.border-2-black`.

- [ ] **Step 1: Do a global search for `backdrop-blur`, `gradient`, `bg-emerald`, `bg-amber`, `bg-rose`, `rounded-full`, `border-zinc-200`, etc., and replace per spec.**

- [ ] **Step 2: Commit cleanup**

### Task 13: Final QA and Tests

- [ ] **Step 1: Run existing unit tests to ensure no regression (`npm run test`).**

- [ ] **Step 2: Manual verification of each route for visual fidelity and interaction (hover press, navigation, form submission).**

- [ ] **Step 3: Run linter (`npm run lint`) and fix any issues.**

- [ ] **Step 4: Final commit**
```bash
git add .
git commit -m "feat: complete neo‑brutalist redesign with feature‑based routing and vertical sidebar"
```

---