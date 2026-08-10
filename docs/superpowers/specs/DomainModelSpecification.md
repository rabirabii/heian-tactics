# Domain Model Specification

## Vision & Purpose
This application is a **Decision Support System (DSS)** that helps players plan long-term account progression by modeling player behavior, production pipelines, resource generation, and progression systems. 

**This application is not an inventory tracker.** Inventory tracking is merely a means to answer strategic questions such as:
- Is my farming pace realistic?
- Which activity gives the highest ROI?
- Which project should receive my limited resources first?
- What is currently bottlenecking my account progression?

---

## 1. Domain Flow
The fundamental data model flows from player actions to final decision support:

**Player Activities** → **Production Pipeline** → **Resource Pools** → **Progression Systems** → **Forecast Engine** → **Decision Support**

Player-controlled variables are activities. Resources are merely outputs of activities. Forecasting should therefore be activity-driven rather than inventory-driven.

---

## 2. Core Concepts

### Player Activities
Activities are repeatable player actions that generate yield over time.
- **Examples**: Exploration, Soul Zone, Realm Raid, Demon Encounter, Events, Guild Activities.
- **Rule**: Activities are the root inputs of the system.

### Production Pipeline
Activities rarely generate usable progression resources directly; instead, they undergo transformations.
- **Example**: Exploration yields EXP, Coins, and Fodder. Those flow into "Leveling", which yields Usable G2 Fodders, which become Promotion Material.
- **Rule**: Intermediate processes (like leveling units) are transformations inside the production pipeline, not independent progression axes. The planner should forecast usable promotion materials rather than raw EXP.

### Resource Pools
Resources are outputs from activities and transformations.
- **Examples**: Jade, Coins, AP, Realm Raid Tickets, Souls, Promotion Materials, Black Daruma.
- **Rule**: The planner preserves the origination source of resources whenever possible to trace back bottlenecks to specific activities.

### Progression Systems
Progression consists of multiple **independent pipelines**.

#### Grade Progression
Responsible for advancing units from G2 → G3 → G4 → G5 → G6.
- **Characteristics**: Deterministic, based on promotion materials, ignores rarity.

#### Skill Progression
Responsible for advancing skill levels.
- **Characteristics**: Uses Black Daruma. Entirely independent of Grade Progression (a unit can be G6 with Lv1 skills, or max skilled while still G5).

### Projects
Projects represent player goals.
- **Characteristics**: Projects aggregate multiple progression requirements (Grade Progress, Skill Progress, Soul Build).
- **Rule**: Projects should not merely list required resources (e.g., "9 Black Daruma"), but track the completion of their underlying progression pipelines.

---

## 3. Business Rules
This section is the canonical source of game mechanics. These rules must never be duplicated or simplified elsewhere.

1. **Grade Progression is deterministic.**
   - G2 → G3 requires 2 G2 units.
   - G3 → G4 requires 3 G3 units.
   - G4 → G5 requires 4 G4 units.
   - G5 → G6 requires 5 G5 units.
2. **Grade progression depends only on current grade.** It does not depend on rarity (SP, SSR, SR, R are identical for grading purposes).
3. **Grade Progression and Skill Progression are independent.** They run on parallel tracks and do not block one another.
4. **Promotion materials are fungible.** As long as grade requirements are satisfied, any valid fodder can be consumed.
5. **Black Daruma belongs exclusively to Skill Progression.** It is never used for Grade Progression.
6. **EXP is an intermediate production resource**, not the final planning target. It must be modeled as a step toward generating usable promotion materials.

---

## 4. AI Implementation Rules
To ensure the Domain Model remains the single source of truth:

1. **Do not invent mechanics.** The AI agent must not hallucinate game rules, merge independent progression systems, or simplify the business rules outlined in Section 3 unless explicitly instructed.
2. **Domain > Implementation.** If technical implementation conflicts with the domain model, the implementation must be refactored. Do not modify the domain to accommodate a technical limitation.
3. **Ask for Clarification.** When game mechanics are uncertain or underspecified, the AI must explicitly ask the user for clarification rather than making assumptions.
4. **Traceability.** Every architectural decision must be traceable back to this Domain Model. If a technical decision cannot be justified by the domain, it must be reconsidered.
