## prod_001_sommeilenor_personal_sleep_context_journal - SommeilEnOr personal sleep context journal
> Date: 2026-10-20
> Status: Proposed
> Related request: `req_000_sommeilenor_collection_only_pwa_mvp`
> Related backlog: `item_001_define_tracking_days_nights_and_collection_data_contracts`, `item_002_build_authenticated_cross_device_pwa_foundation`, `item_003_collect_repeated_beverages_physical_activities_and_naps`, `item_004_collect_meal_night_context_and_daily_assessments`, `item_005_deliver_day_night_history_and_portable_exports`, `item_006_package_and_verify_collection_mvp_for_self_hosting`
> Related task: `task_001_orchestrate_sommeilenor_collection_mvp_delivery`
> Related architecture: (none yet)
> Reminder: Update status, linked refs, scope, decisions, success signals, and open questions when you edit this doc.

# Overview
A fast French PWA to collect daily and nightly context and export it for later sleep analysis.

# Goals
- Low-friction repeated event capture and daily recap.
- Reliable temporal links across midnight and devices.
- Complete portable records with explicit missingness.

# Non-goals
- Garmin import or synchronization.
- Correlation dashboards, causal claims or health recommendations.
- Production deployment during initial corpus creation.

# Scope and guardrails
- In: authenticated cross-device collection, historical editing and complete export.
- In: repeated beverages, activities, naps, meal and night context, daily stress.
- Out: Garmin integration, correlations and health recommendations.
- Repository planning does not authorize production deployment.
- Public source contains only synthetic fixtures; journal data stays private.

# Product overview
```mermaid
flowchart LR
    Phone[Phone PWA] --> Capture[Private collection API]
    Desktop[Desktop browser] --> Capture
    Capture --> Journal[Events and assessments]
    Journal --> Nights[Explicit day and night links]
    Nights --> Export[Versioned JSON and CSV export]
    Export --> Later[Future external sleep comparison]
```

# Key product decisions
- Confirmed: collection comes first; Garmin and correlations come later.
- Confirmed: timed entries may repeat and after-midnight links must be explicit.
- Proposed: French React PWA, FastAPI and SQLite, packaged with Docker.
- Proposed: 04:00 local tracking-day boundary with manual night reassignment.
- Pending: account model, offline behavior, combinations, stress periods, meal
  granularity and early-wake definitions; see docs/mvp-questions.md.

# Success signals
- A user records and corrects repeated daily events on a phone without data loss.
- The same saved entries appear on another authenticated browser.
- Post-midnight events retain their real timestamps and correct editable night link.
- Complete exports preserve repeated entries, units and missingness for later joins.
- Access control, export completeness and synthetic backup/restore are verified.

# Open questions
- Resolve the detailed checklist in docs/mvp-questions.md before dependent work.
- No statistical conclusions or Garmin integration are part of MVP acceptance.

# References
- Product back-reference: `req_000_sommeilenor_collection_only_pwa_mvp`
- Task back-reference: `task_001_orchestrate_sommeilenor_collection_mvp_delivery`
