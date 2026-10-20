## item_005_deliver_day_night_history_and_portable_exports - Deliver day night history and portable exports
> From version: 1.0.0
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Medium
> Theme: Collection MVP
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.
> Indicators reviewed: 2026-10-20 13:00:35

# AI Context
The export is the bridge to future external Garmin comparison. Preserve raw dates, timezone, stable associations, component detail and missingness without analysis.

# Problem
- The collection MVP must already produce reliable inputs for later external comparisons.

# Scope
- In:
  - Day/night navigation, historical editing, deletion and completion state.
  - Versioned complete JSON plus normalized CSV bundle and data dictionary.
  - All repeated events, components, daily assessments and associations included.
  - Document future Garmin alignment by wake date and actual timezone; no integration implemented.
- Out:
  - Garmin integration, correlations and production deployment.

# Acceptance criteria
- AC1: Export a synthetic journal spanning midnight and DST, repeated events and missing/negative answers; compare every exported entity and relationship to persisted data.
- AC2: Demonstrate historical time edits and night overrides remain consistent in history and export.
- AC3: Ensure exports are authenticated, omit secrets, and contain no fabricated Garmin or correlation fields.

# AC Traceability
- request-AC2 -> This backlog slice. Proof: Planned validation: timestamp, timezone, boundary and editable main-night contract examples.
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
- Rationale: useful history and lossless export complete the collection promise.
