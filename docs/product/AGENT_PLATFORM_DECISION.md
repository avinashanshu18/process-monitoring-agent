# Agent Platform Decision

Date: 2026-04-01

## Short answer

Python is acceptable for the current MVP agent because it gets HostLens shipping quickly on macOS, Linux, and Windows with `psutil` plus simple HTTP ingestion.

Python is not the best long-term foundation for a fleet-grade device agent.

## Why Python was reasonable for v1

- very fast iteration
- easy cross-platform process and system metrics through `psutil`
- easy packaging for internal testing and early customers
- good enough for a lightweight polling agent while the product is still proving demand

## Why Python is not the final answer

- weaker story for always-on background services
- harder auto-update and packaging story than a single compiled binary
- less access to low-level platform-native telemetry
- weaker trust signal for enterprise-style endpoint software than a compiled system agent
- not the best path if HostLens grows into deeper process, network, and security telemetry

## What serious competitors and adjacent tools use

### Datadog

Datadog’s official `datadog-agent` repository is a mixed codebase built around an agent core with Go and Python in the repo. That is the important pattern: a compiled core with extensibility, not a pure scripting-agent approach.

Source:

- https://github.com/DataDog/datadog-agent

### Tailscale

Tailscale’s official repository is Go-based. That fits their need for a secure cross-platform networking daemon and good single-binary distribution.

Source:

- https://github.com/tailscale/tailscale

### Osquery

Osquery is one of the strongest endpoint visibility references in the market. Its official project describes itself as SQL-powered operating system instrumentation and monitoring available for Linux, macOS, and Windows. The repo language breakdown is dominated by C++ and C, not Python.

Source:

- https://github.com/osquery/osquery

### Kolide

Kolide’s official docs say the Kolide Agent uses osquery to obtain device posture information and power features like device properties and live query. This is another strong signal that serious endpoint visibility products lean on native or near-native collectors rather than a thin Python script.

Source:

- https://www.kolide.com/docs/about-kolide/the-kolide-agent/about-osquery

## What is actually more advanced

There is no single language that gives best-in-class telemetry across macOS, Windows, Linux, Android, and iPhone.

The advanced architecture is:

1. a compiled cross-platform core agent
2. platform-native collectors where the OS allows them
3. mobile companion apps where the OS does not allow deep system-wide telemetry

## Best architecture for HostLens

### Desktop and server operating systems

For macOS, Windows, and Linux:

- use a Go core agent as the long-term direction
- keep the current Python agent only as the MVP bridge
- optionally integrate osquery-style collection for rich inventory and query surfaces later

Why Go:

- easy cross-compilation
- strong performance
- easier single-binary distribution
- better fit for long-running daemons/services
- widely used in serious infrastructure and networking agents

### Linux

If you want deeper visibility later, Linux can use eBPF. The Linux kernel docs describe eBPF as a sandboxed runtime in the kernel for instrumentation and tracing. That is far beyond what a simple Python user-space collector can do.

Source:

- https://docs.kernel.org/userspace-api/ebpf/index.html

### Windows

For deeper telemetry on Windows, ETW is the right native direction. Microsoft describes ETW as an efficient tracing mechanism for user-mode applications and kernel-mode drivers with low performance impact and dynamic enable/disable behavior.

Source:

- https://learn.microsoft.com/en-us/windows-hardware/drivers/devtest/event-tracing-for-windows--etw-

### macOS

For deeper security-grade telemetry on macOS, Apple’s system extensions and Endpoint Security path is the native direction. Apple explicitly says Endpoint Security requires an entitlement and runs as a system extension in user space.

Source:

- https://developer.apple.com/system-extensions/

## Mobile reality

### Android

Android can expose some usage and network information, but not the same depth as desktop platforms.

Official Android APIs include:

- `UsageStatsManager` for device usage history and statistics
- `NetworkStatsManager` for network usage history and statistics

Sources:

- https://developer.android.com/reference/kotlin/android/app/usage/UsageStatsManager
- https://developer.android.com/reference/android/app/usage/NetworkStatsManager.html

Recommended direction:

- a native Kotlin companion/collector app for Android
- limited telemetry compared with desktop agents
- focus on app usage, connectivity, alert viewing, and device posture summaries

### iPhone

iPhone is the hardest platform for this product idea.

Apple’s current Family Controls / Device Activity path only allows app and website usage information with entitlement approval and explicit user authorization. It is not a general third-party process-monitoring interface for all apps on the device.

Sources:

- https://developer.apple.com/documentation/bundleresources/entitlements/com.apple.developer.family-controls.app-and-website-usage
- https://developer.apple.com/documentation/xcode/configuring-family-controls

Recommended direction:

- do not promise deep process telemetry on iPhone
- use iPhone as a companion app for alerts, account access, and quick status
- if you later build an iOS usage product, treat it as a different feature line with Apple-specific constraints

## Final recommendation

### Right now

- keep Python for the MVP agent
- use it to harden product logic and customer workflows

### Next serious upgrade

- move the desktop/server agent to Go
- keep Django as the control-plane backend
- add native collectors by platform over time

### Product promise

HostLens should promise:

- deep device visibility on macOS, Windows, and Linux
- limited telemetry on Android
- companion experience on iPhone

Do not promise equal process-level visibility across every device class, because the operating systems do not allow that.
