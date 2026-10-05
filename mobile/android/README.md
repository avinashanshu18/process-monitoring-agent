# HostLens Android Collector Direction

HostLens should use a native Kotlin Android app for mobile collection.

## Why Android is separate from the Go desktop agent

Android has its own permission and lifecycle model. A desktop/server daemon architecture does not map cleanly onto Android app execution rules.

## Recommended Android data sources

- `UsageStatsManager` for usage history and app activity summaries
- `NetworkStatsManager` for network usage summaries
- notification and foreground-service flows where needed

## Product role

Android should be treated as:

- limited telemetry compared with desktop
- useful for mobile posture summaries
- suitable for quick visibility and future companion features

It should not be marketed as equal to desktop process-level visibility.
