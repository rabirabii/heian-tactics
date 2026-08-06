# Onmyoji Resource Planner Refinements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement refinements to improve code quality, accessibility, testing, and user experience in the Onmyoji Resource Planner Dashboard.

**Architecture:** Incremental improvements to existing codebase, adding unit tests, enhancing accessibility features, improving form handling with better validation and loading states, and adding error boundaries for robust error handling.

**Tech Stack:** Next.js 16 (App Router), TypeScript, Tailwind CSS, shadcn/ui, Zustand, React Hook Form, Zod, Recharts, Jest/Vitest for testing, @testing-library/react for component testing

---

### Task 1: Setup Testing Infrastructure

**Files:**
- Create: `vitest.config.ts`
- Create: `src/setupTests.ts`
- Modify: `package.json` (add test scripts and dependencies)

- [ ] **Step 1: Install testing dependencies**
```bash
npm install -D vitest @vitest/react @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```
Expected: Testing dependencies installed in devDependencies.

- [ ] **Step 2: Create vitest configuration**
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    globals: true,
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/app/',
        'src/lib/flagship/**',
        'src/middleware.ts',
        'src/types/next.d.ts',
      ],
    },
  },
});
```
Expected: Vitest configured for React testing with JS DOM environment.

- [ ] **Step 3: Create setupTests file**
```typescript
// src/setupTests.ts
import '@testing-library/jest-dom';

// Mock next/navigation for client components
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn(),
    beforePopState: jest.fn(),
  }),
  usePathname: () => '',
  useSearchParams: () => new URLSearchParams(),
}));
```
Expected: Test setup file that mocks Next.js navigation.

- [ ] **Step 4: Add test scripts to package.json**
```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```
Expected: Test scripts available in package.json.

- [ ] **Step 5: Commit testing setup**
```bash
git add vitest.config.ts src/setupTests.ts package.json
git commit -m "feat: set up Vitest testing infrastructure"
```

### Task 2: Add Unit Tests for Stores

**Files:**
- Create: `src/store/planner-store.test.ts`
- Create: `src/lib/forecast.test.ts`

- [ ] **Step 1: Write failing test for planner store resource updates**
```typescript
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { usePlannerStore } from '@/store/planner-store';
import type { ResourceType } from '@/types/planner';

describe('planner store', () => {
  beforeEach(() => {
    // Reset to initial state
    usePlannerStore.getState().resetDemoData();
  });

  it('should update resource amount correctly', () => {
    const initialAmount = usePlannerStore.getState().resources.blackDaruma.currentAmount;
    const newAmount = initialAmount + 50;

    usePlannerStore.getState().updateResource('blackDaruma', {
      currentAmount: newAmount,
    });

    expect(usePlannerStore.getState().resources.blackDaruma.currentAmount).toBe(newAmount);
  });

  it('should adjust resource with history tracking', () => {
    const initialAmount = usePlannerStore.getState().resources.blackDaruma.currentAmount;
    const change = 25;

    usePlannerStore.getState().adjustResource('blackDaruma', change, 'Test adjustment');

    const updatedResource = usePlannerStore.getState().resources.blackDaruma;
    expect(updatedResource.currentAmount).toBe(initialAmount + change);
    expect(updatedResource.history).toHaveLength(1);
    expect(updatedResource.history[0]).toMatchObject({
      change,
      note: 'Test adjustment',
    });
  });
});
```
Expected: Test should pass with the existing implementation.

- [ ] **Step 2: Run test to verify it passes**
```bash
npm run test src/store/planner-store.test.ts
```
Expected: PASS.

- [ ] **Step 3: Add forecast utility tests**
```typescript
// src/lib/forecast.test.ts
import { describe, expect, it } from 'vitest';
import { forecastProject, buildMonthlyProjection, summarizeAccount } from '@/lib/forecast';
import { initialResources, initialProjects } from '@/lib/planner-data';
import type { Project, ResourceType } from '@/types/planner';

