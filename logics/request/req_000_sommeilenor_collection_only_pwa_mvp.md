## req_000_sommeilenor_collection_only_pwa_mvp - SommeilEnOr collection-only PWA MVP
> From version: 1.0.0
> Schema version: 1.0
> Status: Draft
> Understanding: 90%
> Confidence: 85%
> Complexity: High
> Theme: Personal sleep context collection
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.
> Indicators reviewed: 2026-10-20 14:10:11

# AI Context
Round 1 decisions are incorporated. Only F1-F7 in docs/mvp-questions.md remain open; online-only capture, favorites, the 04:00 boundary and no manual sleep journal are settled.

# Needs
- Record daily habits quickly on phone and desktop with repeated timed events.
- Associate a tracking day and its after-midnight events with the appropriate following main night.
- Export collected data for later comparison with Garmin outside the MVP.

# Context
- Round 1 user answers are preserved in docs/mvp-answers-round-1.md and normalized in docs/mvp-questions.md; F1-F7 are the remaining follow-ups.
- Confirmed: online-only quick capture, separate repeated intakes with reusable favorites, 04:00 tracking-day boundary with manual reassignment and Europe/Paris initially.
- Confirmed: green tea, black tea, mate and infusions with volume; repeatable activity type/start/duration; dinner time only; naps start/duration; non-caffeinated evening drink context separate from caffeinated intakes.
- Confirmed: stress absent/medium/high with experienced and anticipated stress kept distinct; early waking is a planned constraint; unrestricted past corrections; fixed factors; no reminders or manual sleep measurements.
- Pending F1-F7: registration/login policy, custom drink categories and units, exercise options, alcohol/gluten granularity, late-sugar rule, drink/cat detail, exact stress periods, early-wake fields, note meaning, export formats and unusual night defaults.
- The user delegates stack selection: retain React/TypeScript, FastAPI, SQLite and Docker. Domain/proxy integration remains a later hosting decision.
- Public source repository; personal data and Garmin exports remain private. Garmin integration, correlations and production deployment are outside current work.

# Acceptance criteria
- AC1: Deliver an authenticated French mobile-first installable PWA with online-only quick event buttons and server-persisted records shared across phone and desktop sessions; disconnected or failed saves never appear successful and no offline write queue is implemented.
- AC2: Preserve actual timestamps and offsets alongside a tracking-day date and stable editable main-night association; apply a 04:00 local boundary in Europe/Paris, test midnight/boundary/DST/manual reassignment, and create nominal night IDs without requiring actual sleep metrics.
- AC3: Support separate repeated timed beverage intakes with distinct green tea, black tea, mate and infusion categories, volume and reusable favorites; keep non-caffeinated evening hot-drink context distinct, resolve F2/F4 detail and avoid duplicate intake records.
- AC4: Support repeatable physical activities with type, start and duration and naps with start plus duration; validate duration consistency, and resolve F2 before adding intensity or multi-activity sessions.
- AC5: Capture dinner time only with independent alcohol/gluten answers and late sugar; preserve unknown versus explicit absence, and resolve F3 granularity and the fixed late threshold before implementing dependent validation.
- AC6: Capture night cat presence, experienced and anticipated stress as separate absent/medium/high values, and a planned early-wake constraint; resolve F4/F5 period/time/reason detail and never substitute actual stress for an earlier anticipation.
- AC7: Provide history with unrestricted past creation/correction and deletion, preserve repeated entries and explicit negative versus missing answers without a mandatory recap; keep the factor list fixed and resolve F6 before adding the requested note control near actions.
- AC8: Export all history with complete collected entities and relationships, IDs, timezone/offset, original timestamps, units, missingness, tracking days, night links and distinct stress semantics; confirm versioned JSON and normalized CSV bundle in F7 and verify completeness using synthetic round-trip fixtures.
- AC9: Keep Garmin imports/synchronization/credentials, correlations, health recommendations, manual sleep measurements and reminders outside the MVP; document future external Garmin joins using nominal night labels without inventing actual bedtime/wake time or Garmin values.
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
