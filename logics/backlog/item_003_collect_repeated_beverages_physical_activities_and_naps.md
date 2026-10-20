## item_003_collect_repeated_beverages_physical_activities_and_naps - Collect repeated beverages physical activities and naps
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
Separate intakes and favorites; one activity per session with intensity; naps start/duration. Catalog defaults are explicit; evening non-caffeinated context is a boolean rather than a duplicate drink.

# Problem
- Repeated daily events cannot be represented by one boolean per category.

# Scope
- In:
  - Fixed green tea/black tea/mate/infusion catalog, intake time and volume in ml; separate repeated entries and reusable favorites.
  - Favorites copy selected values into fresh independently editable entries; a new intake uses its own timestamp, never the favorite creation timestamp.
  - One activity type per session with start, positive duration and low/medium/high intensity; start-plus-duration naps.
  - Initial activity options walking/running/cycling/strength/other are editable implementation defaults; no mixed sessions or custom factor builder.
  - Evening non-caffeinated drink is a separate yes/no/unknown context flag; an infusion intake is not duplicated.
- Out:
  - Garmin integration, correlations and production deployment.

# Acceptance criteria
- AC1: Save repeated tea/mate/infusion intakes with time/positive ml volume and use a favorite to create a fresh entry without overwriting prior records.
- AC2: Save repeatable single-type activities with intensity and start/duration plus naps; reject invalid quantities and preserve manual night overrides.
- AC3: Keep evening non-caffeinated yes/no/unknown independent of caffeinated intake and never create a duplicate infusion event.

# AC Traceability
- request-AC3 -> This backlog slice. Proof: Planned validation: Support separate repeated timed green tea, black tea, mate and infusion intakes with positive volume in ml and reusable favorites creating independent entries; evening non-caffeinated drink is a separate yes/no/unknown context flag, not an inferred or duplicated intake.
- request-AC4 -> This backlog slice. Proof: Planned validation: Support repeated activity sessions with exactly one type, low/medium/high intensity, start and positive duration; support naps with start plus positive duration and validate interval consistency.
- request-AC7 -> This backlog slice. Proof: Planned validation: Provide unrestricted past create/edit/delete history and fixed factors without a mandatory recap; place a private free-text feature-suggestion control near every action and provide an owner-only suggestion list, separate from journal events and without GitHub publication.

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
- Rationale: timed repeated events are the core collection workflow.
