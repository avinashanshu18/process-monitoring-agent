# HostLens Go Core Agent

This is the primary desktop and server agent for HostLens.

## Purpose

Use this Go agent as the installable collector for:

- macOS
- Windows
- Linux

The Python agent remains available only as a legacy MVP fallback.

## Why Go

- single compiled binary distribution
- easier service and daemon packaging
- stronger always-on agent behavior
- better fit for future native collectors such as:
  - Linux `eBPF`
  - Windows `ETW`
  - macOS `Endpoint Security`

## Current scope

The current Go agent already collects:

- stable `agent_id`
- hostname and OS identity
- CPU, memory, disk
- network totals
- uptime
- listening ports
- active user count
- process inventory

## Configuration

Copy the example config:

```bash
cp config.example.json config.json
```

Fields:

- `endpoint`
- `api_key`
- `agent_id`
- `device_type`
- `hostname_override`
- `interval_seconds`
- `release_manifest_url`
- `release_channel`
- `auto_update`

`agent_id` is generated on first run if it is blank.
Installed agents now use the published release manifest to stay on the current stable build.

## Run locally

Long-running daemon mode:

```bash
cd /Users/avinash/Desktop/process-monitoring-agent-repo/agent/go-core
go mod tidy
go run ./cmd/hostlens-agent
```

One-shot validation run:

```bash
go run ./cmd/hostlens-agent --once
```

Print the current version:

```bash
go run ./cmd/hostlens-agent --version
```

## Build

```bash
go build -o bin/hostlens-agent ./cmd/hostlens-agent
```

## Install assets

HostLens now includes service packaging baselines for desktop/server rollout:

- macOS `launchd`: [deploy/macos/com.hostlens.agent.plist](/Users/avinash/Desktop/process-monitoring-agent-repo/agent/go-core/deploy/macos/com.hostlens.agent.plist)
- macOS packaged installer flow: [deploy/macos/README.md](/Users/avinash/Desktop/process-monitoring-agent-repo/agent/go-core/deploy/macos/README.md)
- Linux `systemd`: [deploy/linux/hostlens-agent.service](/Users/avinash/Desktop/process-monitoring-agent-repo/agent/go-core/deploy/linux/hostlens-agent.service)
- Windows service rollout: [deploy/windows/README.md](/Users/avinash/Desktop/process-monitoring-agent-repo/agent/go-core/deploy/windows/README.md)

Install scripts are also included for the current founder-led rollout:

- macOS installer: [deploy/macos/install.sh](/Users/avinash/Desktop/process-monitoring-agent-repo/agent/go-core/deploy/macos/install.sh)
- macOS package builder: [deploy/macos/build-pkg.sh](/Users/avinash/Desktop/process-monitoring-agent-repo/agent/go-core/deploy/macos/build-pkg.sh)
- macOS control command: [deploy/macos/hostlensctl](/Users/avinash/Desktop/process-monitoring-agent-repo/agent/go-core/deploy/macos/hostlensctl)
- Linux installer: [deploy/linux/install.sh](/Users/avinash/Desktop/process-monitoring-agent-repo/agent/go-core/deploy/linux/install.sh)
- Windows installer: [deploy/windows/install.ps1](/Users/avinash/Desktop/process-monitoring-agent-repo/agent/go-core/deploy/windows/install.ps1)
- Windows service wrapper: [cmd/hostlens-service/main_windows.go](/Users/avinash/Desktop/process-monitoring-agent-repo/agent/go-core/cmd/hostlens-service/main_windows.go)

Quick example:

```bash
cp config.example.json config.json
go build -o bin/hostlens-agent ./cmd/hostlens-agent
sudo bash deploy/macos/install.sh bin/hostlens-agent config.json
```

To build the web-download release binaries used by the install page:

```bash
bash scripts/build-release-bundles.sh
```

## Platform roadmap

- Linux deep telemetry: `eBPF`
- Windows deep telemetry: `ETW`
- macOS security-grade telemetry: `Endpoint Security` / System Extensions

These deep collectors are planned as platform-specific modules on top of the Go core, not as fake cross-platform parity claims.