describe('forecast utilities', () => {
  it('should calculate months to complete a project correctly', () => {
    const project: Project = {
      id: 'test-project',
      name: 'Test Project',
      description: 'A test project',
      priority: 'High',
      status: 'Planning',
      expectedCompletion: '2026-12-01',
      currentProgress: 0,
      requirements: {
        resources: {
          blackDaruma: 10,
          jade: 1000,
        },
        g6Count: 0,
        soulSet: '',
        minSpd: 0,
      },
      roiScore: 50,
      notes: '',
    };

    const resources: Record<ResourceType, any> = {
      blackDaruma: {
        type: 'blackDaruma',
        label: 'Black Daruma',
        currentAmount: 2, // Need 8 more
        monthlyIncome: 2, // Gains 2 per month
        manualAdjustment: 0,
        notes: '',
        history: [],
      },
      jade: {
        type: 'jade',
        label: 'Jade',
        currentAmount: 500, // Need 500 more
        monthlyIncome: 100, // Gains 100 per month
        manualAdjustment: 0,
        notes: '',
        history: [],
      },
      // Other resources with sufficient amounts...
    } as Record<ResourceType, any>;

    // Add other required resources with sufficient amounts
    const resourceOrder = [
      'blackDaruma',
      'blackDarumaShards',
      'jade',
      'ap',
      'coins',
      'realmRaidTickets',
      'exp',
      'souls',
      'eventCurrency',
    ];
    resourceOrder.forEach((type) => {
      if (!resources[type]) {
        resources[type] = {
          type,
          label: type,
          currentAmount: 999999, // More than enough
          monthlyIncome: 0,
          manualAdjustment: 0,
          notes: '',
          history: [],
        } as any;
      }
    });

    const forecast = forecastProject(project, resources);
    // Black Daruma: need 8, gain 2/month -> 4 months
    // Jade: need 500, gain 100/month -> 5 months
    // Should take 5 months (the maximum)
    expect(forecast.monthsToComplete).toBeCloseTo(5);
    expect(forecast.resourceProgress).toBeLessThan(100); // Not complete yet
  });

  it('should build monthly projection correctly', () => {
    const resources: Record<ResourceType, any> = {
      blackDaruma: {
        type: 'blackDaruma',
        label: 'Black Daruma',
        currentAmount: 10,
        monthlyIncome: 5,
        manualAdjustment: 0,
        notes: '',
        history: [],
      } as any,
      jade: {
        type: 'jade',
        label: 'Jade',
        currentAmount: 1000,
        monthlyIncome: 200,
        manualAdjustment: 0,
        notes: '',
        history: [],
      } as any,
      exp: {
        type: 'exp',
        label: 'EXP',
        currentAmount: 1000,
        monthlyIncome: 100,
        manualAdjustment: 0,
        notes: '',
        history: [],
      } as any,
    } as Record<ResourceType, any>;

    // Add missing resources
    const resourceOrder = [
      'blackDaruma',
      'blackDarumaShards',
      'jade',
      'ap',
      'coins',
      'realmRaidTickets',
      'exp',
      'souls',
      'eventCurrency',
    ];
    resourceOrder.forEach((type) => {
      if (!resources[type]) {
        resources[type] = {
          type,
          label: type,
          currentAmount: 0,
          monthlyIncome: 0,
          manualAdjustment: 0,
          notes: '',
          history: [],
        } as any;
      }
    });

    const projection = buildMonthlyProjection(resources, 3);
    expect(projection).toHaveLength(3);
    // Month 1: 10 + 5*1 = 15 BD, 1000 + 200*1 = 1200 Jade, 1000/50 + 100/50*1 = 20 + 2 = 22 G6
    expect(projection[0].blackDaruma).toBe(15);
    expect(projection[0].jade).toBe(1200);
    expect(projection[0].g6).toBe(22);
    
    // Month 2: 10 + 5*2 = 20 BD, 1000 + 200*2 = 1400 Jade, 1000/50 + 100/50*2 = 20 + 4 = 24 G6
    expect(projection[1].blackDaruma).toBe(20);
    expect(projection[1].jade).toBe(1400);
    expect(projection[1].g6).toBe(24);
  });

  it('should summarize account metrics correctly', () => {
    // Use initial data from planner-data
    const summary = summarizeAccount(initialResources, initialProjects);
    
    expect(summary.currentBlackDaruma).toBe(14); // From initialResources
    expect(summary.blackDarumaIncome).toBe(10); // From initialResources
    expect(summary.currentJade).toBe(8200); // From initialResources
    expect(summary.jadeIncome).toBe(4800); // From initialResources
    expect(summary.currentG6Count).toBe(1); // 74 exp / 50 = 1
    expect(summary.projectsCompleted).toBe(0); // No completed projects in initial data
    expect(summary.zenithReadyPercent).toBeGreaterThan(0); // Should have some readiness
  });
});
```
Expected: Test passes with existing forecast implementation.

- [ ] **Step 4: Commit store and forecast tests**
```bash
git add src/store/planner-store.test.ts src/lib/forecast.test.ts
git commit -m "feat: add unit tests for planner store and forecast utilities"
```

### Task 3: Add Loading & Error States

**Files:**
- Create: `src/components/ui/skeleton.tsx`
- Create: `src/components/ui/error-boundary.tsx`
- Modify: `src/features/dashboard/dashboard-shell.tsx` (add loading/error states)
- Modify: `src/store/planner-store.ts` (add loading states to actions)

- [ ] **Step 1: Create skeleton loader component**
```typescript
// src/components/ui/skeleton.tsx
import { useEffect, useState } from 'react';

