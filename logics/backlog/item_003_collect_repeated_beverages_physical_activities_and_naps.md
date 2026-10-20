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
> Indicators reviewed: 2026-10-20 13:00:24

# AI Context
Repeated timed events are essential. Green tea, black tea and mate remain separate; confirm whether combinations mean mixed ingredients, repeated entries or presets.

# Problem
- Repeated daily events cannot be represented by one boolean per category.

# Scope
- In:
  - Resolve beverage combinations, quantity units and exercise options (questions 6–8, 11–12).
  - Quick creation and recap editing of distinct beverage intakes, activity sessions and naps.
  - Retain multiple entries on the same day, event times/durations and editable night links.
- Out:
  - Garmin integration, correlations and production deployment.

# Acceptance criteria
- AC1: Save two green teas, one black tea and one mate at distinct times without overwriting any intake; exercise the agreed combination representation.
- AC2: Create multiple physical activities and naps; reject invalid intervals/durations and allow corrections.
- AC3: Represent evening hot drinks consistently with existing beverage records, with no duplicate event.

# AC Traceability
- request-AC3 -> This backlog slice. Proof: AC1: Save two green teas, one black tea and one mate at distinct times without overwriting any intake; exercise the agreed combination representation.
- request-AC4 -> This backlog slice. Proof: AC2: Create multiple physical activities and naps; reject invalid intervals/durations and allow corrections.
- request-AC7 -> This backlog slice. Proof: AC3: Represent evening hot drinks consistently with existing beverage records, with no duplicate event.

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
