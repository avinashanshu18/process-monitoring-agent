# MVP Specification

## Product

`Personal security and device visibility dashboard`

## Version 1 Goal

Ship a working product that lets a user:

1. register their own devices
2. install or run an agent on those devices
3. see whether devices are online
4. inspect current and recent processes
5. detect suspicious or unusual process activity
6. receive simple alerts

## Core Promise

`See what your devices are doing, what changed, and what needs attention.`

## Version 1 User

The primary version 1 user is:

1. one technically comfortable person
2. using their own devices
3. wanting visibility and security awareness

This is not yet:

1. team monitoring
2. family monitoring
3. enterprise endpoint management

## MVP Scope

### In Scope

1. user account
2. device registration
3. per-device API key
4. device heartbeat / online status
5. process snapshot ingestion
6. latest process snapshot view
7. process history view
8. basic system metrics:
   CPU
   memory
   disk
9. new-process detection
10. suspicious process watchlist matching
11. high CPU / high memory alerts
12. simple alert history

### Out of Scope

1. workspaces
2. teams
3. billing
4. role-based access complexity
5. native mobile companion app
6. full anomaly detection / ML
7. reports builder
8. compliance dashboards
9. storage/network/security mega-sections
10. advanced remote actions

## MVP User Flows

### Flow 1: Create Account

1. user signs up
2. user logs in
3. user lands on dashboard

### Flow 2: Register Device

1. user opens `Add Device`
2. backend creates a device record
3. backend issues a per-device API key
4. user copies install/config instructions

### Flow 3: Connect Agent

1. user runs agent on their machine
2. agent sends:
   hostname
   system metrics
   process list
3. backend authenticates device
4. backend stores snapshot and process records
5. dashboard shows device as online

### Flow 4: Inspect Activity

1. user sees device list
2. user selects one device
3. user sees:
   online status
   latest snapshot
   active processes
   top CPU / memory consumers
   recent history

### Flow 5: Receive Alert

1. backend detects a rule hit
2. alert is stored
3. alert appears in dashboard
4. optional email or in-app notification later

## Backend MVP Modules

Version 1 backend should be reduced to these domains:

1. `accounts`
2. `devices`
3. `snapshots`
4. `processes`
5. `alerts`
6. `audit`

If the current repo structure is messy, keep one backend codebase but simplify around these domains.

## Core Data Model

### User

Fields:

1. email
2. password hash
3. created_at

### Device

Fields:

1. id
2. owner
3. hostname
4. display_name
5. platform
6. os_version
7. architecture
8. api_key
9. monitoring_enabled
10. last_seen
11. status
12. created_at

### Snapshot

Fields:

1. id
2. device
3. created_at
4. cpu_percent
5. memory_percent
6. disk_percent
7. load / summary metrics

### ProcessRecord

Fields:

1. id
2. snapshot
3. pid
4. ppid
5. name
6. cpu_percent
7. memory_mb
8. first_seen flag or derived logic

### AlertRule

Fields:

1. id
2. owner
3. type
4. threshold / pattern
5. enabled

### AlertEvent

Fields:

1. id
2. owner
3. device
4. snapshot
5. type
6. severity
7. title
8. details
9. created_at
10. resolved_at

## MVP Alert Types

Version 1 should support only:

1. new process detected
2. watchlist process match
3. high CPU threshold exceeded
4. high memory threshold exceeded
5. device offline beyond threshold

## Backend API Surface

Version 1 should expose a simple API:

### Auth

1. `POST /api/auth/register`
2. `POST /api/auth/login`
3. `POST /api/auth/logout`
4. `GET /api/auth/me`

### Devices

1. `GET /api/devices`
2. `POST /api/devices`
3. `GET /api/devices/:id`
4. `PATCH /api/devices/:id`
5. `POST /api/devices/:id/regenerate-key`

### Agent Ingestion

1. `POST /api/agent/snapshots`
2. `POST /api/agent/heartbeat`

### Snapshots / Processes

1. `GET /api/devices/:id/latest`
2. `GET /api/devices/:id/snapshots`
3. `GET /api/devices/:id/processes`
4. `GET /api/devices/:id/history`

### Alerts

1. `GET /api/alerts`
2. `GET /api/alerts/:id`
3. `PATCH /api/alerts/:id/resolve`

## Frontend MVP Pages

Version 1 web app only needs:

1. login
2. register
3. dashboard
4. devices list
5. device detail page
6. alerts page
7. settings page for device keys / basic preferences

## Frontend Dashboard Sections

The dashboard should show:

1. total devices
2. online devices
3. active alerts
4. recent suspicious events
5. latest device activity

## Device Detail Page

The device detail page should show:

1. device status
2. latest metrics
3. active processes
4. top CPU processes
5. top memory processes
6. recent process history
7. device alerts

## What To Remove Or Ignore In Current Frontend

Do not treat these as MVP-critical:

1. compliance
2. costs
3. branding
4. workspaces
5. reports
6. predictions
7. mobile preview
8. users section
9. advanced storage/network/security feature buckets

These may remain in code temporarily, but they are not part of version 1.

## Realtime Requirements

Version 1 realtime should be minimal:

1. device online/offline changes
2. latest snapshot refresh
3. new active alerts

Everything else should work via standard API polling or page reload.

## Agent Requirements

The agent remains:

`Python`

Version 1 agent requirements:

1. lightweight
2. cross-platform
3. configurable via env or config file
4. authenticated per device
5. retry-safe
6. able to send:
   hostname
   process list
   basic system metrics

## MVP Success Criteria

Version 1 is successful when:

1. backend boots cleanly
2. frontend boots cleanly
3. user can create an account
4. user can register a device
5. agent can send snapshots
6. device appears online
7. process data is visible
8. at least three alert types work
9. the product is understandable without explaining internal architecture

## Technical Priority Order

1. make backend boot
2. make ingestion work
3. make dashboard show real data
4. add alert generation
5. clean onboarding UX

## Strategic Rule

If a feature does not directly improve:

1. visibility
2. change detection
3. security awareness

it should not be in version 1.
