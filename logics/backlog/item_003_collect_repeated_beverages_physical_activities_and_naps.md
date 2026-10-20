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
> Indicators reviewed: 2026-10-20 14:10:12

# AI Context
Separate repeated beverage intakes with volume, favorites, activity sessions and naps are confirmed. F2/F4 determine optional detail; mixed ingredients are not requested.

# Problem
- Repeated daily events cannot be represented by one boolean per category.

# Scope
- In:
  - Green tea, black tea, mate and infusions with time and volume; separate repeated intakes and reusable favorites. Resolve custom categories/units in F2.
  - Quick create and historical editing; favorites create fresh independently editable entries. Mixed-ingredient composition is outside requested scope.
  - Repeatable physical activity type/start/duration and naps start/duration; resolve initial activities and optional intensity/compound sessions in F2.
  - Keep non-caffeinated evening context separate and resolve F4 detail without duplicating infusion events.
- Out:
  - Garmin integration, correlations and production deployment.

# Acceptance criteria
- AC1: Save multiple green teas, black tea, mate and infusion records with time and volume; reuse a favorite without overwriting previous entries.
- AC2: Create/edit repeated activity sessions and naps using start plus duration; reject invalid durations and preserve manual night overrides.
- AC3: Keep the non-caffeinated evening context distinct from caffeinated intakes and avoid double counting one infusion as two drinks.

# AC Traceability
- request-AC3 -> This backlog slice. Proof: Planned validation: Support separate repeated timed beverage intakes with distinct green tea, black tea, mate and infusion categories, volume and reusable favorites; keep non-caffeinated evening hot-drink context distinct, resolve F2/F4 detail and avoid duplicate intake records.
- request-AC4 -> This backlog slice. Proof: Planned validation: Support repeatable physical activities with type, start and duration and naps with start plus duration; validate duration consistency, and resolve F2 before adding intensity or multi-activity sessions.
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
- Rationale: timed repeated events are the core collection workflow.
