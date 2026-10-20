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
> Indicators reviewed: 2026-10-20 15:22:14

# AI Context
Open email/password registration with private isolated data is confirmed. Online-only quick actions; verify owner checks on guessed IDs and exports, including suggestions and favorites.

# Problem
- A public repository must deliver a private journal usable across devices.

# Scope
- In:
  - Open email/password registration, per-account sessions and isolated private server persistence using the selected stack.
  - French responsive quick-action shell, HTTPS installability and service worker updates without journal write caching.
  - Visible pending/saved/failed/disconnected states; no offline queue or automatic replay.
  - Owner-scoped authorization for events, context, favorites, suggestions and exports; duplicate registration and credential errors are handled safely.
- Out:
  - Garmin integration, correlations and production deployment.

# Acceptance criteria
- AC1: Register two accounts and verify unauthenticated access fails and neither account can read/mutate/delete/export the other account data, favorites or suggestions, including guessed IDs.
- AC2: Demonstrate a saved record is visible on a second browser of the same account and layouts work on mobile/desktop.
- AC3: Verify HTTPS installability/updates and failed/offline save states; no offline entry is silently queued or replayed.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: Planned validation: Deliver an authenticated French mobile-first installable online-only PWA with quick event buttons, open email/password registration and server-persisted records shared across devices; enforce per-account isolation and truthful failed/offline saves without an offline queue.
- request-AC7 -> This backlog slice. Proof: Planned validation: Provide unrestricted past create/edit/delete history and fixed factors without a mandatory recap; place a private free-text feature-suggestion control near every action and provide an owner-only suggestion list, separate from journal events and without GitHub publication.
- request-AC10 -> This backlog slice. Proof: Planned validation: Provide reproducible local startup, a container artifact, persistent storage and documented backup/restore for the retained stack; verify registration and cross-account read/write/delete/export/suggestion isolation with synthetic data; do not deploy production as part of planning.

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