interface SkeletonProps {
  className?: string;
  height?: number | string;
  width?: number | string;
  duration?: number;
  count?: number;
}

export function Skeleton({ 
  className = '', 
  height = 16, 
  width = '100%', 
  duration = 1500,
  count = 1
}: SkeletonProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setVisible(!visible);
    }, duration);
    
    return () => clearInterval(timer);
  }, [duration, visible]);

  return (
    <div className={className} style={{ visibility: visible ? 'visible' : 'hidden' }}>
      <div 
        className="animate-pulse"
        style={{ 
          height: typeof height === 'number' ? `${height}px` : height,
          width: typeof width === 'number' ? `${width}px` : width,
          backgroundColor: '#e5e7eb',
          borderRadius: '4px'
        }}
      />
    </div>
  );
}

// Grid skeleton for multiple items
export function SkeletonGrid({ 
  className = '', 
  cols = 3, 
  gap = 4,
  count = 6
}: { 
  className?: string; 
  cols?: number; 
  gap?: number; 
  count?: number 
}) {
  return (
    <div className={`${className} grid grid-cols-${cols} gap-${gap}`}>
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton key={index} height={120} width="100%" />
      ))}
    </div>
  );
}
```
Expected: Skeleton components for loading states.

- [ ] **Step 2: Create error boundary component**
```typescript
// src/components/ui/error-boundary.tsx
import { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  fallback: ReactNode;
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    // You could also log to an error reporting service here
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

// Simple error fallback component
export function ErrorFallback({ 
  error, 
  resetErrorBoundary 
}: { 
  error: Error; 
  resetErrorBoundary: () => void 
}) {
  return (
    <div className="p-6 text-center">
      <h2 className="text-2xl font-bold text-red-600 mb-4">
        Something went wrong
      </h2>
      <p className="text-red-500 mb-6">
        {error.message}
      </p>
      <button 
        onClick={resetErrorBoundary}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Try Again
      </button>
    </div>
  );
}
```
Expected: Error boundary component for catching and displaying errors gracefully.

- [ ] **Step 3: Add loading states to dashboard shell**
We'll modify the dashboard to show loading states while data is being fetched or processed.
Since the current implementation uses synchronous Zustand stores, we'll add simulated loading for demonstration:
```typescript
// In src/features/dashboard/dashboard-shell.tsx - modify the DashboardOverviewPage component

export function DashboardOverviewPage() {
  const [loading, setLoading] = useState(false);
  const resources = usePlannerStore((state) => state.resources);
  const projects = usePlannerStore((state) => state.projects);
  
  // Simulate loading effect for demonstration
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    setLoading(true);
    return () => clearTimeout(timer);
  }, [resources, projects]); // Re-run when data changes

  const summary = useMemo(() => summarizeAccount(resources, projects), [projects, resources]);
  const rankedProjects = useMemo(() => rankProjects(projects, resources), [projects, resources]);

  if (loading) {
    return (
      <>
        <PageHeader
          title="Dashboard"
          description="Account readiness, monthly forecast, and the next few build decisions."
        />
        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <SkeletonGrid cols={2} count={4} />
        </section>
        
        <section className="mt-4 grid min-h-0 gap-4 xl:grid-cols-[1.35fr_0.65fr]">
          <Skeleton height={120} width="100%" className="mb-4" />
          <SkeletonGrid cols={1} count={4} className="space-y-3" />
        </section>
      </>
    );
  }

  // Wrap content in error boundary
  return (
    <ErrorBoundary fallback={<ErrorFallback error={new Error("Failed to load dashboard")} resetErrorBoundary={() => window.location.reload()} />}>
      <>
        <PageHeader
          title="Dashboard"
          description="Account readiness, monthly forecast, and the next few build decisions."
        />
        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Current Black Daruma"
            value={formatNumber(summary.currentBlackDaruma)}
            detail={`${summary.blackDarumaIncome} BD/month`}
            icon={Target}
            accent="bg-violet-300"
          />
          {/* ... rest of existing code ... */}
        </section>
        
        <section className="mt-4 grid min-h-0 gap-4 xl:grid-cols-[1.35fr_0.65fr]">
          <MonthlyForecastCard />
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Upcoming Projects</CardTitle>
                <CardDescription>Top allocation candidates only.</CardDescription>
              </div>
              <BarChart3 size={18} className="text-zinc-400" />
            </CardHeader>
            <div className="space-y-3">
              {rankedProjects.slice(0, 4).map((forecast, index) => (
                {/* ... existing project cards ... */}
              ))}
            </div>
          </Card>
        </section>
      </>
    </ErrorBoundary>
  );
}
```
Expected: Loading skeletons shown briefly when data changes, error boundary for graceful error handling.

- [ ] **Step 4: Add loading states to Resources page**
```typescript
// In src/features/dashboard/dashboard-shell.tsx - ResourcesPage component
export function ResourcesPage() {
  const [loading, setLoading] = useState(false);
  const resources = usePlannerStore((state) => state.resources);
  const updateResource = usePlannerStore((state) => state.updateResource);
  
  // Simulate loading for resource updates
  const handleResourceUpdate = async (type: ResourceType, updates: Partial<Resource>) => {
    setLoading(true);
    try {
      // Simulate async delay
      await new Promise(resolve => setTimeout(resolve, 300));
      updateResource(type, updates);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <PageHeader
          title="Resources"
          description="Update current amounts, monthly income, adjustments, notes, and allocation mix."
        />
        <SkeletonGrid cols={2} count={3} className="mb-6" />
        <Skeleton height={400} className="w-full" />
      </>
    );
  }

  // Rest of existing ResourcesPage content with error boundary wrapper
  return (
    <ErrorBoundary fallback={<ErrorFallback error={new Error("Failed to load resources page")} resetErrorBoundary={() => window.location.reload()} />}>
      {/* Existing ResourcesPage content */}
    </ErrorBoundary>
  );
}
```
Expected: Loading states for resource updates and initial load.

- [ ] **Step 5: Add error boundaries to other major pages**
Apply similar error boundary wrapping to ProjectsPage, RosterPage, PlannerPage, and SettingsPage.

- [ ] **Step 6: Commit loading and error state implementations**
```bash
git add src/components/ui/skeleton.tsx src/components/ui/error-boundary.tsx src/features/dashboard/dashboard-shell.tsx
git commit -m "feat: add loading states and error boundaries for improved UX"
```

### Task 4: Enhance Accessibility

**Files:**
- Modify: `src/features/dashboard/dashboard-shell.tsx` (add ARIA labels, improve keyboard navigation)
- Modify: `src/components/ui/form.tsx` (enhance form accessibility)
- Create: `src/hooks/use-accessibility.ts` (custom hook for accessibility utilities)
- Modify: `src/app/globals.css` (add focus-visible styles)

- [ ] **Step 1: Create accessibility utilities hook**
```typescript
// src/hooks/use-accessibility.ts
import { useState, useEffect, useCallback } from 'react';

