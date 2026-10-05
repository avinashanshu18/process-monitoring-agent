//go:build windows

package platformsignals

import (
	"os/exec"

	"hostlens-go-agent/internal/model"
)

func DeepCollectors() []string {
	return []string{"gopsutil", "windows-event-log", "service-wrapper"}
}

func SecurityMode() string {
	return "windows-userspace-active"
}

func CollectorCapabilities() []model.CollectorCapability {
	return []model.CollectorCapability{
		{Name: "gopsutil", Layer: "userspace", State: "active", Detail: "Host metrics, process list, sockets, and sessions."},
		{Name: "windows-event-log", Layer: "native-log", State: capabilityState(commandAvailable("powershell")), Detail: "Auth, DNS, and service signals via PowerShell/Event Log."},
		{Name: "windows-service", Layer: "service-wrapper", State: "active", Detail: "The HostLens service wrapper can run the agent continuously."},
		{Name: "etw", Layer: "kernel-bridge", State: etwState(), Detail: "Requires an ETW collector helper for high-fidelity event streaming."},
	}
}

func etwState() string {
	if commandAvailable("wevtutil") {
		return "available"
	}
	return "not-enabled"
}

func commandAvailable(name string) bool {
	_, err := exec.LookPath(name)
	return err == nil
}

func capabilityState(active bool) string {
	if active {
		return "active"
	}
	return "unavailable"
}
