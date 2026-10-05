# Productionization Checklist

## Current Product Goal

Position the project as:

`Personal security and device visibility dashboard`

Not:

- generic productivity tracker
- full observability platform
- enterprise monitoring suite

## Immediate Findings From Repo Audit

### 1. Two competing backend architectures exist

The repo currently mixes:

1. an older simple Django setup
2. a newer overbuilt `auth_system` + expanded models structure

Examples:

- `backend/manage.py` uses `procmon.settings`
- `backend/procmon/settings.py` is the active settings module
- `backend/settings/` also exists as a second settings tree

This creates confusion about which backend structure is real.

### 2. Active URL config includes unfinished auth code

`backend/procmon/urls.py` includes:

- `api/auth/` via `auth_system.urls`
- `api/` via `processes.urls`

But the active installed apps in `procmon.settings` do not include `auth_system`.

That means the backend wiring is structurally inconsistent.

### 3. Models reference unfinished/missing app relationships

`backend/processes/models.py` references:

- `workspaces.Workspace`

But there is no `workspaces` app in this repo’s installed apps.

This is a hard blocker for treating the expanded model layer as production-ready.

### 4. Repo contains large “enterprise-grade” code and comments that overstate maturity

The repo uses labels like:

- `Production-Grade`
- `Enterprise-Grade`

But the actual project still has:

- split architecture
- missing wiring
- unfinished app references
- incomplete product setup

These claims should be toned down until the app is actually stable.

### 5. Frontend documentation is still template-level

`frontend/process-monitor/README.md` is still generic Next.js starter text.

That is not acceptable for a product repo.

### 6. Environment and setup story are incomplete/inconsistent

There is a root `.env.example`, which is useful.

But the backend and frontend setup flow is not yet cleanly documented around:

1. which settings module is canonical
2. whether auth is part of version 1
3. how frontend env is consumed
4. what the true local run path is

## Recommended Strategy

Do not try to ship the overbuilt architecture as-is.

Version 1 should be simplified around one clean vertical:

1. agent sends snapshot
2. backend stores snapshot
3. dashboard shows device and process visibility
4. basic alerts flag unusual behavior

## Version 1 Product Scope

Keep:

1. device ingestion
2. host list
3. latest snapshot
4. process history
5. CPU/memory visibility
6. online/offline state
7. simple alert rules

Cut or defer:

1. workspace/multi-tenant abstractions
2. enterprise RBAC complexity
3. unused auth surface area
4. overbuilt “task” or placeholder features not tied to the MVP

## First Cleanup Tasks

### Backend

1. choose one settings architecture
2. remove or disable broken references to unfinished apps
3. decide whether `auth_system` is part of version 1
4. make `manage.py check` pass cleanly
5. verify migrations work

### Frontend

1. replace generic README
2. document local run commands
3. verify the dashboard actually connects to live backend data
4. remove placeholder sections that are not part of the MVP

### Agent

1. verify snapshot payload shape matches backend expectations
2. document setup on Mac/Windows/Linux
3. confirm onboarding flow for API key usage

## First Technical Milestone

A successful first milestone is:

1. backend boots
2. frontend boots
3. agent posts real snapshot
4. snapshot appears in dashboard
5. host shows online status

Until that works, nothing else should be considered production-ready.
