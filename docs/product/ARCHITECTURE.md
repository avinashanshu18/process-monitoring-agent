# Recommended Architecture

## Product Type

`Personal security and device visibility dashboard`

This is not:

1. full observability
2. enterprise SIEM
3. spyware
4. endpoint detection and response at enterprise scale

So the architecture should optimize for:

1. fast shipping
2. reliability
3. privacy
4. agent ingestion
5. historical device/process visibility
6. alerts
7. easy future SaaS expansion

## Best Overall Architecture

Use a `modular monolith` first.

That means:

1. one primary backend codebase
2. one main database
3. one cache/queue
4. one frontend app
5. one desktop/server agent line
6. mobile companion apps later

Do not start with microservices.

Microservices are the wrong move for version 1 because they add:

1. deployment complexity
2. auth complexity
3. observability complexity
4. slower iteration

## Best Backend Choice

### Recommendation

Use:

`Django + Django REST Framework + Channels + Celery`

## Why This Is The Best Backend For This Product

This product needs:

1. user accounts
2. device registration
3. admin workflows
4. alert rules
5. billing later
6. API endpoints
7. websocket updates
8. scheduled tasks
9. historical analytics

Django is the best fit because it gives you:

1. mature auth
2. admin panel
3. solid ORM
4. straightforward multi-tenant evolution later
5. strong ecosystem for payments, email, auth, background tasks

DRF gives:

1. API endpoints
2. serializers
3. permissions
4. pagination

Channels gives:

1. websocket support for live device status

Celery gives:

1. alert processing
2. scheduled cleanup
3. device offline checks
4. report generation

## When FastAPI Would Be Better

FastAPI is great for:

1. pure API-first systems
2. very async-heavy IO flows
3. simpler control planes

But for this product, Django is better because the product is not just ingestion. It is also:

1. accounts
2. dashboards
3. admin tooling
4. billing
5. rule management
6. product operations

So for this product:

`Django is the better business backend`

## Backend Stack

Recommended backend stack:

1. `Django`
2. `Django REST Framework`
3. `Django Channels`
4. `Celery`
5. `Redis`
6. `PostgreSQL`
7. `uvicorn` or `daphne` for ASGI
8. `gunicorn` if needed in production with ASGI setup

## Database Choice

### Recommendation

Use:

`PostgreSQL`

## Why

You need:

1. reliable relational data
2. indexing
3. time-based queries
4. filtering across users, devices, processes, and events
5. JSON support for flexible metadata

PostgreSQL is the right default for:

1. users
2. devices
3. snapshots
4. process history
5. alerts
6. audit events
7. billing records

## Cache / Queue

### Recommendation

Use:

`Redis`

Use it for:

1. Celery broker
2. websocket channel layer
3. short-lived caches
4. rate limiting later

## Frontend Choice

### Recommendation

Use:

`Next.js`

## Why

You need:

1. product dashboard
2. landing page
3. auth flows
4. responsive tables/charts
5. future billing/settings pages

Next.js is the best fit because it gives:

1. fast dashboard development
2. SSR/SEO for marketing pages
3. good React ecosystem
4. one web app for both product and website

## Frontend Stack

Recommended frontend stack:

1. `Next.js`
2. `TypeScript`
3. `Tailwind CSS`
4. `TanStack Query`
5. `Zustand` for light client state
6. `shadcn/ui` or a clean custom component layer
7. `Recharts` or `Chart.js` for visualizations

## Agent Choice

### Recommendation

Use:

`Go core agent for macOS, Windows, and Linux`

Keep the Python agent only as an MVP bridge while the Go agent hardens.

## Why Go Is The Better Long-Term Agent

You need:

1. stable cross-platform binaries
2. stronger daemon/service operation
3. easier packaging and updates
4. a better base for low-level collectors later

Go is the better agent language because it gives:

1. single-binary builds
2. easier cross-compilation
3. better long-running process characteristics
4. stronger trust for systems software than a script-only agent

## Platform-Specific Deep Telemetry

