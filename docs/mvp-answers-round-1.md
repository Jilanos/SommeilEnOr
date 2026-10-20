# Original answered questionnaire — round 1

The text below preserves the user-edited questionnaire verbatim. The normalized
decisions and remaining questions are in `mvp-questions.md`. Ambiguous fragments
are not treated as confirmed choices.

---

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
   login method? Suggested default: single account, possible registration.
2. Connectivity: online-first with an explicit offline state, or offline creation
   and editing with synchronization? online only
3. Intake experience: quick event buttons
4. Tracking day boundary: proposed 04:00 local time with manual correction
5. Timezone:  Europe/Paris initially
6. Beverages: add infusions and custom categories? Record volume, 
7. Combinations: repeated separate intake,
   reusable favorites
8. Exercise: initial types? Record intensity and multiple activities per session?
   Proposed essentials: type, start and duration; repeatable sessions. yes
9. Meals:  dinner only, juste time wirh Alcohol and gluten not attached
   to meals, standalone events, daily flags, or a combination? Alcohol units?
10. Late sugar: explicit yes/no, a timed intake, 
    What defines late: fixed time No threshold agreed.
11. Evening hot drinks: derive from beverage entries (including temperature/context)
    or use a separate nightly answer differetn because not caffeined
12. Naps: start plus duration
13. Cat: presence only,and reported awakenings?
14. Stress: absence medium or high et différent pour le passé et à venir (le stress peut etre en prévision avec parfois en réalité rien )
15. Early waking: planned constraint
16. Sleep journal: only  Garmin
17. History: how far back can entries be added/corrected? Suggested: unrestricted
    past edits; 
18. Extensibility: fixed but always add a note to track the next settings and otpuiosn inside the app near every action
19. Reminders: none
20. Export: JSON and normalized CSV bundle? All history 
21. Hosting: confirm subdomain and existing proxy integration later; authentication
    and backup/restore are prerequisites for production, not deployment approval.
22. Stack: confirm React/TypeScript + FastAPI + SQLite, or another preference. as preffered for optimal dev

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
