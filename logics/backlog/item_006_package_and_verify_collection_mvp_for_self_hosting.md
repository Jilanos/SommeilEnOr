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
> Indicators reviewed: 2026-10-20 14:10:12

# AI Context
Containerize the retained stack, verify authenticated online-only operations and restore synthetic records. No production deployment, reminders or manual sleep journal.

# Problem
- A cross-device journal needs reproducible operations and recoverable persistent storage.

# Scope
- In:
  - Use the retained React/TypeScript + FastAPI + SQLite/Docker stack; implement no offline synchronization or reminders.
  - Document local startup and selected dependency versions, container build and generic HTTPS reverse-proxy integration.
  - Use environment templates without real deployment addresses or credentials.
  - Document and exercise backup/restore with synthetic data and persistent volumes.
  - Focused integration and responsive-browser checks; French i18n contract validation.
- Out:
  - Garmin integration, correlations and production deployment.

# Acceptance criteria
- AC1: Start a clean instance from documented commands and verify a restart preserves synthetic journal entries.
- AC2: Restore a synthetic backup into an isolated instance and compare records and exported links.
- AC3: Run the relevant automated checks and mobile/desktop smoke checks; record evidence without claiming production deployment.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: Planned validation: Deliver an authenticated French mobile-first installable PWA with online-only quick event buttons and server-persisted records shared across phone and desktop sessions; disconnected or failed saves never appear successful and no offline write queue is implemented.
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
- Priority: Medium
- Rationale: operational verification is required before any later deployment.
