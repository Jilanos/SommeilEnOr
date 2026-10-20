## item_004_collect_meal_night_context_and_daily_assessments - Collect meal night context and daily assessments
> From version: 1.0.0
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Medium
> Theme: Collection MVP
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.
> Indicators reviewed: 2026-10-20 13:00:24

# AI Context
Meal and night answers must preserve unknown versus explicit absence. Stress periods and planned versus actual early waking remain product questions.

# Problem
- Meal and night context needs clear granularity and meaningful unanswered states.

# Scope
- In:
  - Resolve meal granularity, sugar threshold, cat context, stress periods and early-wake fields (questions 9–16).
  - Capture meal times, alcohol/gluten, late sugar, night cat presence and stress assessments.
  - Separate planned early wake constraints from observed awakenings if both are selected.
  - Optional subjective sleep fields only after confirmation.
- Out:
  - Garmin integration, correlations and production deployment.

# Acceptance criteria
- AC1: Save and edit all requested factors while distinguishing unanswered values from explicit negative answers.
- AC2: Display the exact assessed day or period for each stress answer on both sides of a night, with no contradictory duplicates.
- AC3: Verify early-wake and late-sugar exports preserve the confirmed meaning, including time and reason where selected.

# AC Traceability
- request-AC5 -> This backlog slice. Proof: AC1: Save and edit all requested factors while distinguishing unanswered values from explicit negative answers.
- request-AC6 -> This backlog slice. Proof: AC2: Display the exact assessed day or period for each stress answer on both sides of a night, with no contradictory duplicates.
- request-AC7 -> This backlog slice. Proof: AC3: Verify early-wake and late-sugar exports preserve the confirmed meaning, including time and reason where selected.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_001_sommeilenor_personal_sleep_context_journal`
- Architecture decision(s): (none yet)
- Request: `req_000_sommeilenor_collection_only_pwa_mvp`
- Primary task(s): `task_001_orchestrate_sommeilenor_collection_mvp_delivery`

# Priority
- Priority: High
- Rationale: complete the requested factor set after shared capture patterns exist.
