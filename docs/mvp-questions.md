# MVP refinement decisions

This is a decision checklist, not a record of answers. Requirements explicitly
requested by the user are confirmed; all defaults below remain proposals.
No production deployment or application implementation is included in this setup.

## Confirmed scope

Collection-only PWA across phones and computers, with a future export-based
comparison to Garmin data. Track green tea, black tea and mate with intake times
and repeatable combinations; physical activity with type, duration and time;
meal times; alcohol and gluten; naps; late sugar; evening hot drinks; cat presence
in the bedroom; stress for the days before/after a night; and possible early
wake-ups. Events after midnight must remain linkable to the relevant following night.

## Decisions to resolve

1. Access: one private account initially, or multiple isolated accounts? Preferred
   login method? Suggested default: single account, closed registration.
2. Connectivity: online-first with an explicit offline state, or offline creation
   and editing with synchronization? If offline is required, choose conflict
   behavior and device persistence expectations before implementing it.
3. Intake experience: quick event buttons, a daily recap, or both? Suggested: both.
4. Tracking day boundary: proposed 04:00 local time with manual correction, or
   explicit night selection? Must irregular schedules and night shifts be supported?
5. Timezone: proposed Europe/Paris initially; what should happen while travelling?
   Preserve the original offset/timezone and calendar timestamp in every case.
6. Beverages: add coffee, decaf, infusions or custom categories? Record cups,
   volume, brewing strength, caffeine estimates, or only type and time?
7. Combinations: repeated separate intakes, several components within one intake,
   reusable favorites, or all three? Proposed: repeated entries and multi-component
   intakes; favorites remain optional until confirmed.
8. Exercise: initial types? Record intensity and multiple activities per session?
   Proposed essentials: type, start and duration; repeatable sessions.
9. Meals: all meals or dinner only? Start/end time? Alcohol and gluten attached
   to meals, standalone events, daily flags, or a combination? Alcohol units?
10. Late sugar: explicit yes/no, a timed intake, or a rule-derived indicator?
    What defines late: fixed time or time relative to bedtime? No threshold agreed.
11. Evening hot drinks: derive from beverage entries (including temperature/context)
    or use a separate nightly answer? Avoid counting the same drink twice.
12. Naps: start plus duration, start/end, and optional perceived quality?
13. Cat: presence only, time present, and/or reported awakenings?
14. Stress: scale 0–10 or another scale? Full previous/following day assessments,
    bedtime/morning assessments, or both? Reuse each daily assessment across the
    adjacent nights rather than creating conflicting copies.
15. Early waking: planned constraint, observed early awakening, or both? Record
    time, reason, alarm and ability to fall asleep again? Relative to what target?
16. Sleep journal: include manual bedtime, wake time, quality and morning fatigue
    before Garmin exists? These should be optional if accepted.
17. History: how far back can entries be added/corrected? Suggested: unrestricted
    past edits; corrected timestamps must re-evaluate the proposed night link.
18. Extensibility: custom factors/tags in MVP, or a fixed initial list?
19. Reminders: none, in-app prompts, or push notifications? Reminder times?
20. Export: JSON and normalized CSV bundle? All history or selectable range?
    Include raw timestamps, timezone, tracking date, stable night ID, missingness,
    units and schema version. No Garmin import or credentials in this MVP.
21. Hosting: confirm subdomain and existing proxy integration later; authentication
    and backup/restore are prerequisites for production, not deployment approval.
22. Stack: confirm React/TypeScript + FastAPI + SQLite, or another preference.

## Midnight scenarios requiring agreement

Under the proposed 04:00 boundary, an intake Tuesday at 00:30 belongs to Monday's
tracking day and its following main night, labelled by Tuesday's wake date.
An intake Tuesday at 08:00 belongs to Tuesday's tracking day and the night ending
Wednesday. Calendar dates are never rewritten. The night association is explicit
and editable; the boundary is only a default assignment rule.

Clarify an intake during a nocturnal awakening, a bedtime after 04:00, no main
sleep that day, multiple main sleeps, travel across timezones, and DST transitions.
Do not infer actual sleep intervals solely from the tracking-day boundary.

## Analysis readiness

An unanswered field is unknown, not a negative answer. A day without events is
not automatically a completed day. Explicit none/not-applicable responses and
completion state must survive export. Correlation, causal interpretation and
automated improvement recommendations are deferred.
