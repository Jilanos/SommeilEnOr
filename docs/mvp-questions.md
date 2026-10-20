# MVP confirmed decisions

Sources: the original user-edited questionnaires are preserved in
`mvp-answers-round-1.md` and `mvp-answers-round-2.md`. Four subsequent chat replies
confirmed account policy, sugar/evening drink detail, private suggestions and the
strict day boundary. This document supersedes the unresolved F1–F7 checklist.
Implementation has not started.

## Confirmed collection behavior

| Area | Decision |
| --- | --- |
| Accounts | Open email/password registration; private isolated data per account. |
| Connectivity | Online only, with explicit pending/saved/failed/disconnected states. No offline writes, queues or replay. |
| Capture | Quick buttons; no mandatory daily recap. Unanswered remains unknown. |
| Tracking day | Strict 04:00 boundary in Europe/Paris; manual night reassignment. |
| Habitual night | 23:30–07:00 is informational only, not measured sleep and not an alternative assignment rule. |
| Drinks | Distinct green tea, black tea, mate and infusion categories, intake time and volume. |
| Favorites | Reusable values create fresh independent entries with their own intake time. No multi-ingredient combinations. |
| Activity | Repeatable sessions: one type, intensity, start time and duration. No multi-activity session. |
| Dinner | Time plus quantity: small / medium / big / massive, with French interface labels. |
| Alcohol/gluten | Independent daily yes/no answers; unknown if unanswered. No quantities or required association with dinner. |
| Late sugar | Manual yes/no with intake time when yes; no automatically calculated late threshold. |
| Evening hot drink | Non-caffeinated evening drink as a separate yes/no/unknown context flag. No duplicate intake record is created. |
| Naps | Start time plus duration. |
| Cat | Bedroom presence only; no cat-caused awakening field. |
| Stress | Separate experienced stress of the tracking day and anticipated stress for the following day, each absent / medium / high. |
| Early waking | A planned constraint with target time and reason, not a record of actual wake time. |
| Sleep data | No manual bedtime, wake time, sleep quality or fatigue. Garmin data will be handled later, outside this MVP. |
| History | Unrestricted past creation, correction and deletion. |
| Factors | Fixed initial factor list; no generic custom-factor builder. |
| Suggestions | A control near every action opens private free text; suggestions are stored in the app and shown in an owner-only list. No automatic GitHub publication. |
| Reminders | None. |
| Export scope | All history, preserving actual times, offsets, units, unknown/negative distinctions, relationships and overrides. |
| Stack | React/TypeScript PWA, FastAPI, SQLite and Docker, chosen under the user's delegated preference. |

## Documented implementation defaults

These are practical starting defaults, not additional user answers:

- Volume unit: ml, with positive numeric validation and no guessed caffeine dose.
- Fixed drink catalog above; custom drink categories can be reconsidered later.
- Activity catalog: walking, running, cycling, strength and other; labels can evolve.
- Activity intensity: low / medium / high.
- Export: versioned JSON plus normalized CSV bundle for all history. Include
  favorites and suggestions in separate sections/files, not as journal events.
- Keep Europe/Paris without a special travel mode. Preserve actual timestamps and
  UTC offsets; apply daylight saving time correctly.
- Suggestions retain action context and text, remain owner-scoped, and make no
  external request. They are feature feedback, not health journal comments.
- Registration does not grant access to other accounts' journals, suggestions,
  favorites or exports. Verify authorization on direct/guessed record IDs.

No blocking collection-scope question remains. Domain/proxy integration and
production configuration remain operational inputs for a later deployment.

## Midnight examples

| Actual local event | Default tracking day | Nominal main night |
| --- | --- | --- |
| Tuesday 00:30 | Monday | Monday → Tuesday |
| Tuesday 03:59 | Monday | Monday → Tuesday |
| Tuesday 04:00 | Tuesday | Tuesday → Wednesday |
| Tuesday 05:00 during an awakening | Tuesday | Tuesday → Wednesday; manually reassign if desired |
| Tuesday 08:00 | Tuesday | Tuesday → Wednesday |

The user explicitly chose the strict 04:00 rule with manual correction over
extending night assignment until 07:00. Nominal night IDs do not imply actual
bedtime or wake time. Manual overrides survive reload and export. Actual event
timestamps are never rewritten to fit a tracking date. DST cases must retain
actual offsets and ordering.

## Stress example

For tracking day Monday and night Monday → Tuesday, record independently:

- Experienced Monday stress: absent / medium / high.
- Anticipated Tuesday stress: absent / medium / high.

Tuesday's later experienced stress must not overwrite Monday's anticipation.
These are distinct observations, with explicit assessed dates/periods in export.

## Late-sugar example

When the user answers yes, store the stated intake time. No fixed threshold is
inferred; the user decides whether the intake was late. A no answer is distinct
from unknown, and changing to no must not leave a misleading active intake time.

## Deferred scope

Garmin import/synchronization, correlations, recommendations, manual sleep
metrics, reminders, offline writes, mixed-ingredient drinks, generic custom
factors, cat awakening measurements, GitHub publication and production deployment
are outside this MVP planning delivery.
