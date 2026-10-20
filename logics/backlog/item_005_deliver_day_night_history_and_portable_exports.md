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
> Indicators reviewed: 2026-10-20 14:10:12

# AI Context
All history must remain editable and exportable with distinct anticipated stress and nominal night links. F7 confirms formats; preserve any notes/favorites introduced by resolved decisions.

# Problem
- The collection MVP must already produce reliable inputs for later external comparisons.

# Scope
- In:
  - Day/night navigation with unrestricted historical creation, editing, deletion and missingness; no mandatory daily recap.
  - All-history export; confirm versioned JSON and normalized CSV bundle in F7 and document the data dictionary.
  - Include repeated events, favorites, any confirmed notes, distinct stress assessments and editable nominal-night associations.
  - Document future Garmin matching by nominal night date and stored offsets, without measured wake dates or integration.
- Out:
  - Garmin integration, correlations and production deployment.

# Acceptance criteria
- AC1: Export a synthetic journal spanning midnight and DST, repeated events and missing/negative answers; compare every exported entity and relationship to persisted data.
- AC2: Demonstrate historical time edits and night overrides remain consistent in history and export.
- AC3: Ensure exports are authenticated, omit secrets, and contain no fabricated Garmin or correlation fields.

# AC Traceability
- request-AC2 -> This backlog slice. Proof: Planned validation: Preserve actual timestamps and offsets alongside a tracking-day date and stable editable main-night association; apply a 04:00 local boundary in Europe/Paris, test midnight/boundary/DST/manual reassignment, and create nominal night IDs without requiring actual sleep metrics.
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
- Rationale: useful history and lossless export complete the collection promise.
