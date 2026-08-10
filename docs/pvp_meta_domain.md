# PvP Meta Domain & Backlog

This document serves as a living repository of domain knowledge and feature backlog based on feedback from experienced competitive players (guild mates). 

*Note: These are domain feedback and backlog candidates, not finalized requirements. We will avoid overengineering the taxonomy until more community feedback is collected.*

---

## 1. Meta Evaluation Criteria
To determine how "meta" a Shikigami or lineup is in PvP, the priorities are:
1. **Flexibility (Top Priority)**: Can fit into many lineup types, safe for various drafts, viable as a first pick in blind matches (e.g., Kuzunoha).
2. **Counter Resistance**: How difficult the Shikigami/lineup is to counter. Fewer hard counters = stronger meta position.
3. **Draft Impact**: The pressure applied during the draft phase.
4. **Win Rate (Secondary/Supporting)**: Heavily skewed by soul quality, draft quality, and pilot skill (e.g., SPD 130 vs SPD 160 yields vastly different outcomes).

*Implication*: Tier lists should NOT be based purely on win rates. Ratings should be multi-dimensional (Radar/Bar charts).

---

## 2. PvP Categorization
PvP game modes require distinct categorizations due to different strategic focuses:
- **Celeb Duel (Ban/Pick, Blind Match)**: You cannot see who you are fighting or their comfort drafts. Bans might be deceptive (not reflecting their actual lineup). Focuses heavily on flexibility, draft safety, and unpredictability.
- **Under Celeb Duel (No Ban, Visible Draft)**: No Ban/Pick phase. You can see the opponent's frequently used lineups before drafting. Focuses heavily on direct counterability.
- **Raid / PvE-like Modes (e.g., Realm Raid)**: Focuses on speed, consistency, auto-compatibility, and efficiency against static AI defenses.

---

## 3. Shikigami Taxonomy & Roles

### Multi-Role Support
Shikigami should not be forced into a single role. A high-SPD CC (like Enma) can perform multiple functions.
- Roles should represent **what the Shikigami actually contributes** rather than just a skill classification.

### Speed Profiles within Roles (e.g., Fast CC vs Slow CC)
Speed requirements drastically change a unit's archetype.
- **Fast CC**: Runs extremely fast/broken sets to act early.
- **Slow CC**: Operates at lower SPD (e.g., 210 SPD Enma) for a different turn-order function.
- *Design Note*: Distinguish between the **functional archetype** (Speed Profile: Fast/Mid/Slow) and the **actual stat requirement** (Recommended SPD: 260+).

### The "Puller" Definition
Needs clarification: Does "Puller" mean Action Bar pushers exclusively, or broadly any "Turn Enabler" (including extra turns like Maestro/Himiko)?

---

## 4. Meta Lineups (Core vs Flex)
Lineups are not strictly 5 fixed Shikigami. They follow a Core + Flex structure:
- **Core Slots (1-3)**: The foundational strategy.
- **Flex Slots (4-5)**: Adaptable picks depending on opponent composition, ban/pick, and matchup.
*(Note: We have already implemented visual "FLEX" slots in the Lineup Builder to support this).*

---

## 5. Matchup & Draft Decision Support (What-If Scenarios)
Future extension of the Lineup Builder to provide draft decision support:
- **Good Against**: Lineups/Metas it counters.
- **Countered By**: Lineups/Metas/Shikigami that break it.
- **What-if Scenarios**: E.g., "If VS Meta B → Draft X in Slot 4".

---

## 6. Data Maintenance & Community Model
- **Trusted Curators**: Admins and trusted contributors maintain curated knowledge.
- **Versioning**: When meta changes, create new versions of lineups rather than overwriting. Old lineups become "Outdated/Historical".
- **Reference Material**: Use existing CN guides/tier lists as taxonomy references (not 1:1 copies) to identify missing useful categories.

---

## Recommended Backlog Priority

### 🔴 High Priority
- Support multi-role Shikigami tagging.
- Formalize Core vs Flex lineup slots in the database.
- Define Fast / Mid / Slow CC taxonomy.
- Add configurable Shikigami requirements (Souls, SPD, Effect HIT).
- Add lineup lifecycle status (Current, Outdated, Historical).

### 🟡 Medium Priority
- Matchup metadata (Good Against / Countered By).
- What-if draft scenarios.
- Multi-dimensional rating fields (Blind Pick viability, Draft Impact, Flexibility, Counter Resistance).
- Research existing CN/translated categorization.

### 🟢 Later / Experimental
- Meta visualization (Radar/Comparative charts).
- Community-submitted theorycraft (Public/Private sharing).
- Promotion of community theorycraft into curated meta knowledge.
