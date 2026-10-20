## item_006_package_and_verify_collection_mvp_for_self_hosting - Package and verify collection MVP for self hosting
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
Containerize and restore a two-account synthetic instance. Exercise private suggestions/favorites and public registration; production deployment remains separate.

# Problem
- A cross-device journal needs reproducible operations and recoverable persistent storage.

# Scope
- In:
  - Use React/TypeScript + FastAPI + SQLite/Docker; verify open registration and cross-account isolation of the online-only app.
  - Document local startup and selected dependency versions, container build and generic HTTPS reverse-proxy integration.
  - Use environment templates without real deployment addresses or credentials.
  - Document and exercise backup/restore with synthetic data and persistent volumes.
  - Focused integration and responsive-browser checks; French i18n contract validation.
- Out:
  - Garmin integration, correlations and production deployment.

# Acceptance criteria
- AC1: Start a clean instance from documented commands and verify a restart preserves synthetic journal entries.
- AC2: Restore a two-account synthetic backup into an isolated instance; compare journal, favorites, suggestions and exports and verify ownership isolation remains intact.
- AC3: Run the relevant automated checks and mobile/desktop smoke checks; record evidence without claiming production deployment.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: Planned validation: Deliver an authenticated French mobile-first installable online-only PWA with quick event buttons, open email/password registration and server-persisted records shared across devices; enforce per-account isolation and truthful failed/offline saves without an offline queue.
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
- Priority: Medium
- Rationale: operational verification is required before any later deployment.
