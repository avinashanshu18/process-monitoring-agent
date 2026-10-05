param(
  [Parameter(Mandatory = $true)]
  [string]$BinaryPath,
  [Parameter(Mandatory = $true)]
  [string]$ServiceBinaryPath,
  [Parameter(Mandatory = $true)]
  [string]$ConfigPath,
  [string]$InstallDir = "C:\Program Files\HostLens",
  [string]$ServiceName = "HostLensAgent",
  [string]$DisplayName = "HostLens Agent"
)

$ErrorActionPreference = "Stop"

New-Item -ItemType Directory -Force -Path $InstallDir | Out-Null
Copy-Item $BinaryPath -Destination (Join-Path $InstallDir "hostlens-agent.exe") -Force
Copy-Item $ServiceBinaryPath -Destination (Join-Path $InstallDir "hostlens-service.exe") -Force
Copy-Item $ConfigPath -Destination (Join-Path $InstallDir "config.json") -Force

[Environment]::SetEnvironmentVariable(
  "HOSTLENS_AGENT_CONFIG",
  (Join-Path $InstallDir "config.json"),
  "Machine"
)

try {
  Unregister-ScheduledTask -TaskName "HostLens Agent" -Confirm:$false -ErrorAction SilentlyContinue
} catch {
}

try {
  Stop-Service -Name $ServiceName -ErrorAction SilentlyContinue
} catch {
}

& sc.exe delete $ServiceName | Out-Null
Start-Sleep -Seconds 1

$serviceExe = Join-Path $InstallDir "hostlens-service.exe"
& sc.exe create $ServiceName binPath= "`"$serviceExe`"" start= auto obj= "LocalSystem" DisplayName= "`"$DisplayName`"" | Out-Null
& sc.exe description $ServiceName "HostLens first-party Windows service wrapper" | Out-Null

Start-Service -Name $ServiceName

Write-Host "HostLens agent installed to $InstallDir"
Write-Host "Windows service: $ServiceName"
