# Operations — local startup, container, backup and restore

This document covers running SommeilEnOr locally and as a container. It does not
describe or authorize a production deployment: domain, proxy and production
configuration are a separate operational step. Use synthetic data only in tests.

## Stack and versions

| Part | Choice | Locked version |
| --- | --- | --- |
| PWA | React + TypeScript, built with Vite | React 18.3.1, Vite 6.4.4, TypeScript 5.9 (`package-lock.json`) |
| API | Python FastAPI + Uvicorn | FastAPI 0.152.0, Pydantic 2.14.1, Uvicorn 0.54.0 (`backend/uv.lock`) |
| Storage | SQLite (WAL), one file | Python stdlib `sqlite3` |
| Container | Multi-stage Docker image | Node 22 build stage, Python 3.13-slim runtime |

## Local development

Requirements: Node 22+, [uv](https://docs.astral.sh/uv/).

```sh
npm ci                                   # frontend dependencies
(cd backend && uv sync)                  # API dependencies
(cd backend && SOMMEILENOR_SECURE_COOKIES=false \
  uv run uvicorn app.main:create_app --factory --reload --port 8000)
npm run dev                              # http://localhost:5173, proxies /api to :8000
```

The database defaults to `backend/data/sommeilenor.sqlite3` (ignored by git).
The service worker is only registered in production builds.

## Checks

```sh
(cd backend && uv run ruff check . && uv run ruff format --check . && uv run pytest)
npm run typecheck && npm test && npm run build
logics-manager i18n validate
# Against a running instance (synthetic accounts are created):
npx playwright install chromium && BASE=http://localhost:8000 npm run smoke
docker build -t sommeilenor:local . && scripts/container-restore-check.sh
```

## Container

```sh
cp .env.example .env            # adjust; never commit .env
docker compose up -d --build    # listens on 127.0.0.1:${SOMMEILENOR_PORT:-8000}
```

- Journal data lives in the `sommeilenor-data` volume (`/data/sommeilenor.sqlite3`).
- `./backups` is mounted at `/backups` for backup files.
- The process runs as an unprivileged user; `/api/health` backs the health check.
- A restart (`docker compose restart`) preserves data in the volume.

### HTTPS reverse proxy (generic)

The app must be served over HTTPS: session cookies are `Secure`, `HttpOnly`,
`SameSite=Strict`, and PWA installation and service workers require HTTPS.
Point the existing reverse proxy at `http://127.0.0.1:${SOMMEILENOR_PORT}` and
forward `Host`, `X-Forwarded-For` and `X-Forwarded-Proto`. Serve the app at the
root of its own host name (the PWA scope is `/`). No proxy-side caching of
`/api/` (responses are `Cache-Control: no-store`). `sw.js` is sent with
`Cache-Control: no-cache` so updates reach clients; users see an "update
available" banner and choose when to reload.

## Backup and restore

`create` uses the SQLite online backup API and is safe while the app is running:

```sh
docker compose exec sommeilenor \
  python -m app.backup create /backups/sommeilenor-$(date +%Y%m%d-%H%M).sqlite3
```

Restore with the app stopped. The file's integrity and schema version are checked
before it replaces the database:

```sh
docker compose stop sommeilenor
docker compose run --rm sommeilenor python -m app.backup restore /backups/<file>.sqlite3
docker compose start sommeilenor
```

Backups contain personal journal data and password hashes: store them privately,
never in this repository (`backups/` and `*.sqlite*` are git-ignored).
`scripts/container-restore-check.sh` exercises restart persistence and a
two-account backup restored into an isolated instance, comparing exports and
checking cross-account isolation, with synthetic data.

## Security notes

- Email + password registration (at least 10 characters, hashed with scrypt). Open by
  default; `SOMMEILENOR_REGISTRATION=closed` refuses new accounts with 403
  `registration_closed` while existing accounts still sign in.
- Every journal, favorite, suggestion and export query is filtered by the session's
  account; another account's IDs answer 404.
- No rate limiting is built in; apply it at the reverse proxy for `/api/auth/` if
  the instance is exposed publicly.
