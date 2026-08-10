Onmyoji Resource Planner Dashboard v2
Domain Vision & Core Principles
Purpose

The application is not an inventory tracker.

The application is a Decision Support System (DSS) that helps players plan long-term account progression by modeling player behavior, production pipelines, resource generation, and progression systems.

The planner should answer questions such as:

Is my farming pace realistic?
Which activity gives the highest ROI?
If I increase Exploration from 300 to 600 runs/day, how much sooner will my next G6 be completed?
Which project should receive my limited resources first?
What is currently bottlenecking my account progression?

Inventory tracking is only a means to answer those questions.

Core Philosophy

The application models player behavior, not merely inventory.

The domain flow is:

Player Activities
│
▼
Production Pipeline
│
▼
Resource Pools
│
▼
Progression Systems
│
▼
Forecast Engine
│
▼
Decision Support

Player-controlled variables are activities.

Resources are merely outputs of activities.

Forecasting should therefore be activity-driven rather than inventory-driven.

Domain Model
Activities

Activities are repeatable player actions.

Examples:

Exploration
Soul Zone
Realm Raid
Demon Encounter
Events
Guild Activities

Activities produce resources.

Production Pipeline

Activities rarely generate usable progression resources directly.

Example:

Exploration

↓

EXP
Coins
Evolution Materials
Fodder

↓

Leveling

↓

Usable G2 Fodders

↓

Promotion Material

Leveling is not considered a progression axis.

It is merely a transformation process inside the production pipeline.

The planner should forecast usable promotion materials rather than raw EXP.

Resource Pools

Resources are outputs from activities.

Examples:

Jade
Coins
AP
Realm Raid Tickets
Souls
Promotion Materials
Black Daruma
etc.

Resources may originate from different activities.

The planner should preserve where resources originate whenever possible.

Progression Systems

Progression consists of multiple independent pipelines.

Grade Progression

Responsible for:

G2 → G3 → G4 → G5 → G6

Characteristics:

Deterministic
Same rules for every rarity
Based on promotion materials
Independent from skill progression

Business Rule:

G2 → G3 = 2 G2

G3 → G4 = 3 G3

G4 → G5 = 4 G4

G5 → G6 = 5 G5

This rule is global.

It should not be duplicated inside every Shikigami.

Skill Progression

Responsible for:

Skill Level progression.

Characteristics:

Independent from Grade.
Uses Black Daruma.
May complete before Grade.
May complete after Grade.

Valid examples:

✓ G6 with all skills Lv1

✓ Skill Max while still G5

Projects

Projects represent player goals.

Projects should aggregate multiple progression requirements.

Example:

SP Susanoo

Requirements

- Grade Progress
- Skill Progress
- Soul Build

Projects should not merely list required resources.

Forecast Engine

Forecasting should not rely solely on

Current Resource

-

Monthly Income

Instead it should model

Activity

↓

Yield

↓

Transformation

↓

Progression

↓

Forecast

The engine should support simulations.

Examples:

What if Exploration increases to 600/day?
What if Realm Raid decreases?
What if player buys G5 Daruma?
What if player pauses Soul farming?
Historical Learning

The application should gradually learn player behavior.

Rather than asking users to manually maintain every production rate, the planner should derive production throughput from historical activity.

Example:

Last 14 Days

Average Exploration

↓

Average G2 Production

↓

Forecast

Manual values should only exist as cold-start defaults.

Historical observations become the primary forecast source once enough data is available.

Business Rules

Examples:

Grade promotion depends only on current grade.
Grade promotion does not depend on rarity.
Grade progression and skill progression are independent.
Promotion materials are fungible as long as grade requirements are satisfied.
Black Daruma belongs exclusively to Skill Progression.
EXP is an intermediate production resource, not the final planning target.
Decision Support

The application should answer questions instead of only displaying numbers.

Examples:

✓ Which project has the highest ROI?

✓ Which activity should I farm today?

✓ What is my current bottleneck?

✓ Can I finish another G6 before the next event?

✓ What activity increases my completion speed the most?

Design Principle

Whenever implementation decisions conflict with domain accuracy:

Domain accuracy wins.

Schema, TypeScript interfaces, stores, and database structures should emerge from the domain model—not the other way around.
