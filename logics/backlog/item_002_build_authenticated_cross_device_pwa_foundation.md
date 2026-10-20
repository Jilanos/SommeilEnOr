## item_002_build_authenticated_cross_device_pwa_foundation - Build authenticated cross-device PWA foundation
> From version: 1.0.0
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Medium
> Theme: Collection MVP
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.
> Indicators reviewed: 2026-10-20 14:10:12

# AI Context
Online-only quick-action PWA using React/TypeScript, FastAPI and SQLite. F1 alone determines the account/registration model; offline synchronization is excluded.

# Problem
- A public repository must deliver a private journal usable across devices.

# Scope
- In:
  - Confirm registration/login policy in F1; online-only behavior and chosen React/TypeScript + FastAPI + SQLite stack are settled.
  - French responsive quick-action shell, install manifest and service worker/update behavior without journal write caching.
  - Authenticated API, server persistence, sessions, mutation protection and account data isolation if registration is enabled.
  - Visible pending/saved/failed/disconnected states; no offline queue or automatic replay.
- Out:
  - Garmin integration, correlations and production deployment.

# Acceptance criteria
- AC1: Verify unauthenticated users cannot read, mutate or export journal data.
- AC2: Demonstrate a saved record is visible on a second authenticated browser and layouts work on mobile and desktop.
- AC3: Verify HTTPS installability and updates; offline/failed writes show a truthful state, create no queued journal entry and are not silently replayed.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: Planned validation: Deliver an authenticated French mobile-first installable PWA with online-only quick event buttons and server-persisted records shared across phone and desktop sessions; disconnected or failed saves never appear successful and no offline write queue is implemented.
- request-AC7 -> This backlog slice. Proof: Planned validation: Provide history with unrestricted past creation/correction and deletion, preserve repeated entries and explicit negative versus missing answers without a mandatory recap; keep the factor list fixed and resolve F6 before adding the requested note control near actions.
- request-AC10 -> This backlog slice. Proof: Planned validation: Provide reproducible local startup, a container deployment artifact, persistent storage and documented backup/restore; verify authentication and isolation of private data, and commit synthetic data only; do not deploy production as part of planning.

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
- Rationale: access control and reliable persistence precede personal-data collection.
