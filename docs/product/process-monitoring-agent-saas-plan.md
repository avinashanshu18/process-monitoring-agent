# Process Monitoring Agent SaaS Plan

## Product Position

Working category:

`Personal security and device visibility dashboard`

Working one-line pitch:

`A privacy-first dashboard that shows what your devices are doing, what changed, and what needs attention.`

## Ideal Customer Profile

Best first users:

1. developers with multiple machines
2. freelancers with a laptop + desktop + VPS
3. founders managing a few work devices
4. privacy-conscious power users
5. technically comfortable users who want control over their own devices

Do not target enterprise teams first.

Do not target family surveillance first.

## Core User Problems

The product should solve these:

1. I do not know what is running on my machines.
2. I want to see when something unusual appears.
3. I want one dashboard for all my devices.
4. I want lightweight health and security visibility without enterprise tooling.
5. I want a history of changes without manually checking each device.

## MVP Scope

Version 1 should include:

1. account login
2. device registration with per-device API key
3. device online/offline status
4. latest process snapshot
5. process history view
6. CPU and memory summary
7. new-process detection
8. basic suspicious activity rules
9. simple alerts
10. dashboard for all registered devices

## MVP Alert Rules

Start with simple rules:

1. new process first seen on device
2. process name matches watchlist
3. unusually high CPU usage
4. unusually high memory usage
5. device has not checked in recently

Do not add complex ML or anomaly detection first.

## Platform Scope

Version 1:

1. Mac
2. Windows
3. Linux

Mobile:

- not a priority for version 1
- can be limited companion data later

## Feature Tiers

### Free

1. up to 2 devices
2. basic dashboard
3. latest snapshot
4. limited history
5. basic alerts

### Pro

1. 5 to 10 devices
2. full process history
3. custom watchlists
4. email or Slack alerts
5. longer retention
6. audit timeline

### Team

1. more devices
2. shared dashboard
3. multiple users
4. role-based access
5. team alert channels

## Pricing Direction

Possible early pricing:

1. Free: 2 devices
2. Pro: `$6 to $12/month`
3. Team: `$20 to $49/month`

Alternative:

per-device pricing after the free tier

Do not overprice it like enterprise observability tools.

## Product Differentiation

The product should be different from generic monitoring tools by focusing on:

1. privacy-first personal use
2. process-level visibility
3. device change tracking
4. lightweight setup
5. security-aware alerts instead of noisy observability

## What To Say It Is

Good positioning:

1. `personal endpoint visibility`
2. `device activity dashboard`
3. `private process and device monitoring`
4. `lightweight device security visibility`

Avoid saying:

1. `Datadog competitor`
2. `full observability platform`
3. `all-device surveillance suite`

## Productionization Priority

### Phase 1: Make Existing Product Honest And Stable

1. remove inflated enterprise language
2. clean README and setup
3. verify backend starts cleanly
4. verify frontend starts cleanly
5. verify agent can send snapshots end to end

### Phase 2: Lock Core Product Flow

1. register device
2. issue API key
3. ingest snapshot
4. view current processes
5. view history
6. show device status

### Phase 3: Add Real Product Features

1. alerts
2. watchlists
3. better dashboard
4. retention policy
5. audit timeline

### Phase 4: SaaS Readiness

1. auth hardening
2. multi-device onboarding UX
3. billing
4. hosted deployment
5. polished landing page

## What To Build First In The Repo

The first production push should focus on:

1. backend API correctness
2. end-to-end ingestion
3. device dashboard UI
4. alert rules
5. setup and deployment docs

## Best Demo Story

Even before full SaaS launch, this can be shown as:

`A working personal device visibility prototype that monitors your machines, tracks process changes, and flags suspicious activity.`

## Recommended Immediate Next Step

Start by turning the current codebase into a reliable local working product with:

1. one backend
2. one frontend
3. one agent
4. one device registration flow
5. one simple alert system

That is the fastest path to a real product instead of a concept.
