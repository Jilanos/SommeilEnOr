## req_000_sommeilenor_collection_only_pwa_mvp - SommeilEnOr collection-only PWA MVP
> From version: 1.0.0
> Schema version: 1.0
> Status: Ready
> Understanding: 95%
> Confidence: 90%
> Complexity: High
> Theme: Personal sleep context collection
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.
> Indicators reviewed: 2026-10-20 15:22:13

# AI Context
Round 1/2 and final chat confirmations are incorporated. Collection behavior is specified; remaining activity labels and ml units are documented implementation defaults. No application is implemented yet.

# Needs
- Record daily habits quickly on phone and desktop with repeated timed events.
- Associate a tracking day and its after-midnight events with the appropriate following main night.
- Export collected data for later comparison with Garmin outside the MVP.

# Context
- Round 1 and round 2 user edits are preserved in docs/mvp-answers-round-1.md and docs/mvp-answers-round-2.md. docs/mvp-questions.md consolidates them and the four subsequent chat confirmations.
- Confirmed: open email/password registration with private per-account data; online-only quick capture; separate repeated drink intakes and reusable favorites.
- Confirmed: strict 04:00 Europe/Paris tracking-day boundary with manual night reassignment. Habitual 23:30–07:00 is informational only and never changes assignment or creates sleep measurements.
- Confirmed: green tea, black tea, mate and infusions with volume; one activity type per session with intensity, start and duration; naps start/duration.
- Confirmed: independent daily alcohol/gluten yes/no; dinner time plus small/medium/big/massive quantity; manual late-sugar yes/no plus time when present; non-caffeinated evening drink yes/no; cat presence only.
- Confirmed: separate experienced tracking-day stress and anticipated next-day stress, each absent/medium/high; planned early-wake constraint with target time and reason; unrestricted past corrections.
- Confirmed: a private free-text feature-suggestion control near every action, with an in-app suggestion list and no automatic GitHub publication. Suggestions are separate from health journal events.
- Implementation defaults explicitly documented: volume in ml; initial activity types walking/running/cycling/strength/other; intensity low/medium/high; fixed drink catalog; versioned JSON and CSV all-history export; no special travel mode.
- User delegates stack selection: React/TypeScript, FastAPI, SQLite and Docker. Public source only; no personal records or credentials. Hosting integration remains a later operational step.
- Excluded: offline writes, mandatory recap, generic custom factors, mixed-ingredient drinks, reminders, manual sleep measurements, cat awakening metrics, Garmin integration, correlation and production deployment.

# Acceptance criteria
- AC1: Deliver an authenticated French mobile-first installable online-only PWA with quick event buttons, open email/password registration and server-persisted records shared across devices; enforce per-account isolation and truthful failed/offline saves without an offline queue.
- AC2: Preserve actual timestamps/offsets, tracking dates and stable editable nominal night IDs; apply the strict 04:00 Europe/Paris boundary including 05:00, midnight, DST and manual overrides; habitual 23:30–07:00 is informational and never measured or used to override assignment.
- AC3: Support separate repeated timed green tea, black tea, mate and infusion intakes with positive volume in ml and reusable favorites creating independent entries; evening non-caffeinated drink is a separate yes/no/unknown context flag, not an inferred or duplicated intake.
- AC4: Support repeated activity sessions with exactly one type, low/medium/high intensity, start and positive duration; support naps with start plus positive duration and validate interval consistency.
- AC5: Capture dinner time plus small/medium/big/massive quantity, independent daily alcohol/gluten yes/no/unknown, and manual late-sugar yes/no/unknown plus time when yes; no automatic late threshold or alcohol quantity is required.
- AC6: Capture cat presence only, separate experienced tracking-day and anticipated next-day stress at absent/medium/high, and a planned early-wake constraint with target time and reason; preserve unknown answers and never overwrite anticipation with later experienced stress.
- AC7: Provide unrestricted past create/edit/delete history and fixed factors without a mandatory recap; place a private free-text feature-suggestion control near every action and provide an owner-only suggestion list, separate from journal events and without GitHub publication.
- AC8: Export all history in versioned JSON and a normalized CSV bundle with stable IDs, actual timestamps/offsets, units, missingness, dinner quantity, intensity, distinct stress periods, tracking days and editable nominal night links; include favorites and suggestions in separately identified sections/files and verify completeness with synthetic fixtures.
- AC9: Keep Garmin imports/synchronization/credentials, correlations, recommendations, manual sleep metrics, reminders, cat awakening metrics and automatic GitHub issue creation outside the MVP; document future external Garmin joins without fabricating sleep intervals.
- AC10: Provide reproducible local startup, a container artifact, persistent storage and documented backup/restore for the retained stack; verify registration and cross-account read/write/delete/export/suggestion isolation with synthetic data; do not deploy production as part of planning.

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
