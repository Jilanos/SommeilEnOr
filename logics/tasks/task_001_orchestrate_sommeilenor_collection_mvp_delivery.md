## task_001_orchestrate_sommeilenor_collection_mvp_delivery - Orchestrate SommeilEnOr collection MVP delivery
> From version: 1.0.0
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Indicators reviewed: 2026-10-20 14:10:11

# AI Context
Round 1 is integrated throughout the chain and scaffold. Resolve F1-F7 only where relevant; then implement the existing prioritized slices. Application progress remains zero.

# Context
- Deliver the online-only collection application; current work refines planning only.
- Confirmed decisions and unresolved F1-F7 are in docs/mvp-questions.md; original answers are preserved separately.
- The 04:00 boundary, favorites, no manual sleep journal and selected stack are settled.

# Plan
- [ ] 1. Apply confirmed round 1 answers and resolve only the relevant F1-F7 follow-ups before dependent implementation; retain this existing request chain.
- [ ] 2. Deliver High-priority temporal/data contracts first, then authenticated PWA foundation.
- [ ] 3. Deliver High-priority repeated events, meal/night assessments, then history and full export.
- [ ] 4. Deliver Medium-priority packaging and restore verification after the functional slices.
- [ ] 5. Record evidence against each request AC, run appropriate checks and Logics validation, and close out only after actual implementation; deployment needs a separate instruction.
- [ ] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [ ] Keep commit creation under operator control; do not force one commit per micro-step.
- [ ] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_001_define_tracking_days_nights_and_collection_data_contracts`
- `item_002_build_authenticated_cross_device_pwa_foundation`
- `item_003_collect_repeated_beverages_physical_activities_and_naps`
- `item_004_collect_meal_night_context_and_daily_assessments`
- `item_005_deliver_day_night_history_and_portable_exports`
- `item_006_package_and_verify_collection_mvp_for_self_hosting`

# Definition of Done (DoD)
- [ ] All ten request acceptance criteria have implementation evidence.
- [ ] Relevant product questions have recorded answers and the corpus reflects those answers.
- [ ] Authenticated capture, repeated events, night links, history and full exports work across supported devices.
- [ ] Synthetic midnight/DST, export completeness, access control and backup/restore checks pass.
- [ ] Application checks, Logics validation and i18n validation pass.
- [ ] No Garmin integration, correlations or production deployment is claimed.
- [ ] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# AC Traceability
- request-AC2 -> `item_001_define_tracking_days_nights_and_collection_data_contracts`. Proof deferred to slice closeout.
- request-AC5 -> `item_001_define_tracking_days_nights_and_collection_data_contracts`. Proof deferred to slice closeout.
- request-AC6 -> `item_001_define_tracking_days_nights_and_collection_data_contracts`. Proof deferred to slice closeout.
- request-AC7 -> `item_001_define_tracking_days_nights_and_collection_data_contracts`. Proof deferred to slice closeout.
- request-AC8 -> `item_001_define_tracking_days_nights_and_collection_data_contracts`. Proof deferred to slice closeout.
- request-AC9 -> `item_001_define_tracking_days_nights_and_collection_data_contracts`. Proof deferred to slice closeout.
- request-AC1 -> `item_002_build_authenticated_cross_device_pwa_foundation`. Proof deferred to slice closeout.
- request-AC7 -> `item_002_build_authenticated_cross_device_pwa_foundation`. Proof deferred to slice closeout.
- request-AC10 -> `item_002_build_authenticated_cross_device_pwa_foundation`. Proof deferred to slice closeout.
- request-AC3 -> `item_003_collect_repeated_beverages_physical_activities_and_naps`. Proof deferred to slice closeout.
- request-AC4 -> `item_003_collect_repeated_beverages_physical_activities_and_naps`. Proof deferred to slice closeout.
- request-AC7 -> `item_003_collect_repeated_beverages_physical_activities_and_naps`. Proof deferred to slice closeout.
- request-AC5 -> `item_004_collect_meal_night_context_and_daily_assessments`. Proof deferred to slice closeout.
- request-AC6 -> `item_004_collect_meal_night_context_and_daily_assessments`. Proof deferred to slice closeout.
- request-AC7 -> `item_004_collect_meal_night_context_and_daily_assessments`. Proof deferred to slice closeout.
- request-AC2 -> `item_005_deliver_day_night_history_and_portable_exports`. Proof deferred to slice closeout.
- request-AC7 -> `item_005_deliver_day_night_history_and_portable_exports`. Proof deferred to slice closeout.
- request-AC8 -> `item_005_deliver_day_night_history_and_portable_exports`. Proof deferred to slice closeout.
- request-AC9 -> `item_005_deliver_day_night_history_and_portable_exports`. Proof deferred to slice closeout.
- request-AC1 -> `item_006_package_and_verify_collection_mvp_for_self_hosting`. Proof deferred to slice closeout.
- request-AC10 -> `item_006_package_and_verify_collection_mvp_for_self_hosting`. Proof deferred to slice closeout.

# Validation
- (no validation recorded yet)

# Report
- Not started.

# Links
- Request: `req_000_sommeilenor_collection_only_pwa_mvp`
- Product brief(s): `prod_001_sommeilenor_personal_sleep_context_journal`
- Architecture decision(s): (none yet)
