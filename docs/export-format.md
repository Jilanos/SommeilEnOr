# Export format (schema 1.0.0)

Two downloads cover the whole history of the signed-in account only:

- `GET /api/export.json` — one versioned JSON document.
- `GET /api/export.zip` — normalized CSV bundle: `manifest.json`,
  `tracking_days.csv`, `nights.csv`, `events.csv`, `favorites.csv`,
  `feature_suggestions.csv`, `data_dictionary.csv`.

Neither contains the email address, password hash or sessions.

## Structure

| Section / file | Content |
| --- | --- |
| `conventions` | Europe/Paris, 04:00 tracking-day boundary, informational habitual window 23:30–07:00, units. |
| `journal.tracking_days` | One row per tracking day with answers: alcohol, gluten, experienced stress, evening non-caffeinated drink, late sugar (+ optional time when yes), dinner time and quantity. |
| `journal.nights` | Stable night ID, nominal `start_date`/`end_date`, cat presence, anticipated stress for `anticipated_stress_for_date`, planned early wake (optional target time and reason). |
| `journal.events` | Repeated drinks (type, ml), activities (single type, intensity, minutes), naps (minutes); actual UTC instant, UTC offset and local time; default tracking date; linked night and whether the link was set manually. |
| `favorites` | Drink presets. Entries created from a favorite are separate events referencing `favorite_id`. |
| `feature_suggestions` | Private app-improvement notes with their action context. Not journal data. |
| `data_dictionary` | Field meanings and units. |

`unknown` always means "not answered" and is different from an explicit `no` /
`absent`. A tracking day without a row has no answers at all; no recorded event
does not prove that nothing was consumed.

## Future comparison with Garmin (outside the MVP)

The MVP has no Garmin import, synchronization or credentials, and creates no
sleep measurement. A later, external analysis can join Garmin sleep records to
this export as follows, without inventing sleep intervals:

1. Take each Garmin sleep record's calendar date of waking (its local date).
2. Join it to `nights.end_date` (the nominal morning date). The `night_id` is the
   stable key for the night's context and its linked events.
3. Use `events.night_id` (which honours manual reassignment) rather than
   recomputing nights from timestamps.
4. Compare times using `*_utc` and `*_utc_offset_minutes`; never derive bedtime
   or wake time from the 04:00 boundary or the habitual 23:30–07:00 window.

Sugar and planned early-wake answers may be `yes` with a null time. The time was
not supplied; this does not turn the answer into unknown or imply an actual wake.
