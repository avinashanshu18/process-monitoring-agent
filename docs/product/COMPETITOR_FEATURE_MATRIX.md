# HostLens Competitor Feature Matrix

Updated: April 2, 2026

## Goal

Map the current HostLens raw feature surface against the closest benchmark products so we know:

1. what HostLens already covers
2. what raw features competitors visibly advertise
3. what gaps still matter before charging `$39/month`

This document is intentionally focused on raw feature parity, not brand, trust, or GTM.

## Competitors used for comparison

- Datadog Infrastructure + Live Processes
- Fleet Premium
- Better Stack infrastructure / logs / traces
- Tailscale Starter
- 1Password Extended Access Management / Kolide device trust

Official references:

- Datadog Live Processes: `https://docs.datadoghq.com/infrastructure/process/`
- Datadog pricing: `https://www.datadoghq.com/pricing/list/`
- Fleet pricing: `https://fleetdm.com/pricing`
- Better Stack pricing: `https://betterstack.com/pricing`
- Tailscale pricing: `https://tailscale.com/pricing`
- 1Password / Kolide mobile device trust: `https://1password.com/blog/introducing-mobile-checks-for-device-trust`

## Current HostLens raw surface

Current live HostLens snapshot capability from the repo and local runtime:

- host inventory
- process snapshots
- process lifecycle events
- current socket inventory
- network lifecycle events
- DNS events
- software inventory
- signer and hash metadata
- startup items
- service inventory
- file integrity items
- file events
- auth events
- session visibility
- alert lifecycle
- compare workspace
- investigations workspace
- notification preferences
- team workspaces
- mobile companion heartbeat path
- collector capability reporting

Latest local runtime sample when this file was updated:

- `412` processes
- `74` software items
- `120` services
- `23` startup items
- `200` integrity items
- `16` auth events
- `10` network lifecycle events
- `20` process lifecycle events

## Feature matrix

Legend:

- `Yes` = clearly present in product or repo now
- `Partial` = present but not yet deep, validated, or production-hardened
- `No` = materially missing

| Capability | HostLens | Datadog | Fleet Premium | Better Stack | Tailscale | 1Password / Kolide |
|---|---|---|---|---|---|---|
| Device inventory | Yes | Partial | Yes | Partial | Yes | Yes |
| Process snapshots | Yes | Yes | Partial | Partial | No | Partial |
| Process lifecycle events | Partial | Yes | Partial | Partial | No | Partial |
| Network connection inventory | Yes | Yes | Partial | Partial | Yes | No |
| Network lifecycle events | Partial | Partial | No | Partial | Partial | No |
| DNS event visibility | Partial | Partial | No | Partial | No | No |
| Software inventory | Yes | Partial | Yes | No | Partial | Yes |
| Signer / hash trust | Yes | Partial | Partial | No | No | Partial |
| Startup persistence inventory | Yes | Partial | Yes | No | No | Partial |
| Service / daemon runtime inventory | Yes | Partial | Partial | Partial | No | No |
| File integrity monitoring | Partial | Partial | Yes | No | No | Partial |
| File event stream | Partial | Partial | Partial | No | No | No |
| Auth / session history | Partial | Partial | Partial | No | Partial | Yes |
| Mobile telemetry | Partial | No | Yes | No | Partial | Yes |
| Mobile compliance checks | No | No | Yes | No | No | Yes |
| Disk encryption posture | Yes | Partial | Yes | No | No | Yes |
| Firewall posture | Yes | Partial | Partial | No | No | Partial |
| AV / security tool posture | Yes | Partial | Partial | No | No | Yes |
| MDM posture | Yes | No | Yes | No | No | Yes |
| Browser / system extensions | Yes | No | Partial | No | No | Partial |
| Alerts and rules | Yes | Yes | Yes | Yes | Partial | Yes |
| Delivery to email / Slack / webhook | Partial | Yes | Yes | Yes | No | Partial |
| Team roles / shared workspace | Yes | Yes | Yes | Yes | Yes | Yes |
| Investigation / case view | Partial | Yes | Partial | Yes | No | Partial |
| Compare snapshots / drift review | Yes | Partial | Partial | Partial | No | Partial |
| Policy enforcement / remediation | No | Partial | Yes | No | Yes | Yes |
| Lock / wipe / command execution | No | No | Yes | No | No | No |
| Vulnerability / CVE scoring | No | Partial | Yes | No | No | Partial |
| Audit log / RBAC / SSO / SCIM depth | Partial | Yes | Yes | Yes | Yes | Yes |
| Signed installers / trust chain | Partial | Yes | Yes | Yes | Yes | Yes |

