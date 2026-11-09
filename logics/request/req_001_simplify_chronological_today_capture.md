## req_001_simplify_chronological_today_capture - Simplify chronological Today capture
> From version: 0.1.0
> Schema version: 1.0
> Status: Blocked
> Understanding: 100%
> Confidence: 90%
> Complexity: High
> Theme: Capture usability
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.
> Indicators reviewed: 2026-11-09 17:09:43

# AI Context
- Summary: Replace the crowded Today forms with chronological quick capture and compact evening/night questions.
- Keywords: capture, sheets, autosave, accessibility, French
- Use when: Implementing or reviewing the Today redesign.
- Skip when: Changing authentication, deployment or analytics.

# Needs
- Make daily capture clean and fast on phone and desktop.
- Keep existing journal semantics, historical corrections and private suggestions.

# Context
- Owner-approved order: quick capture, evening, night, collapsed advanced options.
- Existing frontend uses persistent capture cards, field hints and multiple save indicators.
- Sugar and early-wake server validators currently require a time; permit missing time to support immediate yes saves without inventing timestamps.
- Dinner retains all four existing portions; gluten remains available under advanced options.
- Favorites management is separate from capture. Each drink starts at 250 ml, sport at 30 minutes, nap at 20 minutes.

# Priority
- Priority: High
- Rationale: The current screen makes the core daily workflow difficult to fill.

# Scope
- In: Today layout, shared capture/edit sheets, separate favorites management, autosave, progress, focused tests and synthetic screenshots.
- Out: deployment, Garmin, analytics, schema changes and unrelated API changes.

# Acceptance criteria
- AC1: Today is one column at all widths, ordered quick capture, Soir, Nuit, collapsed advanced options, with short section help and no unknown chips.
- AC2: Every question saves on change; selected choices clear to unknown; one global save indicator reports pending, saved, failed or offline. Sugar yes saves without time.
- AC3: Quick capture and inline entry editing use accessible sheets with fresh defaults (250 ml, activity 30 minutes, nap 20 minutes); favorites management is separate, and event edit/delete and temporal overrides remain available under advanced options.
- AC4: Header counts answered core questions and answered rows show checks; preserve four dinner portions, gluten, independent stress and absent/unknown semantics.
- AC5: Frontend tests, backend tests, build and available offline-local Playwright smoke pass; save synthetic mobile 390x844 and desktop screenshots, commit on main without pushing.
- AC6: Times in the capture use a two-step hour and quarter-hour picker with no now shortcut; sport durations run from 15 min to 2 h by quarter hour; drink volumes are 250 ml, 500 ml, 750 ml or 1 L. Stored off-grid values display as they are.

# Definition of Ready (DoR)
- [x] Problem statement and user impact are clear.
- [x] Scope boundaries are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and API validation exception are identified.

# Companion docs
- Product brief(s): existing journal product brief remains settled.
- Architecture decision(s): none required; retained stack and schema.

# References
- `src/screens/TodayScreen.tsx`
- `src/components/Capture.tsx`
- `docs/mvp-questions.md`

# Backlog
- `item_007_simplify_chronological_today_capture`

# Executions
| When | Runner | Run id | Title | State | PR | Notes |
| --- | --- | --- | --- | --- | --- | --- |
