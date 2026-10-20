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
> Indicators reviewed: 2026-10-20 15:22:14

# AI Context
Strict 04:00 assignment with manual overrides is settled, including 05:00 events. Habitual 23:30–07:00 is informational, not measured sleep. Define owner-scoped journal and suggestion contracts.

# Problem
- Midnight and ambiguous missing values can make future sleep comparisons incorrect.

# Scope
- In:
  - Use strict 04:00 Europe/Paris day assignment including events during nocturnal awakenings; manual override remains available.
  - Define nominal nights without measured sleep data, dinner quantity enum, stress periods, intensity, favorite identity and separate private feature suggestions.
  - Preserve original timestamps/offsets and missingness; habitual 23:30–07:00 is informational only.
- Out:
  - Garmin integration, correlations and production deployment.

# Acceptance criteria
- AC1: Specify 00:30, 03:59, 04:00, 05:00 and 08:00 assignment plus DST/offset preservation and manual override; habitual hours have no assignment effect.
- AC2: Define separate experienced tracking-day and anticipated next-day stress fields, each absent/medium/high with unknown distinct from absent.
- AC3: Define dinner quantity, intensity, positive volume/duration, timed late-sugar validation, owner IDs, favorites and private suggestion contracts in the full export schema.

# AC Traceability
- request-AC2 -> This backlog slice. Proof: Planned validation: Preserve actual timestamps/offsets, tracking dates and stable editable nominal night IDs; apply the strict 04:00 Europe/Paris boundary including 05:00, midnight, DST and manual overrides; habitual 23:30–07:00 is informational and never measured or used to override assignment.
- request-AC5 -> This backlog slice. Proof: Planned validation: Capture dinner time plus small/medium/big/massive quantity, independent daily alcohol/gluten yes/no/unknown, and manual late-sugar yes/no/unknown plus time when yes; no automatic late threshold or alcohol quantity is required.
- request-AC6 -> This backlog slice. Proof: Planned validation: Capture cat presence only, separate experienced tracking-day and anticipated next-day stress at absent/medium/high, and a planned early-wake constraint with target time and reason; preserve unknown answers and never overwrite anticipation with later experienced stress.
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
- Rationale: temporal identity and missingness are dependencies of every capture screen.
