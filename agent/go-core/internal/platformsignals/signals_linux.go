//go:build linux

package platformsignals

import (
	"os"
	"os/exec"

	"hostlens-go-agent/internal/model"
)

func DeepCollectors() []string {
	return []string{"gopsutil", "linux-auth-log", "fsnotify", "systemd-scan"}
}

func SecurityMode() string {
	return "linux-userspace-active"
}

func CollectorCapabilities() []model.CollectorCapability {
	return []model.CollectorCapability{
		{Name: "gopsutil", Layer: "userspace", State: "active", Detail: "Host metrics, processes, sockets, and sessions."},
		{Name: "fsnotify", Layer: "userspace", State: "active", Detail: "Recursive file monitoring on tracked paths."},
		{Name: "systemd-scan", Layer: "userspace", State: capabilityState(commandAvailable("systemctl")), Detail: "Runtime service and unit-file inventory."},
		{Name: "linux-auth-log", Layer: "native-log", State: capabilityState(commandAvailable("journalctl")), Detail: "Session and auth event parsing from journalctl/auth logs."},
		{Name: "ebpf", Layer: "kernel-bridge", State: ebpfState(), Detail: "Requires an eBPF-capable kernel and helper loader."},
	}
}

func ebpfState() string {
	if _, err := os.Stat("/sys/fs/bpf"); err == nil {
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
