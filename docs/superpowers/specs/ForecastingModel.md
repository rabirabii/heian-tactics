# Forecasting Model Specification

## Forecasting Philosophy
The Forecasting Engine is the core predictive component of the Decision Support System. Its purpose is not just to extrapolate current resource balances, but to simulate player behavior and its downstream effects on progression goals.

The fundamental principle is:
**Forecasting is Activity-Driven, not Inventory-Driven.**

The forecast flows sequentially:
**Player Activities** → **Production Pipeline** → **Resource Pools** → **Progression Systems** → **Forecast** → **Decision Support**

---

## Core Concepts

### 1. Historical Learning
The system should not rely on the user manually inputting fixed income values (e.g., "I get 4800 Jade a month"). Manual values serve only as cold-start defaults for brand new accounts.
- The engine continuously records player activities and their frequency over time.
- By analyzing this log, the system derives actual production throughput and individual player habits.
- **Example**: If the user runs Exploration 300 times a day for a week, the system learns the true yield of G2 fodders for that specific user, rather than relying on theoretical maximums.

### 2. Rolling Averages
To ensure forecasts remain accurate despite real-life fluctuations (vacations, intense farming weekends), historical learning utilizes rolling averages.
- Recent data is weighted more heavily or averaged over a standard time window (e.g., 7-day, 14-day, 30-day).
- This ensures the forecast engine adapts dynamically to the player's changing engagement levels.

### 3. Confidence Intervals
Because drops in Onmyoji are often RNG-based and player activity fluctuates, the forecasting engine should not present a single absolute date for completion without context.
- Forecasts should calculate a baseline projection (Expected) along with a confidence interval (Optimistic vs. Pessimistic).
- **Example**: "Expected Completion: Oct 14th (Optimistic: Oct 10th, Pessimistic: Oct 20th)."

### 4. Bottleneck Identification
The forecasting engine calculates completion dates for each independent progression pipeline within a Project. 
- By comparing the completion dates of these parallel tracks, the engine identifies the **bottleneck**—the resource or pipeline that is extending the overall project completion time.
- **Example**: If Grade Progression finishes in 10 days, but Skill Progression finishes in 30 days, Black Daruma is identified as the bottleneck.

### 5. What-If Simulations
Because the model is built on Player Activities, it natively supports "What-If" simulations. Players can modify activity assumptions to see their impact on the forecast.
- **Example Simulations**:
  - "What if I increase Exploration runs from 300/day to 600/day?"
  - "What if I purchase a G5 Daruma bundle?"
  - "What if I pause Soul Zone farming to focus entirely on EXP?"
- The forecast engine recalculates the entire pipeline downstream from the altered activity, providing actionable Decision Support.
