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
> Indicators reviewed: 2026-10-20 13:00:24

# AI Context
Private journal on multiple browsers: resolve account model and offline requirements before selecting session, storage and synchronization behavior.

# Problem
- A public repository must deliver a private journal usable across devices.

# Scope
- In:
  - Confirm access model, offline scope and stack (questions 1, 2, 22).
  - French responsive app shell, install manifest and production service worker/update behavior.
  - Authenticated API, server persistence, closed registration default proposal, sessions and appropriate mutation protection.
  - Visible save/connectivity states; offline writes only if explicitly selected and designed.
- Out:
  - Garmin integration, correlations and production deployment.

# Acceptance criteria
- AC1: Verify unauthenticated users cannot read, mutate or export journal data.
- AC2: Demonstrate a saved record is visible on a second authenticated browser and layouts work on mobile and desktop.
- AC3: Verify installability over HTTPS, update behavior and truthful handling of failed/offline saves.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: Verify unauthenticated users cannot read, mutate or export journal data.
- request-AC7 -> This backlog slice. Proof: AC2: Demonstrate a saved record is visible on a second authenticated browser and layouts work on mobile and desktop.
- request-AC10 -> This backlog slice. Proof: AC3: Verify installability over HTTPS, update behavior and truthful handling of failed/offline saves.

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
