# Preliminary Ideation Journal

## Audience exploration

Audiences considered:

1. Tactical/Military Athletes 
2. Recreational lifters aiming for recomposition
3. Beginner hybrid athletes
4. Post-injury return-to-play athletes

**Chosen audience:** Tactical/military athletes training for Special Operations or other similar programs.

---

## Ten needs identified for the chosen audience

1. One place to **log multi-modal training** (strength, run, ruck, swim).
2. Clear **progress visualization** over time by lift/run/swim with PR tracking.
3. **Macro tracking** that stays simple.
4. **Benchmarking vs standards** (e.g., PFA/IFT/ACFT times) and **peer cohort averages**.
5. **Program adherence & habit streaks** (attendance, Rate of Perceived Exertion, perceived fatigue).
6. **Recovery signals** (sleep hours, soreness check) without wearables required.
7. **Coach/mentor view** for teams (opt-in sharing, privacy controls).
8. **Data import** from **Strava** for runs/swims; manual entry for lifts/rucks.
9. **Offline/poor-signal logging** with later sync.
10. **OPSEC/privacy** guardrails (no auto geo-sharing; anonymous leaderboards).

---

## Three needs selected & mapped projects

* **Need A:** Multi-modal **progress visualization**
  → **Project 1:** Progress Graphs & Logbook

* **Need B:** **Benchmarking** vs standards + anonymized cohort stats
  → **Project 2:** Benchmarking & Insights Engine

* **Need C:** **Habit/compliance + recovery** signal capture
  → **Project 3:** Habit & Recovery Tracker

---

## Brainstormed goals/ideas per project

### Project 1 — Progress Graphs & Logbook

* Quick-add entries for lifts (weight×reps), runs (distance/time), swims (distance/intervals), rucks (load×distance).
* Interactive **charts**: load over time, pace trends, swim intervals, ruck paces.
* **PR badges** and plateaus detector (suggest deload or progression tweaks).
* Import from **Strava** for pace/elevation; manual override allowed.

### Project 2 — Benchmarking & Insights Engine

* Compare to **published standards** (PFA/IFT/ACFT) and **anonymized cohort averages**.
* “You’re on track for X goal by Y date” projections; **pace calculators**.
* Identify weak links (e.g., strong lifts, lagging 1.5-mile) with suggested micro-cycles.
* **Privacy:** only opt-in, geo stripped, rolling averages for shared stats.

### Project 3 — Habit & Recovery Tracker

* **Daily check-ins:** sleep hours, soreness (1–5), mood, RPE; **streaks**.
* **Macro targets** by goal (cut/maintain/gain) with simple daily totals.
* Green/amber/red readiness indicator; warns on overreaching trends.
* “Coach view” (optional) for POC/mentors: see trends, not exact locations/times.

---

## Winner of the process

**Winner:** Combine **Project 1 (Progress Graphs & Logbook)** + **Project 2 (Benchmarking & Insights)** as the MVP; layer **basic macro + daily check-ins** from Project 3.
\**Key integrations:** **Strava API** for endurance data; manual inputs for lifts/rucks.
**Why this wins:** Delivers immediate value (graphs + standards), differentiates with ROTC/tactical context, and stays feasible for a first release.