export function useAccessibility() {
  const [isScreenReaderActive, setIsScreenReaderActive] = useState(false);
  const [hasReducedMotion, setHasReducedMotion] = useState(false);

  useEffect(() => {
    // Check for screen reader presence
    const checkScreenReader = () => {
      // This is a heuristic - in practice, you might use a library or specific techniques
      setIsScreenReaderActive(
        navigator.maxTouchPoints > 0 || 
        (window as any).screenReaderState === 'enabled' ||
        false // Default to false for safety
      );
    };

    checkScreenReader();
    
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setHasReducedMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => {
      setHasReducedMotion(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Utility to announce live regions for screen readers
  const announce = useCallback((message: string) => {
    if (!isScreenReaderActive) return;
    
    const alertDiv = document.createElement('div');
    alertDiv.setAttribute('aria-live', 'polite');
    alertDiv.setAttribute('class', 'absolute -top-40 left-0 w-1 h-1 overflow-hidden');
    alertDiv.textContent = message;
    document.body.appendChild(alertDiv);
    
    // Clean up after announcement
    setTimeout(() => {
      alertDiv.remove();
    }, 2000);
  }, [isScreenReaderActive]);

  // Utility to manage focus trapping (for modals/dialogs)
  const trapFocus = useCallback((element: HTMLElement) => {
    const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const firstFocusableElement = element.querySelectorAll(focusableElements)[0] as HTMLElement;
    const focusableContent = element.querySelectorAll(focusableElements);
    const lastFocusableElement = focusableContent[focusableContent.length - 1] as HTMLElement;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftTab) { // shift + tab
          if (document.activeElement === firstFocusableElement) {
            e.preventDefault();
            lastFocusableElement.focus();
          }
        } else { // tab
          if (document.activeElement === lastFocusableElement) {
            e.preventDefault();
            firstFocusableElement.focus();
          }
        }
      }
      
      // Escape key to close modal (if applicable)
      if (e.key === 'Escape') {
        // This would be implemented based on specific modal implementation
      }
    };

    element.addEventListener('keydown', handleKeyDown);
    firstFocusableElement.focus();
    
    return () => {
      element.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return {
    isScreenReaderActive,
    hasReducedMotion,
    announce,
    trapFocus
  };
}
```
Expected: Custom hook for accessibility utilities including screen reader detection, announcement, and focus trapping.

- [ ] **Step 2: Improve form accessibility**
```typescript
// Modify existing form components in src/components/ui/form.tsx
// Add proper labels, error associations, and focus management

// Example enhancement to Input component:
export function Input({ 
  className = '', 
  id, 
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedby,
  ...props 
}: React.ComponentProps<'input'> & { 
  id?: string; 
  'aria-label'?: string; 
  'aria-describedby'?: string; 
}) {
  // Determine if we need to add error styling based on aria-describedby pointing to an error element
  const hasError = ariaDescribedby ? 
    !!document.getElementById(ariaDescribedby)?.classList.contains('text-destructive') : 
    false;

  return (
    <input
      type="text"
      id={id}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedby}
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:focus-visible:outline-none file:focus-visible:ring-2 file:focus-visible:ring-ring file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        hasError ? "border-destructive" : "",
        className
      )}
      {...props}
    />
  );
}

// Similar enhancements to Select, Textarea, etc.
```
Expected: Enhanced form components with proper ARIA attributes and error state handling.

- [ ] **Step 3: Improve dashboard accessibility**
```typescript
// In src/features/dashboard/dashboard-shell.tsx

// Add ARIA labels and live regions for dynamic content
function MetricCard({ 
  label, 
  value, 
  detail, 
  icon: Icon, 
  accent,
  'aria-live': ariaLive = 'off' // Default to off, can be set to polite for changing values
}: {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  accent: string;
  'aria-live'?: 'off' | 'polite' | 'assertive';
}) {
  return (
    <Card className="min-h-24">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-data text-xs font-semibold text-zinc-500">{label}</p>
          <p 
            className="font-data mt-2 text-3xl font-bold text-zinc-950"
            aria-live={ariaLive}
          >
            {value}
          </p>
          <p className="mt-1 text-xs text-zinc-500">{detail}</p>
        </div>
        <div className={cn("rounded-md p-2 text-zinc-950", accent)}>
          <Icon size={18} aria-hidden="true" />
        </div>
      </div>
    </Card>
  );
}

// Improve form accessibility in ResourceAdjustmentForm
function ResourceAdjustmentForm() {
  // ... existing code ...
  
  return (
    <form
      // ... existing props ...
      onSubmit={form.handleSubmit((values) => {
        adjustResource(values.type, values.change, values.note);
        // Announce successful adjustment for screen readers
        // In a real implementation, we'd use the useAccessibility hook
        form.reset({ ...values, change: 0 });
      })}
    >
      {/* ... existing form fields ... */}
      
      {/* Add live region for form submission status */}
      {form.isSubmitSuccessful && (
        <div 
          role="alert" 
          className="sr-only" 
          aria-live="polite"
        >
          Resource updated successfully
        </div>
      )}
      
      {/* Error messages already associated via Form component */}
    </form>
  );
}

// Improve keyboard navigation in ProjectBoard
function ProjectBoard() {
  const projects = usePlannerStore((state) => state.projects);
  const updateProjectStatus = usePlannerStore((state) => state.updateProjectStatus);
  
  // Handle keyboard shortcuts for common actions
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (e.target instanceof HTMLInputElement || 
          e.target instanceof HTMLTextAreaElement ||
          e.target instanceof HTMLSelectElement) {
        return;
      }
      
      switch (e.key) {
        case 'n':
        case 'N':
          // Focus new project form
          e.preventDefault();
          const newProjectNameInput = document.querySelector('#project-name') as HTMLInputElement;
          if (newProjectNameInput) {
            newProjectNameInput.focus();
          }
          break;
          
        // Add more shortcuts as needed
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [projects]);
  
  // ... rest of existing code ...
  
  // Ensure all interactive elements are accessible
  return (
    <div className="grid gap-3 xl:grid-cols-4">
      {/* ... existing code ... */}
      {projects
        .filter((project) => project.status === status)
        .map((project) => (
          <div 
            key={project.id} 
            className="rounded-lg border border-zinc-200 bg-zinc-50 p-3"
            tabindex={0} // Make card focusable
            role="region"
            aria-label={`${project.name}, ${project.status}, ${project.currentProgress}% complete`}
          >
            {/* ... existing card content ... */}
          </div>
        ))}
    </div>
  );
}
```
Expected: Improved accessibility with ARIA labels, live regions, keyboard navigation, and focus management.

- [ ] **Step 4: Add focus-visible styles to globals.css**
```css
/* src/app/globals.css */
@layer base {
  :focus-visible {
    outline: 2px solid hsl(var(--ring));
    outline-offset: 2px;
  }
  
  /* Ensure proper contrast for focus states */
  .focus-visible\:ring-ring {
    --tw-ring-color: hsl(var(--ring));
  }
}

/* Custom utility for screen reader only text */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```
Expected: Focus visible styles and screen reader only utility class.

- [ ] **Step 5: Commit accessibility improvements**
```bash
git add src/hooks/use-accessibility.ts src/components/ui/form.tsx src/features/dashboard/dashboard-shell.tsx src/app/globals.css
git commit -m "feat: enhance accessibility with ARIA labels, keyboard navigation, and screen reader support"
```

### Task 5: Improve Form Handling

**Files:**
- Modify: `src/features/dashboard/dashboard-shell.tsx` (enhance form validation and UX)
- Create: `src/hooks/use-form-utils.ts` (custom hook for form utilities)
- Modify: `src/lib/validator.ts` (if we create a centralized validator)

- [ ] **Step 1: Create form utilities hook**
```typescript
// src/hooks/use-form-utils.ts
import { useState, useCallback } from 'react';
import { UseFormReturn, UseFormHandleSubmit, UseFormReset } from 'react-hook-form';

export function useFormUtils<TFieldValues>() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  const handleSubmitWithLoading = useCallback((
    onValid: (data: TFieldValues) => Promise<void> | void,
    onInvalid: (errors: FieldErrors<TFieldValues>) => void
  ): UseFormHandleSubmit<TFieldValues> => {
    return async (data: TFieldValues) => {
      setIsSubmitting(true);
      setSubmitError(null);
      
      try {
        const result = await onValid(data);
        setSubmitSuccess(true);
        // Reset success state after a delay
        setTimeout(() => setSubmitSuccess(false), 3000);
        return result;
      } catch (error) {
        setSubmitError(error instanceof Error ? error.message : 'An unknown error occurred');
        throw error;
      } finally {
        setIsSubmitting(false);
      }
    };
  }, []);
  
  const resetFormWithFeedback = useCallback((
    reset: UseFormReset<TFieldValues>,
    values?: TFieldValues | undefined
  ) => {
    reset(values);
    setSubmitSuccess(false);
    setSubmitError(null);
  }, []);
  
  return {
    isSubmitting,
    submitSuccess,
    submitError,
    handleSubmitWithLoading,
    resetFormWithFeedback
  };
}
```
Expected: Custom hook for enhanced form handling with loading states and feedback.

- [ ] **Step 2: Enhance forms in dashboard shell**
```typescript
// Modify ResourceAdjustmentForm to use useFormUtils
function ResourceAdjustmentForm() {
  const adjustResource = usePlannerStore((state) => state.adjustResource);
  const { 
    handleSubmit: handleFormSubmit,
    isSubmitting,
    resetFormWithFeedback
  } = useFormUtils<ResourceAdjustmentInput>();
  
  const form = useForm<ResourceAdjustmentInput, unknown, ResourceAdjustmentValues>({
    resolver: zodResolver(resourceAdjustmentSchema),
    defaultValues: {
      type: "blackDaruma",
      change: 1,
      note: "Manual adjustment",
    },
  });

  return (
    <form
      onSubmit={handleFormSubmit(async (values) => {
        await adjustResource(values.type, values.change, values.note);
        // In a real app, we might show a toast or other feedback
        resetFormWithFeedback(form.reset);
      })}
    >
      {/* ... existing form fields ... */}
      
      <Button 
        className="self-end" 
        type="submit" 
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Spinner className="h-4 w-4 mr-2" />
            Applying...
          </>
        ) : (
          <>
            <Plus />
            Apply
          </>
        )}
      </Button>
      
      {/* Success/error feedback */}
      {form.isSubmitSuccessful && (
        <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md text-green-800">
          Resource updated successfully!
        </div>
      )}
      
      {form.submitError && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-800">
          {form.submitError}
        </div>
      )}
    </form>
  );
}

