## item_004_collect_meal_night_context_and_daily_assessments - Collect meal night context and daily assessments
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
Dinner portion, timed manual sugar, daily alcohol/gluten, cat presence only, experienced/anticipated stress and planned waking are specified. Feature suggestions are private app data, not journal events or GitHub issues.

# Problem
- Meal and night context needs clear granularity and meaningful unanswered states.

# Scope
- In:
  - Dinner time plus small/medium/big/massive portion size; independent daily alcohol/gluten yes/no/unknown.
  - Manual late sugar yes/no/unknown plus time when yes, without a derived threshold; non-caffeinated evening drink yes/no/unknown.
  - Night cat presence only, separate experienced/anticipated three-level stress, planned early-wake constraint with target time/reason.
  - Feature-suggestion button near each action opens private free text stored separately from journal entries; provide an owner-only list without external sending.
- Out:
  - Garmin integration, correlations and production deployment.
  - Manual sleep metrics, actual awakenings, reminders, generic custom factors and automatic GitHub issue creation.

# Acceptance criteria
- AC1: Independently create/correct dinner time and portion, alcohol/gluten, timed sugar, evening drink and cat answers; distinguish missing from explicit no.
- AC2: Save experienced tracking-day and anticipated next-day stress separately; planned early waking stores target time/reason without recording actual wake measurements.
- AC3: Open a suggestion control from each action, store its action context and private text, and list it for its owner only; it creates no journal event or external issue.

# AC Traceability
- request-AC5 -> This backlog slice. Proof: Planned validation: Capture dinner time plus small/medium/big/massive quantity, independent daily alcohol/gluten yes/no/unknown, and manual late-sugar yes/no/unknown plus time when yes; no automatic late threshold or alcohol quantity is required.
- request-AC6 -> This backlog slice. Proof: Planned validation: Capture cat presence only, separate experienced tracking-day and anticipated next-day stress at absent/medium/high, and a planned early-wake constraint with target time and reason; preserve unknown answers and never overwrite anticipation with later experienced stress.
- request-AC7 -> This backlog slice. Proof: Planned validation: Provide unrestricted past create/edit/delete history and fixed factors without a mandatory recap; place a private free-text feature-suggestion control near every action and provide an owner-only suggestion list, separate from journal events and without GitHub publication.

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
- Rationale: complete the requested factor set after shared capture patterns exist.
