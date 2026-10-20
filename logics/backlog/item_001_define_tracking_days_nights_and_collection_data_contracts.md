## item_001_define_tracking_days_nights_and_collection_data_contracts - Define tracking days nights and collection data contracts
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
Confirmed temporal baseline: 04:00 Europe/Paris with manual reassignment and nominal night IDs, without actual sleep data. F3/F5/F7 resolve remaining field and edge-case semantics.

# Problem
- Midnight and ambiguous missing values can make future sleep comparisons incorrect.

# Scope
- In:
  - Use the confirmed 04:00 Europe/Paris tracking-day boundary and manual main-night reassignment; resolve F7 unusual nocturnal events.
  - Define tracking days, nominal nights, intake/session records, favorites, assessments, stable IDs, units and missingness; no manual sleep metrics are required.
  - Resolve F3/F5 granularity and assessed periods before finalizing related contracts; keep anticipated and experienced stress distinct.
- Out:
  - Garmin integration, correlations and production deployment.

# Acceptance criteria
- AC1: Document 00:30, 03:59, 04:00 and 08:00 mapping, DST/offset preservation and manual override without requiring bedtime or actual wake time.
- AC2: Define experienced/anticipated stress as distinct absent/medium/high fields with explicit assessed periods resolved in F5.
- AC3: Define unknown/none/not-applicable semantics, reusable favorite identity and migration-safe full-history export contracts.

# AC Traceability
- request-AC2 -> This backlog slice. Proof: Planned validation: Preserve actual timestamps and offsets alongside a tracking-day date and stable editable main-night association; apply a 04:00 local boundary in Europe/Paris, test midnight/boundary/DST/manual reassignment, and create nominal night IDs without requiring actual sleep metrics.
- request-AC5 -> This backlog slice. Proof: Planned validation: Capture dinner time only with independent alcohol/gluten answers and late sugar; preserve unknown versus explicit absence, and resolve F3 granularity and the fixed late threshold before implementing dependent validation.
- request-AC6 -> This backlog slice. Proof: Planned validation: Capture night cat presence, experienced and anticipated stress as separate absent/medium/high values, and a planned early-wake constraint; resolve F4/F5 period/time/reason detail and never substitute actual stress for an earlier anticipation.
- request-AC7 -> This backlog slice. Proof: Planned validation: Provide history with unrestricted past creation/correction and deletion, preserve repeated entries and explicit negative versus missing answers without a mandatory recap; keep the factor list fixed and resolve F6 before adding the requested note control near actions.
- request-AC8 -> This backlog slice. Proof: Planned validation: Export all history with complete collected entities and relationships, IDs, timezone/offset, original timestamps, units, missingness, tracking days, night links and distinct stress semantics; confirm versioned JSON and normalized CSV bundle in F7 and verify completeness using synthetic round-trip fixtures.
- request-AC9 -> This backlog slice. Proof: Planned validation: Keep Garmin imports/synchronization/credentials, correlations, health recommendations, manual sleep measurements and reminders outside the MVP; document future external Garmin joins using nominal night labels without inventing actual bedtime/wake time or Garmin values.

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
- Rationale: temporal identity and missingness are dependencies of every capture screen.
