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
> Indicators reviewed: 2026-10-20 14:10:12

# AI Context
Dinner time, separate non-caffeinated context, three-level experienced/anticipated stress and planned early waking are confirmed. Resolve F3-F6 details without adding manual sleep metrics.

# Problem
- Meal and night context needs clear granularity and meaningful unanswered states.

# Scope
- In:
  - Dinner time only, independently editable alcohol/gluten and late sugar; resolve F3 granularity and threshold.
  - Night cat presence and distinct experienced/anticipated absent/medium/high stress; resolve F4/F5 exact detail.
  - Planned early-wake constraint only; resolve target time and reason in F5.
  - Fixed initial factors; resolve F6 note-control meaning before implementing that control.
- Out:
  - Garmin integration, correlations and production deployment.
  - Manual sleep metrics, actual early-wake measurements, reminders and generic custom factors.

# Acceptance criteria
- AC1: Save dinner time independently of alcohol/gluten/sugar, cat presence and planned early-wake context; distinguish unanswered from explicit absence.
- AC2: Preserve separate experienced and anticipated stress at absent/medium/high with explicit assessed periods; editing actual stress does not overwrite anticipation.
- AC3: Export the agreed planned early-wake and late-sugar meaning; after F6 is answered, verify the requested note control and its data semantics.

# AC Traceability
- request-AC5 -> This backlog slice. Proof: Planned validation: Capture dinner time only with independent alcohol/gluten answers and late sugar; preserve unknown versus explicit absence, and resolve F3 granularity and the fixed late threshold before implementing dependent validation.
- request-AC6 -> This backlog slice. Proof: Planned validation: Capture night cat presence, experienced and anticipated stress as separate absent/medium/high values, and a planned early-wake constraint; resolve F4/F5 period/time/reason detail and never substitute actual stress for an earlier anticipation.
- request-AC7 -> This backlog slice. Proof: Planned validation: Provide history with unrestricted past creation/correction and deletion, preserve repeated entries and explicit negative versus missing answers without a mandatory recap; keep the factor list fixed and resolve F6 before adding the requested note control near actions.

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
