# HostLens macOS Package Flow

This is the installable macOS distribution path for HostLens.

## What ships

- `HostLens-macOS-Installer.pkg`
- `hostlensctl` control command
- `LaunchDaemon` at `/Library/LaunchDaemons/com.hostlens.agent.plist`
- agent binary at `/Library/Application Support/HostLens/hostlens-agent`
- template config at `/Library/Application Support/HostLens/config.template.json`

## Customer flow

1. Download `HostLens-macOS-Installer.pkg`
2. Download `hostlens-config.json` from the web app
3. Install the package
4. Import the config:

```bash
sudo hostlensctl import-config "$HOME/Downloads/hostlens-config.json"
```

5. Claim the device in the HostLens web workspace

## Build locally

```bash
go build -o bin/hostlens-agent-darwin-universal ./cmd/hostlens-agent
bash deploy/macos/build-pkg.sh bin/hostlens-agent-darwin-universal ./HostLens-macOS-Installer.pkg 0.1.0
```

## Notes

- the package is currently unsigned
- notarization and Developer ID signing are still required before customer-facing production rollout
- the package installs a background service, not a foreground desktop UI app
