## item_007_simplify_chronological_today_capture - Simplify chronological Today capture
> From version: 0.1.0
> Schema version: 1.0
> Status: Blocked
> Understanding: 100%
> Confidence: 90%
> Progress: 90%
> Complexity: High
> Theme: Operator workflow and runtime integration
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.
> Indicators reviewed: 2026-11-09 16:52:51

# AI Context
- Summary: Chronological Today capture redesign
- Keywords: simplify, chronological, today, capture
- Use when: Implementing the capture redesign
- Skip when: Unrelated product work

# Problem
Make daily capture clean and fast on phone and desktop.
Keep existing journal semantics, historical corrections and private suggestions.

# Scope
- In:
  - Today, shared event sheets, separate favorites, progress, autosave and optional sugar/wake time validation
- Out:
  - Deployment, analytics, Garmin and schema changes

# Acceptance criteria
- AC1: Today is one column at all widths, ordered quick capture, Soir, Nuit, collapsed advanced options, with short section help and no unknown chips.
- AC2: Every question saves on change; selected choices clear to unknown; one global save indicator reports pending, saved, failed or offline. Sugar yes saves without time.
- AC3: Quick capture and inline entry editing use accessible sheets with fresh defaults (250 ml, activity 30 minutes, nap 20 minutes); favorites management is separate, and event edit/delete and temporal overrides remain available under advanced options.
- AC4: Header counts answered core questions and answered rows show checks; preserve four dinner portions, gluten, independent stress and absent/unknown semantics.
- AC5: Frontend tests, backend tests, build and available offline-local Playwright smoke pass; save synthetic mobile 390x844 and desktop screenshots, commit on main without pushing.
- AC6: Times in the capture use a two-step hour and quarter-hour picker with no now shortcut; sport durations run from 15 min to 2 h by quarter hour; drink volumes are 250 ml, 500 ml, 750 ml or 1 L. Stored off-grid values display as they are.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: Today is one column at all widths, ordered quick capture, Soir, Nuit, collapsed advanced options, with short section help and no unknown chips.
- request-AC2 -> This backlog slice. Proof: AC2: Every question saves on change; selected choices clear to unknown; one global save indicator reports pending, saved, failed or offline. Sugar yes saves without time.
- request-AC3 -> This backlog slice. Proof: AC3: Quick capture and inline entry editing use accessible sheets with fresh defaults (250 ml, activity 30 minutes, nap 20 minutes); favorites management is separate, and event edit/delete and temporal overrides remain available under advanced options.
- request-AC4 -> This backlog slice. Proof: AC4: Header counts answered core questions and answered rows show checks; preserve four dinner portions, gluten, independent stress and absent/unknown semantics.
- request-AC5 -> This backlog slice. Proof: AC5: Frontend tests, backend tests, build and available offline-local Playwright smoke pass; save synthetic mobile 390x844 and desktop screenshots, commit on main without pushing.
- request-AC6 -> This backlog slice. Proof: `src/components/TimeSelect.tsx`, `src/components/Capture.tsx`; covered by `src/capture.test.tsx` (fixed volumes, quarter-hour times, sport durations, off-grid display).

# Decision framing
- Product framing: Not needed
- Product signals: (none detected)
- Product follow-up: No product brief follow-up is expected based on current signals.
- Architecture framing: Not needed
- Architecture signals: (none detected)
- Architecture follow-up: No architecture decision follow-up is expected based on current signals.

# Links
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)
- Request: `logics/request/req_001_simplify_chronological_today_capture.md`
- Primary task(s): (none yet)

# Priority
- Priority: High
- Rationale: Core daily workflow usability, approved by the owner.

# Notes
- Hybrid rationale: Derived from request `req_001_simplify_chronological_today_capture` and kept bounded to one coherent delivery slice.
- Source file: `logics/request/req_001_simplify_chronological_today_capture.md`.
- Generated locally by logics-manager.

# Executions
| When | Runner | Run id | Title | State | PR | Notes |
| --- | --- | --- | --- | --- | --- | --- |


# Tasks
- `task_002_simplify_chronological_today_capture`
