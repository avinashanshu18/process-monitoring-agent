# HostLens Windows install path

HostLens now ships a first-party Windows Service wrapper for the Go agent.

## What ships

- `hostlens-agent.exe`
- `hostlens-service.exe`
- `install-windows.ps1`

## Service model

- installs to `C:\Program Files\HostLens`
- stores `config.json` in the install directory
- sets `HOSTLENS_AGENT_CONFIG` at machine scope
- registers `HostLensAgent` as a Windows service under `LocalSystem`
- writes wrapper logs to `C:\ProgramData\HostLens\logs\service.log`
- checks the release manifest before launch and updates `hostlens-agent.exe` when a newer stable build is available

## Recommended install

```powershell
powershell -ExecutionPolicy Bypass -File .\install-windows.ps1 `
  -BinaryPath .\hostlens-agent.exe `
  -ServiceBinaryPath .\hostlens-service.exe `
  -ConfigPath "$env:USERPROFILE\Downloads\hostlens-config.json"
```

## Notes

- the service wrapper launches `hostlens-agent.exe` from the same install directory
- this replaces the old scheduled-task rollout path
- signing is still required before broad customer-facing Windows rollout
