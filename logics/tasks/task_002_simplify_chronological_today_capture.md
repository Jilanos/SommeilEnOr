## task_002_simplify_chronological_today_capture - Simplify chronological Today capture
> From version: 0.1.0
> Schema version: 1.0
> Status: In progress
> Understanding: 100%
> Confidence: 90%
> Progress: 95%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Owner: Paul
> Indicators reviewed: 2026-11-09 21:32:09

# AI Context
- Summary: Chronological Today capture redesign
- Keywords: simplify, chronological, today, capture
- Use when: Implementing the capture redesign
- Skip when: Unrelated product work

# Definition of Done (DoD)
- [ ] The backlog scope is implemented.
- [ ] Acceptance criteria are covered.
- [ ] Validation passes.
- [ ] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# Backlog
- `item_007_simplify_chronological_today_capture`

# Acceptance criteria
- AC1: Today is one column at all widths, ordered quick capture, Soir, Nuit, collapsed advanced options, with short section help and no unknown chips.
- AC2: Every question saves on change; selected choices clear to unknown; one global save indicator reports pending, saved, failed or offline. Sugar yes saves without time.
- AC3: Quick capture and inline entry editing use accessible sheets with fresh defaults (250 ml, activity 30 minutes, nap 15 minutes); favorites management is separate, and event edit/delete and temporal overrides remain available under advanced options.
- AC4: Header counts answered core questions and answered rows show checks; preserve four dinner portions, gluten, independent stress and absent/unknown semantics.
- AC5: Frontend tests, backend tests, build and available offline-local Playwright smoke pass; save synthetic mobile 390x844 and desktop screenshots, commit on main without pushing.
- AC6: Times in the capture use a two-step hour and quarter-hour picker with no now shortcut; sport and nap durations run from 15 min to 2 h by quarter hour; drink volumes are 250 ml, 500 ml, 750 ml or 1 L. Stored off-grid values display as they are.

# Plan
- [x] Replace capture cards with accessible sheets and separate favorites management.
- [x] Share compact chronological context questions and serialized autosave with one indicator.
- [x] Owner follow-up: quarter-hour time picker without now, sport and nap durations 15 min to 2 h, drink volumes 250 ml to 1 L.
- [ ] Verify frontend/backend behaviour, local browser smoke and screenshots.
- [ ] Record evidence and close the chain after local commits.

# Validation
- `npm test`: 33 passed.
- `npm run build`: passed.
- Owner follow-up (2026-11-09): `npm test` 38 passed; `npm run build` passed; `(cd backend && uv run pytest)` 35 passed without polling, one existing deprecation warning. No backend change.
- Backend temporal and optional-time persistence/export tests: 17 passed.
- Full backend suite: 35 passed with a temporary selector-polling pytest plugin; regular TestClient blocks on cross-thread wakeup in this sandbox. See `docs/capture-redesign.md`.
- Ruff check and format on changed Python files: passed.
- i18n validation: passed.
- `OUT=docs/screenshots node scripts/smoke.mjs`: blocked at Chromium launch by denied shutdown syscall; no screenshots produced.
- `git diff --check`: passed. Local commit blocked by read-only `.git` mount.

# Report
- Implemented chronological single-column capture, event bottom sheets, inline editing/deletion, separate favorites, eight-question progress and one save indicator.
- Preserved gluten under advanced options, four portions, stress periods, unknown semantics, private section suggestions and existing temporal associations.
- Removed retired cards and unused strings/styles. Sugar and early-wake yes now permit optional times using existing nullable fields; API routes and schema remain unchanged.
- Owner follow-up: one reusable `TimeSelect` (hour, then 00/15/30/45) replaces every capture time input and the now shortcut. Sport and nap duration is one select from 15 min to 2 h (nap default 15 min); drink volume is a segmented choice of 250 ml, 500 ml, 750 ml or 1 L. The API still receives Paris wall time and millilitres; backend bounds already accept these values.
- Remaining: browser review/screenshots outside the restricted environment, local commit on main, traceability proof and closeout. No push.
- Full handoff and file list: `docs/capture-redesign.md`.
- 2026-11-09: sandbox blockers gone (commits and pytest run on the host). Hosted at https://sommeil.paulmondou.fr with registration switch, closed by default and temporarily open on the VPS for the owner's account. Remaining: owner check on the live site, smoke screenshots.

# Links
- Request: `req_001_simplify_chronological_today_capture`
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)

# Executions
| When | Runner | Run id | Title | State | PR | Notes |
| --- | --- | --- | --- | --- | --- | --- |

# Notes
- 2026-11-09: owner approved the one-column redesign; times by hour + quarter-hour selects (no Maintenant), sport and nap durations 15 min to 2 h, drinks 250/500/750 ml and 1 L.
