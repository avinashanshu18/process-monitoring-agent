//go:build darwin

package platformsignals

import (
	"os"
	"os/exec"

	"hostlens-go-agent/internal/model"
)

func DeepCollectors() []string {
	return []string{"codesign", "fsnotify", "gopsutil", "launchd-scan", "unified-log"}
}

func SecurityMode() string {
	return "darwin-userspace-active"
}

func CollectorCapabilities() []model.CollectorCapability {
	return []model.CollectorCapability{
		{Name: "gopsutil", Layer: "userspace", State: "active", Detail: "Host metrics, process list, sockets, and sessions."},
		{Name: "fsnotify", Layer: "userspace", State: "active", Detail: "Targeted file activity tracking is enabled."},
		{Name: "launchd-scan", Layer: "userspace", State: "active", Detail: "Launch agent and daemon inventory is enabled."},
		{Name: "unified-log", Layer: "native-log", State: capabilityState(commandAvailable("log")), Detail: "DNS and auth signals from the unified log."},
		{Name: "codesign", Layer: "native-tool", State: capabilityState(commandAvailable("codesign")), Detail: "Software signature inspection through codesign."},
		{Name: "endpoint-security", Layer: "kernel-bridge", State: endpointSecurityState(), Detail: "Needs a privileged helper with Endpoint Security entitlement."},
	}
}

func endpointSecurityState() string {
	if _, err := os.Stat("/Library/SystemExtensions"); err == nil {
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
