# HostLens Mobile Collector

This Expo app now acts as a real signed-in mobile telemetry companion for Android and iPhone.

Current scope:

- sign in with HostLens credentials
- collect supported mobile telemetry from the device
- post signed mobile heartbeats to `/api/v1/mobile/heartbeat/`
- view tracked devices and active alerts
- refresh the mobile workspace

Telemetry currently posted from the app:

- device name and platform
- OS version
- manufacturer and model
- app version
- battery level and charging state
- low power mode
- network type and reachability
- total memory when the platform exposes it
- timezone and locale

This is a real mobile collector path, but it is still limited by platform rules:

- Android can go deeper later with native usage and network APIs.
- iPhone remains a constrained companion surface and does not provide desktop-style process telemetry.
