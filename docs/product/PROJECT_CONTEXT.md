# Project Context

## Working Repo

`/Users/avinash/Desktop/process-monitoring-agent-repo`

This repo is now the main working location for the new product direction.

## What We Decided

Do not treat this project as generic process monitoring only.

Do not position it as a productivity app first.

The chosen direction is:

`Personal security and device visibility dashboard`

## Why This Direction Won

We compared two directions:

1. `Personal productivity`
2. `Personal security / device visibility`

We chose the second option because it fits:

1. the current codebase
2. your cybersecurity positioning
3. a more differentiated market angle
4. a clearer SaaS story

## Product Promise

Core promise:

`A privacy-first dashboard that shows what your devices are doing, what changed, and what needs attention.`

Better framing:

`See what is happening on your devices, detect unusual activity early, and keep a private record of device health and process changes.`

## What This Product Should Help Users Answer

1. Which devices are online right now?
2. What processes are running on them?
3. What changed today?
4. Is anything unusual or suspicious?
5. Which device needs attention?

## Markets Discussed

We discussed whether this could become:

1. personal productivity software
2. personal security / device visibility software
3. family monitoring
4. small-team endpoint visibility

The conclusion:

- personal productivity is possible but crowded
- personal security / device visibility is a better first wedge
- family monitoring has more legal/privacy complexity
- small-team endpoint visibility can be a later expansion

## Best Initial Audience

1. developers
2. freelancers
3. founders
4. privacy-conscious users
5. users with multiple laptops/desktops

## Product Category

Best category labels:

1. `personal endpoint visibility`
2. `device activity dashboard`
3. `private process and device monitoring`
4. `lightweight device security visibility`

## What To Avoid Claiming

Do not position this as:

1. a Datadog competitor
2. a full observability platform
3. spyware
4. employee surveillance software
5. a deep mobile monitoring suite

## MVP Direction

The MVP should include:

1. account login
2. device registration with per-device API key
3. device online/offline status
4. latest process snapshot
5. process history
6. CPU and memory summary
7. new-process detection
8. basic suspicious activity rules
9. simple alerts
10. dashboard for all registered devices

## First Alert Rules

Start with:

1. new process first seen on device
2. process name matches watchlist
3. unusually high CPU usage
4. unusually high memory usage
5. device has not checked in recently

## Platform Scope

Version 1 should prioritize:

1. Mac
2. Windows
3. Linux

Mobile monitoring should not be a core requirement for version 1.

## Product Strategy Relative To Other Repos

We decided:

1. `cyberfurl` is your real current SaaS and should be left aside for this thread
2. `social-media-autopilot-` is a strong prototype/demo candidate, but too broad to productionize first
3. `process-monitoring-agent` is the best repo to productionize first after `cyberfurl`

## Why This Repo Goes First

Compared with `social-media-autopilot-`, this repo is:

1. narrower
2. easier to harden
3. easier to explain
4. closer to a realistic first SaaS
5. better aligned with a security/device-visibility niche

## Product Naming Ideas Discussed

Possible names discussed:

1. `DeviceWatch`
2. `HostLens`
3. `ProcessGuard`
4. `NodeWatch`
5. `DevicePulse`
6. `WatchMyDevices`
7. `Local Sentinel`

These are naming directions only, not final decisions.

## Pricing Direction

Early pricing model discussed:

1. Free tier for 1 to 2 devices
2. Pro tier around `$6 to $12/month`
3. Team tier around `$20 to $49/month`

Alternative:

- per-device pricing after free tier

## Existing Planning Docs Moved Into Repo

These files were created from this conversation and moved into this repo:

1. `docs/product/process-monitoring-agent-product-direction.md`
2. `docs/product/process-monitoring-agent-saas-plan.md`
3. `docs/product/PROJECT_CONTEXT.md`

## Execution Order

Recommended execution order:

1. clean setup and docs
2. verify backend runs
3. verify frontend runs
4. verify agent ingests snapshots end-to-end
5. lock device dashboard
6. add simple alerts
7. improve onboarding and product polish

## Practical Rule For Future Work

Every future decision in this repo should be filtered through this question:

`Does this improve personal security and device visibility for a user managing their own devices?`

If not, it is probably not version 1 work.
