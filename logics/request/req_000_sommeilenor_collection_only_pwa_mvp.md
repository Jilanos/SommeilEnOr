## req_000_sommeilenor_collection_only_pwa_mvp - SommeilEnOr collection-only PWA MVP
> From version: 1.0.0
> Schema version: 1.0
> Status: Draft
> Understanding: 90%
> Confidence: 85%
> Complexity: High
> Theme: Personal sleep context collection
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.
> Indicators reviewed: 2026-10-20 13:00:24

# AI Context
Collection-only scope confirmed; detailed capture choices remain in docs/mvp-questions.md. This request defines future application delivery, not completion of repository setup.

# Needs
- Record daily habits quickly on phone and desktop with repeated timed events.
- Associate a tracking day and its after-midnight events with the appropriate following main night.
- Export collected data for later comparison with Garmin outside the MVP.

# Context
- Green tea, black tea, mate, activity details/durations/times, meals, alcohol, gluten, naps, late sugar, evening hot drinks, cat presence, before/after-night stress and early waking are explicitly requested.
- Repository setup and development-ready planning are authorized; application implementation and production deployment are not part of this task.
- Product questions in docs/mvp-questions.md remain open. Proposed defaults are not user-approved decisions; resolve the relevant questions before implementing dependent behavior.
- Proposed stack: React/TypeScript, FastAPI and SQLite with Docker; existing hosting uses a shared HTTPS reverse proxy.
- Public source repository; personal data and Garmin exports must remain private.

# Acceptance criteria
- AC1: Deliver an authenticated French mobile-first installable PWA with server-persisted records shared across phone and desktop sessions; expose connectivity and save failures without claiming unsaved changes were saved.
- AC2: Preserve actual timestamps and timezone alongside a tracking-day date and stable editable main-night association; demonstrate after-midnight, boundary, DST and manual reassignment examples using the confirmed assignment rule.
- AC3: Support repeated beverage intakes with time and distinct green tea, black tea and mate categories; support the confirmed meaning of combinations and represent evening hot drinks without double counting.
- AC4: Support repeated physical activity sessions with activity details, start time and duration, and repeated naps with time and duration; validate interval and duration consistency.
- AC5: Capture meal timing, alcohol, gluten and late sugar using explicit present/absent/unknown states and the confirmed event-versus-daily granularity; preserve the meaning of late sugar in exports.
- AC6: Capture cat presence for a night, stress for the confirmed before/after periods, and early-waking context with confirmed planned/actual semantics; identify the assessed date/period unambiguously.
- AC7: Provide a day/night history with create, edit and delete operations; preserve repeated entries and distinguish missing data, explicit absence and completed daily assessments.
- AC8: Export all user-collected data in versioned JSON and a documented normalized CSV bundle, including IDs, timezone/offset, original timestamps, units, missingness, tracking days and night links; verify completeness using synthetic round-trip fixtures.
- AC9: Keep Garmin imports/synchronization, credentials, correlation calculations and health recommendations out of the MVP; document the export join convention for future Garmin records without inventing Garmin values.
- AC10: Provide reproducible local startup, a container deployment artifact, persistent storage and documented backup/restore; verify authentication and isolation of private data, and commit synthetic data only; do not deploy production as part of planning.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_001_sommeilenor_personal_sleep_context_journal`
- Architecture decision(s): (none yet)

# References
- README.md
- docs/mvp-questions.md

# Backlog
- `item_001_define_tracking_days_nights_and_collection_data_contracts`
- `item_002_build_authenticated_cross_device_pwa_foundation`
- `item_003_collect_repeated_beverages_physical_activities_and_naps`
- `item_004_collect_meal_night_context_and_daily_assessments`
- `item_005_deliver_day_night_history_and_portable_exports`
- `item_006_package_and_verify_collection_mvp_for_self_hosting`