## Competitor readout

### Datadog

Datadog is broad infrastructure and security platform competition, not a clean HostLens substitute.

What it clearly has that HostLens still lacks:

- deeper workflow / incident platform
- mature mobile app
- stronger network and workload protection depth
- stronger integrations and enterprise governance
- stronger trust and packaging

Relevant official signals:

- Datadog lists Infrastructure Pro at `$15` per infra host per month billed annually.
- Datadog also advertises workflow automation, incident response, case management, event management, fleet automation, and a mobile app on the pricing and docs surfaces.

### Fleet Premium

Fleet is the hardest raw-feature benchmark because it is very explicit about endpoint features.

What Fleet clearly advertises that HostLens still lacks:

- multi-platform MDM support
- zero-touch setup
- device remediation
- application deployment
- lock and wipe
- script execution as a product surface
- strong policy enforcement
- broader FIM posture
- incident response and malware detection
- vulnerability scores and CISA KEV alignment

Relevant official signals:

- Fleet Premium is listed at `$7.00 / host / month`
- Fleet pricing explicitly lists `File integrity monitoring`, `Incident response`, `Malware detection`, `Enforce disk encryption`, `Application deployment`, `Send lock and wipe commands`, and `Script execution`

### Better Stack

Better Stack is not a direct endpoint competitor, but it is a strong incident and monitoring competitor for small teams.

What Better Stack clearly wins on:

- integrated on-call
- incident management
- logs / traces / metrics surface maturity
- anomaly detection alerts
- strong hosted polish and delivery

What HostLens can still beat Better Stack on:

- endpoint-specific process, software, auth, persistence, and device trust views

### Tailscale

Tailscale is not a process-monitoring competitor. It competes on secure access, deployment ease, and trust.

What it shows the market expects:

- dead-simple install
- excellent device identity
- small-team pricing clarity
- strong trust and packaging

Relevant official signal:

- Tailscale Starter is listed at `$6 per active user / month`

### 1Password / Kolide device trust

This is the strongest benchmark for mobile and device-trust style checks.

What it clearly shows:

- mobile device trust can be commercial
- MDM enrollment, jailbreak/root status, passcode configuration, and mobile OS update checks are real buyer features

HostLens is still behind here.

## What HostLens must add for raw-feature credibility

These are the biggest raw features still missing if the goal is "look stronger on paper" for a `$39/month` small-team offer.

### Tier 1

- policy engine with saved checks
- remediation / response actions
- mobile compliance checks
- vulnerability / patch posture
- live query / custom checks

### Tier 2

- agent command execution
- lock / isolate / remediation actions
- richer auth event model
- deeper Windows parity
- better long-range network history

### Tier 3

- zero-touch enrollment
- managed policy packs
- asset discovery across subnets
- stronger case workflow
- stronger reporting / compliance exports

## What HostLens can realistically exceed

HostLens should not try to exceed Datadog or Fleet on total breadth.

It can exceed them in a small-team package by combining more of these into one simple product:

- process visibility
- software trust
- startup persistence
- service inventory
- auth/session context
- file integrity
- mobile companion state
- deep collector control
- fast small-team workflow

That bundle is a better path than trying to beat enterprise platforms category-by-category.