Use the Go core agent as the portable control layer, then add native collectors by platform:

1. Linux: `eBPF`
2. Windows: `ETW`
3. macOS: `Endpoint Security` / System Extensions

Do not pretend these are identical across OSes. The right architecture is one core agent with platform-native extensions.

## Mobile App Choice

### Recommendation

For mobile:

1. Android: native `Kotlin`
2. iPhone: native companion app only

## Why

Mobile should not share the desktop agent implementation.

### Android

Use a native Kotlin collector because Android exposes platform-specific usage and network APIs and has its own permission/background model.

### iPhone

Use iPhone only as a companion surface for alerts and status. Do not design the architecture around full device parity because iOS does not allow general system-wide process monitoring across other apps.
3. recent suspicious activity
4. push notifications
5. basic dashboard summaries

Expo is best because:

1. faster iteration
2. simpler cross-platform setup
3. easier notifications
4. good for dashboard-style mobile apps

## Important Mobile Product Rule

Do not make mobile a version 1 dependency.

Version 1 should work fully as:

1. desktop agent
2. web dashboard

Mobile should come later as:

1. companion app
2. alert viewer
3. quick status app

Not as the primary product surface.

## Agent Architecture

The agent should be:

1. lightweight
2. cross-platform
3. installable per device
4. authenticated per device
5. resilient to temporary network failure

Recommended agent approach:

1. `Python` for version 1
2. local collector loop
3. snapshot batching
4. signed API key per device
5. retry queue
6. heartbeat endpoint

Later, if needed:

1. Rust or Go agent for better performance/distribution

But not yet.

## Best System Shape

### Version 1

Use this architecture:

1. `Agent`
   Collects device/process snapshots and sends them to backend.
2. `Django API`
   Receives snapshots, stores data, manages users/devices/rules.
3. `PostgreSQL`
   Stores all durable product data.
4. `Redis`
   Handles queue + websocket layer.
5. `Celery`
   Runs alerts, offline checks, and scheduled jobs.
6. `Next.js frontend`
   Main dashboard and landing page.

## Suggested Backend Modules

Keep the backend split by domain:

1. `accounts`
2. `devices`
3. `snapshots`
4. `processes`
5. `alerts`
6. `audit`
7. `notifications`
8. `billing` later

Do not over-model version 1.

## Suggested Core Data Model

Core entities:

1. `User`
2. `Device`
3. `DeviceApiKey`
4. `Snapshot`
5. `ProcessRecord`
6. `AlertRule`
7. `AlertEvent`
8. `AuditEvent`

Optional later:

1. `Workspace`
2. `TeamMembership`
3. `Subscription`

## Realtime Design

Use websockets only for:

1. device online/offline changes
2. latest snapshot updates
3. active alerts

Do not stream everything live all the time.

Keep the historical data path as normal REST APIs.

## Deployment Shape

### Recommended

1. `Backend` container
2. `Frontend` container
3. `PostgreSQL`
4. `Redis`
5. `Celery worker`
6. `Nginx` or platform edge

## Hosting Direction

Good production hosting options:

1. web frontend on `Vercel`
2. backend on `Railway`, `Render`, `Fly.io`, or a VPS
3. PostgreSQL managed DB
4. Redis managed instance

Or:

1. full Docker deployment on one VPS for early stage simplicity

## Best Version 1 Recommendation

If the goal is speed plus maintainability:

### Backend

`Django + DRF + Channels + Celery`

### Database

`PostgreSQL`

### Queue / Realtime

`Redis`

### Frontend

`Next.js + TypeScript + Tailwind + TanStack Query`

### Mobile

`Expo React Native`, but only as a phase 2 companion app

### Agent

`Python` agent first

## Final Architecture Recommendation

The best stack for this app is:

1. `Python agent`
2. `Django modular monolith backend`
3. `PostgreSQL`
4. `Redis`
5. `Celery`
6. `Next.js web app`
7. `Expo React Native companion app later`

This is the best balance of:

1. shipping speed
2. product depth
3. maintainability
4. future SaaS expansion
