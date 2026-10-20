# SommeilEnOr

A personal, mobile-first sleep context journal. Record daily habits and the
context around each night, then export the records for later analysis.

## MVP

- A French progressive web app accessible from phones and desktop browsers.
- Repeated, timed beverage and physical activity entries.
- Meal timing, alcohol, gluten, naps, late sugar and evening hot drinks.
- Cat presence, stress before/after a night, and early wake-up context.
- Explicit links between a tracking day, events after midnight and its following night.
- Editing, history and a complete portable export.

Garmin integration, correlations and health recommendations are outside this MVP.
The application has not been implemented yet.

## Planning

The initial Logics corpus lives in `logics/`. Its scaffold input is
`logics/scaffold/collection-mvp.json`. Pending product decisions and concrete
midnight examples are in `docs/mvp-questions.md`.

Confirmed requirements and proposed defaults are distinguished explicitly.
Resolve the relevant open decisions before implementing the affected slice.

## Proposed implementation

React/TypeScript PWA, Python/FastAPI API and SQLite, packaged with Docker for
an existing HTTPS reverse proxy. This stack is a proposal, not a delivered app.
Use server persistence for cross-device access; decide offline editing separately.

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
