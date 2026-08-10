# Technical Architecture Specification

## Overview
This architecture exists to support the Domain Model. Every technical boundary and state separation is designed to directly reflect the concepts defined in the Domain Model Specification. The implementation will organically emerge from the domain rules, rather than the domain conforming to technical limitations.

## Technology Stack
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **State Management:** Zustand
- **Form Handling & Validation:** React Hook Form + Zod
- **Styling:** Tailwind CSS + shadcn/ui

## Folder Structure
The folder structure follows feature-based domain boundaries:

```
/src
  /app
    /(features)
      /dashboard       # High-level decision support metrics
      /activities      # Player activity logging & tracking
      /resources       # Current resource pool inventory
      /projects        # Project goal aggregation
      /forecast        # What-if simulations and bottleneck analysis
  /features
    /activities        # Activity logging, yield calculation UI
    /progression       # Grade & Skill pipeline logic and UI
    /projects          # Project management UI
    /forecast          # Forecasting charts, simulation sliders
  /store               # Domain-aligned Zustand stores
  /domain              # Pure TypeScript business rules and core domain logic
```

## State Management (Zustand)
State is separated to mirror the sequential flow of the Domain Model. By isolating these concerns, the forecasting engine can compose them without tight coupling.

### 1. `useActivityStore`
- **Domain Mapping:** Player Activities
- **Responsibility:** Records historical player actions over time. It stores logs of farming sessions, event completions, and purchasing behavior to feed the historical learning algorithms.

### 2. `useInventoryStore`
- **Domain Mapping:** Resource Pools
- **Responsibility:** Tracks the current state of intermediate and final resources.

### 3. `useProgressionStore`
- **Domain Mapping:** Progression Systems (Grade & Skill)
- **Responsibility:** Manages the deterministic rules of promotion (G2 -> G3, etc.) and tracks individual unit progress along the independent Grade and Skill tracks.

### 4. `useProjectStore`
- **Domain Mapping:** Projects
- **Responsibility:** Aggregates pipelines into user goals. It does not track raw resource requirements, but rather points to required completion states in the Progression systems.

## Domain Core Logic (`/src/domain`)
Because Business Rules (like deterministic grade progression) are global and immutable, they will be implemented as pure, framework-agnostic TypeScript functions inside `src/domain/`. 
- They will not be embedded directly inside React components or Zustand mutators.
- The `useProgressionStore` and forecasting components will import these pure functions to calculate transformations and calculate bounds.

## Forecasting Implementation Strategy
The Forecast Engine will sit atop the stores as a derivation layer.
- It will read from `useActivityStore` to calculate rolling averages.
- It will apply those averages through the pure functions in `/src/domain` to simulate the Production Pipeline.
- It will compare the simulated output against `useProjectStore` goals.
- To support "What-If" simulations, the Forecast Engine will accept a state override object (e.g., modifying the baseline activity rate), running the same pure domain functions against the hypothetical data without mutating the actual Zustand stores.

## Persistence
- State will be persisted locally (e.g., via LocalStorage) initially.
- The persistence layer must deeply merge states to support seamless schema migrations as the domain model grows to encompass more Onmyoji mechanics.
