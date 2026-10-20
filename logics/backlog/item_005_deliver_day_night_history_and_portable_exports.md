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
> Indicators reviewed: 2026-10-20 15:22:14

# AI Context
All-history JSON/CSV must preserve owner isolation, portions/intensity, sugar time and independent stress. Export favorites/suggestions separately and never invent actual sleep intervals.

# Problem
- The collection MVP must already produce reliable inputs for later external comparisons.

# Scope
- In:
  - Unrestricted historical create/edit/delete and day/night navigation without a mandatory recap.
  - All-history versioned JSON and normalized CSV with a data dictionary; negative and unknown values remain distinct.
  - Preserve dinner portion, activity intensity, timed sugar, independent stress periods, raw timestamps and night overrides.
  - Include favorites and private suggestions in distinct export sections/files, never as journal events.
  - Future Garmin matching uses nominal night date and stored offsets, not fabricated wake times.
- Out:
  - Garmin integration, correlations and production deployment.

# Acceptance criteria
- AC1: Compare every persisted synthetic entity/relationship to JSON and CSV export, including repeated events, portion/intensity, timed sugar, stress, favorites, suggestions, midnight/DST and missing/negative answers.
- AC2: Historical corrections and explicit night overrides remain consistent in history and export, without requiring sleep measurements.
- AC3: Exports are owner-only, omit credentials and contain no fabricated Garmin/correlation fields; suggestions stay in a separate section/file.

# AC Traceability
- request-AC2 -> This backlog slice. Proof: Planned validation: Preserve actual timestamps/offsets, tracking dates and stable editable nominal night IDs; apply the strict 04:00 Europe/Paris boundary including 05:00, midnight, DST and manual overrides; habitual 23:30–07:00 is informational and never measured or used to override assignment.
- request-AC7 -> This backlog slice. Proof: Planned validation: Provide unrestricted past create/edit/delete history and fixed factors without a mandatory recap; place a private free-text feature-suggestion control near every action and provide an owner-only suggestion list, separate from journal events and without GitHub publication.
- request-AC8 -> This backlog slice. Proof: Planned validation: Export all history in versioned JSON and a normalized CSV bundle with stable IDs, actual timestamps/offsets, units, missingness, dinner quantity, intensity, distinct stress periods, tracking days and editable nominal night links; include favorites and suggestions in separately identified sections/files and verify completeness with synthetic fixtures.
- request-AC9 -> This backlog slice. Proof: Planned validation: Keep Garmin imports/synchronization/credentials, correlations, recommendations, manual sleep metrics, reminders, cat awakening metrics and automatic GitHub issue creation outside the MVP; document future external Garmin joins without fabricating sleep intervals.

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