// Similar enhancements to NewProjectForm and SettingsForm
```
Expected: Enhanced forms with loading states, better feedback, and improved submission handling.

- [ ] **Step 3: Add form validation improvements**
```typescript
// Enhance validation schemas with better error messages
const resourceAdjustmentSchema = z.object({
  type: z.enum([
    "blackDaruma",
    "blackDarumaShards",
    "jade",
    "ap",
    "coins",
    "realmRaidTickets",
    "exp",
    "souls",
    "eventCurrency",
  ], {
    invalid_type_error: "Please select a resource type",
  }),
  change: z.coerce.number().finite({
    invalid_type_error: "Please enter a valid number",
  }).refine(
    (val) => val !== 0, 
    { message: "Adjustment must not be zero" }
  ),
  note: z.string().min(2, "Please add a brief note explaining this adjustment"),
});

const projectSchema = z.object({
  name: z.string().min(3, "Project name must be at least 3 characters"),
  description: z.string().min(3, "Description must be at least 3 characters"),
  priority: z.enum(["Low", "Medium", "High"]),
  blackDaruma: z.coerce.number().min(0, "BD required cannot be negative"),
  jade: z.coerce.number().min(0, "Jade required cannot be negative"),
  souls: z.coerce.number().min(0, "Souls required cannot be negative"),
  minSpd: z.coerce.number().min(0, "Minimum SPD cannot be negative"),
  soulSet: z.string().min(2, "Please specify a soul set"),
  expectedCompletion: z.string().min(1, "Expected completion date is required")
    .refine(
      (val) => !isNaN(Date.parse(val)),
      { message: "Please enter a valid date" }
    ),
  roiScore: z.coerce.number().min(1, "ROI score must be at least 1").max(100, "ROI score cannot exceed 100"),
  notes: z.string().optional(),
});

// Similar improvements to settingsSchema
```
Expected: Improved validation with clearer error messages.

- [ ] **Step 4: Commit form handling improvements**
```bash
git add src/hooks/use-form-utils.ts src/features/dashboard/dashboard-shell.tsx
git commit -m "feat: enhance form handling with loading states, better validation, and user feedback"
```

### Task 6: Commit Final Refinements

**Files:**
- Various files modified in previous tasks

- [ ] **Step 1: Run all tests to ensure nothing is broken**
```bash
npm run test
```
Expected: All tests pass.

- [ ] **Step 2: Run linting to ensure code quality**
```bash
npm run lint
```
Expected: No linting errors.

- [ ] **Step 3: Final commit**
```bash
git add .
git commit -m "feat: implement comprehensive refinements including testing, accessibility, loading states, error boundaries, and form handling improvements"
```