# User-edited questionnaire — round 2

Original wording retained; trailing whitespace normalized. Live follow-up replies
are recorded in the current decision document.

---

# MVP decisions and follow-up questions

Round 1 answers are preserved verbatim in `mvp-answers-round-1.md`. This document
normalizes those answers without treating unanswered fragments as approval.
The MVP remains a collection-only French PWA; implementation has not started.

## Confirmed decisions

| Area | Decision |
| --- | --- |
| Access | Personal use initially, with registration requested as a possibility; policy and login method still open. |
| Connectivity | Online only. No offline writes, queue or synchronization engine. Show failed/disconnected save states clearly. |
| Capture | Quick event buttons. No mandatory daily recap wizard. History remains available for correction. |
| Tracking day | 04:00 local boundary, with manual reassignment to a night. |
| Timezone | Europe/Paris initially; retain timestamps and offsets, including DST. Travel behavior is not specified. |
| Beverages | Distinct green tea, black tea, mate and infusions; record volume and intake time. Custom categories and volume unit still need confirmation. |
| Combinations | Repeated separate intakes and reusable favorites. Mixed-ingredient intakes are not requested. |
| Exercise | Repeatable activity entries with type, start time and duration. Initial types and intensity/compound-session options still open. |
| Meals | Dinner time only. Alcohol and gluten are independent of the dinner record; their granularity still open. |
| Late sugar | Must be recorded; yes/no versus timed entries and the fixed late threshold remain unresolved. |
| Evening hot drinks | A distinct non-caffeinated evening context; not inferred from caffeinated intakes. Field detail still open. |
| Naps | Start time plus duration. |
| Cat | Presence in the bedroom; recording cat-caused awakenings remains unresolved. |
| Stress | Absent / medium / high. Keep experienced stress and anticipated stress separate; exact assessed periods still need confirmation. |
| Early waking | A planned constraint, not an observed sleep metric. Time and reason fields still open. |
| Sleep | No manual bedtime, wake time, sleep quality or fatigue journal. Sleep measurements will come from Garmin later; no Garmin integration in this MVP. |
| History | Unrestricted past entry and correction. |
| Extensibility | Fixed initial factors. A note near each action is requested, but its meaning needs clarification. |
| Reminders | None. |
| Export | All history. JSON and normalized CSV remain the recommended formats, pending explicit format confirmation. |
| Hosting | Confirm domain/proxy integration later; authentication and backup/restore precede production use. |
| Stack | User delegates the choice for efficient development: React/TypeScript, FastAPI and SQLite with Docker are retained. |

## Follow-up questions

- **F1 — Accounts:** private single account, invitation registration or public
  registration? Is email/password acceptable? yes
- **F2 — Beverages and exercise:** confirm custom beverage categories and ml as
  volume unit. Which initial activity types? Is intensity needed yes, and should a
  session contain multiple activity types no ? Favorites reuse selected values and
  create new independently editable entries, never overwrite prior intakes yes
- **F3 — Food:** daily yes/no  for alcohol and gluten?
  Alcohol quantities/units if timed? Late sugar: manual yes/no timed,
 Dinner is just a time, independently editable with quantity : selection between, small medium big massive.
- **F4 — Evening and cat:** non-caffeinated evening drink as yes/no only, or
  type/time/volume too? Cat presence only, no reported awakening flag,
  An infusion must not accidentally create two intake records for one drink.
- **F5 — Stress and early waking:** confirm whether the two stress answers are
  the experienced stress of the tracking day and anticipated stress for the next
  day, attached to the following night. Should the planned early-wake constraint
  include target time and reason? Never replace anticipation with actual stress. yes
- **F6 — Notes:** a feature-suggestion control
  beside every action,
- **F7 — Time and export:** confirm JSON plus CSV for all history and a fixed
  Europe/Paris MVP without special travel handling. During a nocturnal awakening,
  should the default suggest the ongoing night or apply the 04:00 rule with a
  manual override? The app cannot know sleep intervals without sleep data. basics is 23h30 7h

## Midnight convention

With the confirmed 04:00 boundary, an intake Tuesday at 00:30 belongs by default
to Monday's tracking day and the main night nominally ending Tuesday. An intake
Tuesday at 08:00 belongs to Tuesday's tracking day and the night nominally ending
Wednesday. At exactly 04:00 the new tracking day starts. Calendar timestamps
remain unchanged, and manual association overrides are retained.

Night labels are nominal dates for future comparison, not measured wake dates.
No actual bedtime or wake time is required to create a night identifier. DST
changes must preserve actual offsets and order. No sleep interval is inferred
from the tracking-day boundary. Unusual nocturnal events remain part of F7.

## Missingness and deferred scope

Unanswered is not absent, and no logged event does not prove no intake. Explicit
negative answers must survive exports without a mandatory recap flow. A fixed
factor list does not imply that custom beverage categories have been approved.

Garmin imports, correlations, recommendations, reminders, manual sleep metrics,
offline writes and production deployment are outside this delivery plan's MVP.
