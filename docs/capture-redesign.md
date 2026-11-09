# Today capture redesign

The capture screen now uses a single column: quick capture, evening, night and
collapsed advanced options. Three buttons open modal bottom sheets for drinks,
sport and naps. Today's entries are compact chips that open editing and deletion.
Existing entries save valid changes automatically; a new entry uses Add after
choosing its details. Every new sheet starts with 250 ml, 30 minutes for sport or
15 minutes for naps. Favorite management has its own screen, reached from advanced
options. Using a favorite retains its provenance and creates an independent entry;
the capture volume starts at 250 ml without changing the stored favorite.

Times use one two-step picker: an hour (00 to 23), then a quarter hour (00, 15,
30, 45). There is no "now" shortcut. A new entry on the current day starts at the
current time rounded down to the quarter hour; other days start at 12:00. Hours
before 04:00 belong to the next calendar date of the tracking day. Dinner, sugar
and early-wake times start empty and clear when the hour is reset to `--`. Sport
and nap durations are a choice from 15 min to 2 h by quarter hour. Drink volume is a choice
of 250 ml, 500 ml, 750 ml or 1 L, stored in millilitres. A stored value off these
grids (an old 330 ml, 08:10 or a 20-minute nap) is shown as it is.

Answers save on change with one shared save indicator. Pressing an answer again
clears it to unknown. Each answered question has a check; the header counts eight
core questions. Dinner counts once when either its time or portion is present.
Gluten remains editable under advanced options and all four portions are retained.
Experienced and anticipated stress stay separate. Short section help replaces the
field hints. Private suggestions remain available through section help.

Native modal dialogs trap focus, dismiss with Escape and restore focus to their
trigger. Controls retain accessible labels, visible focus and touch target sizes.
Browser verification of these behaviours remains pending in this environment.

## API exception

Existing nullable fields and endpoints are retained. Only two required-time
validators were removed: sugar yes and planned early-wake yes now save immediately
with a null time. Optional times can be added or cleared later. No timestamps are
invented, and changing either answer to no or unknown still clears its time (and
wake reason). JSON and CSV preserve explicit yes plus missing time.

Favorite capture uses the existing favorite-use endpoint and, when needed, patches
the new entry's volume. A failed adjustment keeps the already created intake and
retries its adjustment without creating a duplicate.

## Files

- `src/screens/TodayScreen.tsx`, `DayPage.tsx`, `HistoryScreen.tsx`: chronological
  context, progress, inline entries and shared historical correction/capture.
- `src/screens/FavoritesScreen.tsx`: separate favorites management.
- `src/components/Capture.tsx`, `Sheet.tsx`, `SectionHelp.tsx`, `TimeChooser.tsx`,
  `TimeSelect.tsx`: event sheets, modal focus, section help, quarter-hour time
  picker and advanced DST/night controls.
- `src/labels.ts`: fixed volume and sport duration choices and their labels.
- Removed `DayEditor.tsx`, `NightEditor.tsx`, `EventList.tsx`, `Field.tsx` and
  their unused catalog strings/styles.
- `src/App.tsx`, `src/styles.css`, `src/i18n/fr.json`, `src/time.ts`,
  `src/useSaver.ts`: single column, French copy, short dates and serialized writes.
- `src/capture.test.tsx`, `src/useSaver.test.ts`, `src/time.test.ts`: behaviour,
  defaults, offline refusal, error states, temporal handling and concurrent saves.
- `backend/app/journal.py`, `backend/app/export.py`,
  `backend/tests/test_collection.py`, `backend/tests/test_context_optional_times.py`:
  optional context times and persistence/export regression coverage.
- `scripts/smoke.mjs`: updated synthetic browser flow and 390x844 screenshots.
- `README.md`, `docs/mvp-questions.md`, `docs/export-format.md`, this report and
  the redesign request/backlog/task under `logics/`: semantics and delivery state.

## Validation on 2026-11-09

| Check | Result |
| --- | --- |
| `npm test` | 33 tests passed. |
| `npm run build` | Passed (TypeScript and Vite). |
| `(cd backend && uv run pytest)` | Default shared uv cache is read-only. With a writable temporary cache, the first HTTP TestClient call stalls. A 35-second diagnostic timeout showed the cross-thread asyncio selector waiting. |
| Full backend suite with temporary selector polling | 35 passed, one existing Starlette/httpx deprecation warning. No application code, test cases or transports replaced. |
| Backend temporal and optional-time persistence/export tests | 17 passed without polling. |
| Ruff on changed Python files | Passed. |
| Logics i18n validation | Passed. |
| `OUT=docs/screenshots node scripts/smoke.mjs` | Chromium launch failed before navigation: `sandbox_host_linux.cc:41`, `shutdown: Operation not permitted`. |
| Screenshots | None produced. Browser layout, focus and contrast need a real browser review. |
| Local commit | Blocked: `.git/index.lock` cannot be created because `.git` is mounted read-only. No commit and no push. |

The full backend suite was run with a temporary pytest plugin selecting a
`DefaultSelector` subclass whose `select(timeout)` clamps the wait to 10 ms. This
keeps the unchanged TestClient responsive when thread wakeups are not delivered by
this sandbox. The command was
`UV_CACHE_DIR=/tmp/sleep-uv PYTHONPATH=/tmp uv run --offline pytest -p sleep_pytest_poll -q`
from `backend/`. This environment-only adjustment is not part of the application.
The regular suite must also be rerun outside the restricted environment.

## Owner follow-up on 2026-11-09: quarter-hour pickers

| Check | Result |
| --- | --- |
| `npm test` | 38 tests passed (naps included). |
| `npm run build` | Passed (TypeScript and Vite). |
| `(cd backend && uv run pytest)` | 35 passed without polling, one existing Starlette/httpx deprecation warning. |

No backend change: the API already takes Paris wall time, `volume_ml` up to
5000 and `duration_minutes` up to 1440. The free duration field and its error message
are gone: sport and naps share one select. `scripts/smoke.mjs` follows the new
volume and time controls; it was not run.

## Remaining local verification

Use a new synthetic database and the built frontend:

```sh
npm test
(cd backend && uv run pytest)
npm run build
SOMMEILENOR_DB_PATH=/tmp/sommeilenor-capture-review.sqlite3 \
SOMMEILENOR_STATIC_DIR="$PWD/dist" SOMMEILENOR_SECURE_COOKIES=false \
backend/.venv/bin/uvicorn app.main:create_app --factory --app-dir backend \
  --host 127.0.0.1 --port 8765
```

In another terminal:

```sh
OUT=docs/screenshots node scripts/smoke.mjs
```

Expected screenshot paths, not yet generated:

- `docs/screenshots/today-mobile.png` (390x844 viewport, full page).
- `docs/screenshots/today-desktop.png` (1280x900 viewport, full page).
- `docs/screenshots/today-mobile-sheet.png` (390x844 drink sheet).

Review the screenshots and keyboard behaviour. Then commit the finished changes
on `main` with a subject such as
`chg[TSX/TS/CSS/JSON/PY/MJS/MD]: simplify chronological daily capture`.
Record the commit and browser evidence in the Logics task, close out the chain
through Logics Manager and refresh its index. Do not push.

No functional owner question remains. Visual approval remains pending.
