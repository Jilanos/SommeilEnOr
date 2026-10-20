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
> Indicators reviewed: 2026-10-20 13:00:34

# AI Context
Temporal foundation: retain calendar timestamps, tracking dates and editable main-night IDs separately. Midnight defaults and stress period definitions are still awaiting user decisions.

# Problem
- Midnight and ambiguous missing values can make future sleep comparisons incorrect.

# Scope
- In:
  - Resolve questions 4, 5, 9, 10, 14 and 15 in docs/mvp-questions.md before finalizing affected contracts.
  - Define event, component, tracking day, main night, assessment, stable ID, unit, schema version and tri-state answer contracts.
  - Store actual timestamps independently from editable night association; distinguish naps from the main night.
- Out:
  - Garmin integration, correlations and production deployment.

# Acceptance criteria
- AC1: Document the agreed assignment rule with 00:30 and 08:00 examples, boundary values, DST and late bedtime/manual override cases.
- AC2: Define unique daily stress assessment ownership and unambiguous before/after-night references.
- AC3: Define unknown/none/not-applicable/completed semantics and a migration-safe export schema.

# AC Traceability
- request-AC2 -> This backlog slice. Proof: Planned validation: timestamp, timezone, boundary and editable main-night contract examples.
- request-AC5 -> This backlog slice. Proof: Planned validation: meal and dietary event contracts preserve explicit presence, absence and unknown values.
- request-AC6 -> This backlog slice. Proof: Planned validation: cat context, assessed stress periods and early-wake semantics have distinct contracts.
- request-AC7 -> This backlog slice. Proof: Planned validation: stable entity identity, completion state and edit/delete behavior preserve missingness.
- request-AC8 -> This backlog slice. Proof: Planned validation: versioned export contract and synthetic completeness comparison cover every collected entity.
- request-AC9 -> This backlog slice. Proof: Planned validation: data dictionary defines future external Garmin joins without adding imports or analysis.

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
