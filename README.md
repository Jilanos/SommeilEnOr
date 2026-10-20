# SommeilEnOr

A personal, mobile-first sleep context journal. Record daily habits and the
context around each night, then export the records for later analysis.

## MVP

- A French progressive web app accessible from phones and desktop browsers.
- Online-only quick buttons; repeated timed drinks with volume and reusable favorites.
- Single-type physical activities with intensity/start/duration; naps with start/duration.
- Dinner time and portion size, daily alcohol/gluten, timed manual late sugar and evening hot-drink flag.
- Cat presence, distinct experienced/anticipated stress and planned early waking.
- Tracking days starting at 04:00 in Europe/Paris, with editable night associations.
- Unrestricted historical correction and a complete all-history JSON/CSV export.
- Open email/password registration, isolated account data and private feature suggestions.

Garmin integration, correlations, manual sleep metrics, reminders and offline
writes are outside this MVP. No production deployment is part of this repository.

## Planning

The initial Logics corpus lives in `logics/`. Its scaffold input is
`logics/scaffold/collection-mvp.json`. Confirmed decisions, documented implementation defaults and midnight examples
are in `docs/mvp-questions.md`. Original questionnaire answers are preserved in
`docs/mvp-answers-round-1.md` and `docs/mvp-answers-round-2.md`.

Confirmed requirements and implementation defaults are distinguished explicitly.
No blocking collection-scope question remains; deployment configuration comes later.

## Implementation

React/TypeScript PWA (repository root, `src/`), Python/FastAPI API with SQLite
(`backend/`), packaged as one Docker image for an existing HTTPS reverse proxy.
Server persistence provides cross-device access; journal writes require a
connection and are never queued offline.

- Local startup, container, reverse proxy, backup/restore: `docs/operations.md`.
- Export structure and future Garmin joins: `docs/export-format.md`.

```sh
(cd backend && uv sync && uv run pytest)   # API tests
npm ci && npm test && npm run build        # PWA tests and build
docker compose up -d --build               # container on 127.0.0.1:8000
```

## Repository policy

This repository is public. Never commit personal journal entries, Garmin exports,
credentials, tokens, production addresses or database backups. Use synthetic
fixtures only. Deployment and production configuration are separate work.

## Logics validation

```sh
logics-manager status
logics-manager lint --require-status
logics-manager audit --group-by-doc
logics-manager i18n validate
```
