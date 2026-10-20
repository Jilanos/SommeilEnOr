## task_001_orchestrate_sommeilenor_collection_mvp_delivery - Orchestrate SommeilEnOr collection MVP delivery
> From version: 1.0.0
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Indicators reviewed: 2026-10-20 15:49:21
> Owner: claude

# AI Context
Collection MVP implemented: FastAPI/SQLite API (backend/), French React PWA (src/), Docker image, backup/restore. Commits 159a68f and e86bdee. No production deployment.

# Context
- Current work finalizes the collection corpus only; no application implementation is claimed.
- docs/mvp-questions.md records all decisions and documented defaults; original questionnaires are preserved.
- Shared contracts precede authenticated PWA, repeated events, context/suggestions, complete exports and two-account restore checks.

# Plan
- [x] 1. Use the consolidated round 1/2 decisions and chat confirmations in docs/mvp-questions.md; implement the existing prioritized slices with documented editable defaults, without reopening answered questions.
- [x] 2. Deliver High-priority temporal/data contracts first, then authenticated PWA foundation.
- [x] 3. Deliver High-priority repeated events, meal/night assessments, then history and full export.
- [x] 4. Deliver Medium-priority packaging and restore verification after the functional slices.
- [x] 5. Record evidence against each request AC, run appropriate checks and Logics validation, and close out only after actual implementation; deployment needs a separate instruction.
- [x] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [x] Keep commit creation under operator control; do not force one commit per micro-step.
- [x] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_001_define_tracking_days_nights_and_collection_data_contracts`
- `item_002_build_authenticated_cross_device_pwa_foundation`
- `item_003_collect_repeated_beverages_physical_activities_and_naps`
- `item_004_collect_meal_night_context_and_daily_assessments`
- `item_005_deliver_day_night_history_and_portable_exports`
- `item_006_package_and_verify_collection_mvp_for_self_hosting`

# Definition of Done (DoD)
- [x] All ten request acceptance criteria have implementation evidence.
- [x] Relevant product questions have recorded answers and the corpus reflects those answers.
- [x] Authenticated capture, repeated events, night links, history and full exports work across supported devices.
- [x] Synthetic midnight/DST, export completeness, access control and backup/restore checks pass.
- [x] Application checks, Logics validation and i18n validation pass.
- [x] No Garmin integration, correlations or production deployment is claimed.
- [x] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# AC Traceability
- request-AC2 -> This task. Proof: Implemented in 159a68f (API) and e86bdee (PWA, packaging); validated with backend pytest (31 passed), vitest (17 passed), scripts/smoke.mjs (16/16 on container) and scripts/container-restore-check.sh (all PASS). Source: `e86bdee`
- request-AC5 -> This task. Proof: Implemented in 159a68f (API) and e86bdee (PWA, packaging); validated with backend pytest (31 passed), vitest (17 passed), scripts/smoke.mjs (16/16 on container) and scripts/container-restore-check.sh (all PASS). Source: `e86bdee`
- request-AC6 -> This task. Proof: Implemented in 159a68f (API) and e86bdee (PWA, packaging); validated with backend pytest (31 passed), vitest (17 passed), scripts/smoke.mjs (16/16 on container) and scripts/container-restore-check.sh (all PASS). Source: `e86bdee`
- request-AC7 -> This task. Proof: Implemented in 159a68f (API) and e86bdee (PWA, packaging); validated with backend pytest (31 passed), vitest (17 passed), scripts/smoke.mjs (16/16 on container) and scripts/container-restore-check.sh (all PASS). Source: `e86bdee`
- request-AC8 -> This task. Proof: Implemented in 159a68f (API) and e86bdee (PWA, packaging); validated with backend pytest (31 passed), vitest (17 passed), scripts/smoke.mjs (16/16 on container) and scripts/container-restore-check.sh (all PASS). Source: `e86bdee`
- request-AC9 -> This task. Proof: Implemented in 159a68f (API) and e86bdee (PWA, packaging); validated with backend pytest (31 passed), vitest (17 passed), scripts/smoke.mjs (16/16 on container) and scripts/container-restore-check.sh (all PASS). Source: `e86bdee`
- request-AC1 -> This task. Proof: Implemented in 159a68f (API) and e86bdee (PWA, packaging); validated with backend pytest (31 passed), vitest (17 passed), scripts/smoke.mjs (16/16 on container) and scripts/container-restore-check.sh (all PASS). Source: `e86bdee`
- request-AC7 -> This task. Proof: Implemented in 159a68f (API) and e86bdee (PWA, packaging); validated with backend pytest (31 passed), vitest (17 passed), scripts/smoke.mjs (16/16 on container) and scripts/container-restore-check.sh (all PASS). Source: `e86bdee`
- request-AC10 -> This task. Proof: Implemented in 159a68f (API) and e86bdee (PWA, packaging); validated with backend pytest (31 passed), vitest (17 passed), scripts/smoke.mjs (16/16 on container) and scripts/container-restore-check.sh (all PASS). Source: `e86bdee`
- request-AC3 -> This task. Proof: Implemented in 159a68f (API) and e86bdee (PWA, packaging); validated with backend pytest (31 passed), vitest (17 passed), scripts/smoke.mjs (16/16 on container) and scripts/container-restore-check.sh (all PASS). Source: `e86bdee`
- request-AC4 -> This task. Proof: Implemented in 159a68f (API) and e86bdee (PWA, packaging); validated with backend pytest (31 passed), vitest (17 passed), scripts/smoke.mjs (16/16 on container) and scripts/container-restore-check.sh (all PASS). Source: `e86bdee`
- request-AC7 -> This task. Proof: Implemented in 159a68f (API) and e86bdee (PWA, packaging); validated with backend pytest (31 passed), vitest (17 passed), scripts/smoke.mjs (16/16 on container) and scripts/container-restore-check.sh (all PASS). Source: `e86bdee`
- request-AC5 -> This task. Proof: Implemented in 159a68f (API) and e86bdee (PWA, packaging); validated with backend pytest (31 passed), vitest (17 passed), scripts/smoke.mjs (16/16 on container) and scripts/container-restore-check.sh (all PASS). Source: `e86bdee`
- request-AC6 -> This task. Proof: Implemented in 159a68f (API) and e86bdee (PWA, packaging); validated with backend pytest (31 passed), vitest (17 passed), scripts/smoke.mjs (16/16 on container) and scripts/container-restore-check.sh (all PASS). Source: `e86bdee`
- request-AC7 -> This task. Proof: Implemented in 159a68f (API) and e86bdee (PWA, packaging); validated with backend pytest (31 passed), vitest (17 passed), scripts/smoke.mjs (16/16 on container) and scripts/container-restore-check.sh (all PASS). Source: `e86bdee`
- request-AC2 -> This task. Proof: Implemented in 159a68f (API) and e86bdee (PWA, packaging); validated with backend pytest (31 passed), vitest (17 passed), scripts/smoke.mjs (16/16 on container) and scripts/container-restore-check.sh (all PASS). Source: `e86bdee`
- request-AC7 -> This task. Proof: Implemented in 159a68f (API) and e86bdee (PWA, packaging); validated with backend pytest (31 passed), vitest (17 passed), scripts/smoke.mjs (16/16 on container) and scripts/container-restore-check.sh (all PASS). Source: `e86bdee`
- request-AC8 -> This task. Proof: Implemented in 159a68f (API) and e86bdee (PWA, packaging); validated with backend pytest (31 passed), vitest (17 passed), scripts/smoke.mjs (16/16 on container) and scripts/container-restore-check.sh (all PASS). Source: `e86bdee`
- request-AC9 -> This task. Proof: Implemented in 159a68f (API) and e86bdee (PWA, packaging); validated with backend pytest (31 passed), vitest (17 passed), scripts/smoke.mjs (16/16 on container) and scripts/container-restore-check.sh (all PASS). Source: `e86bdee`
- request-AC1 -> This task. Proof: Implemented in 159a68f (API) and e86bdee (PWA, packaging); validated with backend pytest (31 passed), vitest (17 passed), scripts/smoke.mjs (16/16 on container) and scripts/container-restore-check.sh (all PASS). Source: `e86bdee`
- request-AC10 -> This task. Proof: Implemented in 159a68f (API) and e86bdee (PWA, packaging); validated with backend pytest (31 passed), vitest (17 passed), scripts/smoke.mjs (16/16 on container) and scripts/container-restore-check.sh (all PASS). Source: `e86bdee`

# Validation
- (no validation recorded yet)
- cd backend && uv run ruff check . && uv run ruff format --check . && uv run pytest passed on 2026-10-20: 31 passed (temporal 04:00/DST, auth isolation with guessed IDs, collection rules, export completeness JSON+CSV, two-account backup/restore)
- npm run typecheck && npm test && npm run build passed on 2026-10-20: 17 vitest tests passed, build ok; npm audit 0 vulnerabilities
- BASE=http://localhost:8765 node scripts/smoke.mjs passed on 2026-10-20 against the Docker image: 16/16 desktop + Pixel 7 emulated checks, 3 consecutive runs
- scripts/container-restore-check.sh passed on 2026-10-20: restart persistence, online backup, restored two-account exports identical, isolation intact
- logics-manager i18n validate passed on 2026-10-20: contract valid
- Finish workflow executed on 2026-10-20.
- Linked backlog/request close verification passed.

# Report
- API (`backend/app`): strict 04:00 Europe/Paris tracking days, stable nominal night IDs with manual override, DST-aware moments (skipped hour rejected, repeated hour needs an explicit offset), owner-scoped events/days/nights/favorites/suggestions, scrypt passwords, HttpOnly/Secure/SameSite=Strict sessions, versioned JSON + CSV zip export with data dictionary, SQLite online backup and checked restore.
- PWA (root `src/`): French catalog `src/i18n/fr.json`, quick drink buttons and favorites, single-type activities, naps, day and night context, history navigation with edit/delete/night reassignment, suggestion control beside every action and owner-only list, export downloads, offline banner and per-action pending/saved/failed/disconnected states; service worker caches the shell only and never touches `/api` or non-GET requests.
- Packaging: `Dockerfile`, `compose.yaml`, `.env.example`; docs in `docs/operations.md` and `docs/export-format.md` (future Garmin join on `nights.end_date`/`night_id`, no fabricated sleep intervals).
- Fixed during smoke testing: the first service-worker install triggered a page reload that wiped forms being filled; reload now happens only after the user accepts an update.
- Implementation defaults added beyond the spec (documented, editable): sanity upper bounds of 5000 ml and 1440 min; overlapping naps rejected as the interval-consistency rule; early-wake target time required when planned = yes, reason optional.
- Limits: mobile checks use Chromium Pixel 7 emulation, not a physical phone; installability was checked via manifest + active service worker on localhost, not on a real HTTPS host; no login rate limiting (to be set at the reverse proxy). No production deployment.
- Finished on 2026-10-20.
- Linked backlog item(s): `item_001_define_tracking_days_nights_and_collection_data_contracts`, `item_002_build_authenticated_cross_device_pwa_foundation`, `item_003_collect_repeated_beverages_physical_activities_and_naps`, `item_004_collect_meal_night_context_and_daily_assessments`, `item_005_deliver_day_night_history_and_portable_exports`, `item_006_package_and_verify_collection_mvp_for_self_hosting`
- Related request(s): `req_000_sommeilenor_collection_only_pwa_mvp`

# Links
- Request: `req_000_sommeilenor_collection_only_pwa_mvp`
- Product brief(s): `prod_001_sommeilenor_personal_sleep_context_journal`
- Architecture decision(s): (none yet)
