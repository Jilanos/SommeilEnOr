# SommeilEnOr

A personal, mobile-first sleep context journal. Record daily habits and the
context around each night, then export the records for later analysis.

## MVP

- A French progressive web app accessible from phones and desktop browsers.
- Online-only quick buttons; repeated timed drinks with volume and reusable favorites.
- Physical activity with type/start/duration; naps with start and duration.
- Dinner time, independent alcohol/gluten, late sugar and non-caffeinated evening context.
- Cat presence, distinct experienced/anticipated stress and planned early waking.
- Tracking days starting at 04:00 in Europe/Paris, with editable night associations.
- Unrestricted historical correction and a complete all-history export.

Garmin integration, correlations, manual sleep metrics, reminders and offline
writes are outside this MVP.
The application has not been implemented yet.

## Planning

The initial Logics corpus lives in `logics/`. Its scaffold input is
`logics/scaffold/collection-mvp.json`. Pending product decisions and concrete
midnight examples are in `docs/mvp-questions.md`. The original first-round
answers are preserved in `docs/mvp-answers-round-1.md`.

Confirmed requirements and proposed defaults are distinguished explicitly.
Resolve the relevant open decisions before implementing the affected slice.

## Selected implementation

React/TypeScript PWA, Python/FastAPI API and SQLite, packaged with Docker for
an existing HTTPS reverse proxy. The user delegated stack selection for efficient
development; no application is delivered yet. Server persistence provides
cross-device access; journal writes require a connection.

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
