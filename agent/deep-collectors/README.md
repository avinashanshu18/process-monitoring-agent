# HostLens Deep Collectors

These helpers feed privileged or platform-specific events into the Go core agent through a spool directory.

The Go agent drains `deep_collector_spool_dir` from [config.example.json](/Users/avinash/Desktop/process-monitoring-agent-repo/agent/go-core/config.example.json) and merges any helper envelopes into the normal snapshot upload.

Current helper projects:

- macOS Endpoint Security helper:
  [Package.swift](/Users/avinash/Desktop/process-monitoring-agent-repo/agent/deep-collectors/macos-endpoint-security/Package.swift)
- Linux eBPF helper:
  [run-ebpf-helper.sh](/Users/avinash/Desktop/process-monitoring-agent-repo/agent/deep-collectors/linux-ebpf/run-ebpf-helper.sh)
- Windows ETW helper:
  [HostLens.EtwHelper.csproj](/Users/avinash/Desktop/process-monitoring-agent-repo/agent/deep-collectors/windows-etw/HostLens.EtwHelper.csproj)

Envelope contract:

```json
{
  "source": "endpoint-security",
  "process_events": [],
  "network_events": [],
  "file_events": [],
  "auth_events": [],
  "dns_events": [],
  "service_inventory": [],
  "startup_items": [],
  "collector_capabilities": []
}
```

Operational notes:

- `endpoint-security` requires Apple entitlements and root approval.
- `ebpf` requires a Linux host with `bpftrace` or another eBPF loader installed.
- `etw` requires a Windows host with .NET runtime and ETW session permissions.
