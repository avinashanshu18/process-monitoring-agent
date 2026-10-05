package collector

import (
	"bufio"
	"encoding/json"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"sort"
	"strings"

	"hostlens-go-agent/internal/model"
	"hostlens-go-agent/internal/platformsignals"
)

func collectSecurityPosture(services []model.ServiceItem) model.SecurityPosture {
	posture := model.SecurityPosture{
		Mode:                  platformsignals.SecurityMode(),
		CollectorMode:         platformsignals.SecurityMode(),
		CollectorCapabilities: platformsignals.CollectorCapabilities(),
	}

	switch runtime.GOOS {
	case "darwin":
		posture.FirewallState, posture.FirewallDetails = macFirewallState()
		posture.DiskEncryptionState, posture.DiskEncryptionDetail = macEncryptionState()
		posture.AntivirusState, posture.AntivirusProducts = macAntivirusState(services)
		posture.GatekeeperState = macGatekeeperState()
		posture.SIPState = macSIPState()
		posture.MDMState = macMDMState()
		posture.SystemExtensions = macSystemExtensions()
		posture.USBDevices = macUSBDevices()
		posture.BrowserExtensions = browserExtensions()
	case "linux":
		posture.FirewallState, posture.FirewallDetails = linuxFirewallState()
		posture.DiskEncryptionState, posture.DiskEncryptionDetail = linuxEncryptionState()
		posture.AntivirusState, posture.AntivirusProducts = linuxAntivirusState(services)
		posture.USBDevices = linuxUSBDevices()
		posture.BrowserExtensions = browserExtensions()
	case "windows":
		posture.FirewallState, posture.FirewallDetails = windowsFirewallState()
		posture.DiskEncryptionState, posture.DiskEncryptionDetail = windowsEncryptionState()
		posture.AntivirusState, posture.AntivirusProducts = windowsAntivirusState()
		posture.USBDevices = windowsUSBDevices()
		posture.BrowserExtensions = browserExtensions()
		posture.ScheduledTasksCount = len(collectWindowsStartupItems())
	}

	if posture.BrowserExtensions == nil {
		posture.BrowserExtensions = browserExtensions()
	}

	return posture
}

func macAntivirusState(services []model.ServiceItem) (string, []string) {
	candidates := make([]string, 0, 4)
	for _, service := range services {
		name := strings.ToLower(strings.TrimSpace(service.Name + " " + service.DisplayName))
		if strings.Contains(name, "sentinel") || strings.Contains(name, "crowdstrike") || strings.Contains(name, "defender") || strings.Contains(name, "falcon") || strings.Contains(name, "sophos") || strings.Contains(name, "eset") {
			candidates = append(candidates, firstNonEmptyString(service.DisplayName, service.Name))
		}
	}
	if len(candidates) == 0 {
		return "not_detected", nil
	}
	return "detected", uniqueSorted(candidates)
}

func macFirewallState() (string, string) {
	if !commandAvailable("/usr/libexec/ApplicationFirewall/socketfilterfw") {
		return "unknown", ""
	}
	output, err := exec.Command("/usr/libexec/ApplicationFirewall/socketfilterfw", "--getglobalstate").Output()
	if err != nil {
		return "unknown", ""
	}
	text := strings.ToLower(string(output))
	switch {
	case strings.Contains(text, "enabled"):
		return "enabled", strings.TrimSpace(string(output))
	case strings.Contains(text, "disabled"):
		return "disabled", strings.TrimSpace(string(output))
	default:
		return "unknown", strings.TrimSpace(string(output))
	}
}

func macEncryptionState() (string, string) {
	if !commandAvailable("fdesetup") {
		return "unknown", ""
	}
	output, err := exec.Command("fdesetup", "status").Output()
	if err != nil {
		return "unknown", ""
	}
	text := strings.ToLower(string(output))
	switch {
	case strings.Contains(text, "filevault is on"):
		return "enabled", strings.TrimSpace(string(output))
	case strings.Contains(text, "filevault is off"):
		return "disabled", strings.TrimSpace(string(output))
	default:
		return "unknown", strings.TrimSpace(string(output))
	}
}

func macGatekeeperState() string {
	if !commandAvailable("spctl") {
		return "unknown"
	}
	output, err := exec.Command("spctl", "--status").Output()
	if err != nil {
		return "unknown"
	}
	text := strings.ToLower(string(output))
	if strings.Contains(text, "enabled") {
		return "enabled"
	}
	if strings.Contains(text, "disabled") {
		return "disabled"
	}
	return "unknown"
}

func macSIPState() string {
	if !commandAvailable("csrutil") {
		return "unknown"
	}
	output, err := exec.Command("csrutil", "status").Output()
	if err != nil {
		return "unknown"
	}
	text := strings.ToLower(string(output))
	if strings.Contains(text, "enabled") {
		return "enabled"
	}
	if strings.Contains(text, "disabled") {
		return "disabled"
	}
	return "unknown"
}

func macMDMState() string {
	if !commandAvailable("profiles") {
		return "unknown"
	}
	output, err := exec.Command("profiles", "status", "-type", "enrollment").Output()
	if err != nil {
		return "unknown"
	}
	text := strings.ToLower(string(output))
	if strings.Contains(text, "mdm enrollment: yes") || strings.Contains(text, "enrolled via dep: yes") {
		return "enrolled"
	}
	if strings.Contains(text, "mdm enrollment: no") {
		return "not_enrolled"
	}
	return "unknown"
}

func macSystemExtensions() []model.ExtensionItem {
	if !commandAvailable("systemextensionsctl") {
		return nil
	}
	output, err := exec.Command("systemextensionsctl", "list").Output()
	if err != nil {
		return nil
	}
	results := make([]model.ExtensionItem, 0, 24)
	scanner := bufio.NewScanner(strings.NewReader(string(output)))
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" || strings.HasPrefix(line, "---") {
			continue
		}
		if !strings.Contains(line, ".") {
			continue
		}
		parts := strings.Fields(line)
		if len(parts) < 2 {
			continue
		}
		results = append(results, model.ExtensionItem{
			Name:       parts[len(parts)-1],
			Identifier: parts[len(parts)-1],
			Source:     "systemextensionsctl",
			State:      parts[0],
		})
	}
	return truncateExtensions(results, 32)
}

func macUSBDevices() []model.USBDevice {
	if !commandAvailable("system_profiler") {
		return nil
	}
	output, err := exec.Command("system_profiler", "SPUSBDataType", "-json").Output()
	if err != nil || len(output) == 0 {
		return nil
	}
	var payload map[string][]map[string]any
	if err := json.Unmarshal(output, &payload); err != nil {
		return nil
	}
	results := make([]model.USBDevice, 0, 16)
	for _, item := range payload["SPUSBDataType"] {
		name := firstNonEmptyString(stringValue(item["_name"]), stringValue(item["device_name"]))
		if name == "" {
			continue
		}
		results = append(results, model.USBDevice{
			Name:      name,
			Vendor:    stringValue(item["vendor_id"]),
			ProductID: stringValue(item["product_id"]),
			Serial:    stringValue(item["serial_num"]),
		})
	}
	return truncateUSB(results, 24)
}

func linuxFirewallState() (string, string) {
	if commandAvailable("ufw") {
		output, err := exec.Command("ufw", "status").Output()
		if err == nil {
			text := strings.ToLower(string(output))
			if strings.Contains(text, "status: active") {
				return "enabled", strings.TrimSpace(string(output))
			}
			if strings.Contains(text, "status: inactive") {
				return "disabled", strings.TrimSpace(string(output))
			}
		}
	}
	if commandAvailable("firewall-cmd") {
		output, err := exec.Command("firewall-cmd", "--state").Output()
		if err == nil {
			text := strings.TrimSpace(strings.ToLower(string(output)))
			if text == "running" {
				return "enabled", text
			}
			return "disabled", text
		}
	}
	return "unknown", ""
}

func linuxEncryptionState() (string, string) {
	if !commandAvailable("lsblk") {
		return "unknown", ""
	}
	output, err := exec.Command("lsblk", "-o", "TYPE,NAME", "-n").Output()
	if err != nil {
		return "unknown", ""
	}
	text := strings.ToLower(string(output))
	if strings.Contains(text, "crypt") {
		return "enabled", strings.TrimSpace(string(output))
	}
	return "unknown", strings.TrimSpace(string(output))
}

func linuxAntivirusState(services []model.ServiceItem) (string, []string) {
	products := make([]string, 0, 4)
	for _, service := range services {
		name := strings.ToLower(service.Name)
		if strings.Contains(name, "clam") || strings.Contains(name, "falco") || strings.Contains(name, "defender") {
			products = append(products, service.Name)
		}
	}
	if len(products) == 0 {
		return "not_detected", nil
	}
	return "detected", uniqueSorted(products)
}

func linuxUSBDevices() []model.USBDevice {
	if !commandAvailable("lsusb") {
		return nil
	}
	output, err := exec.Command("lsusb").Output()
	if err != nil {
		return nil
	}
	results := make([]model.USBDevice, 0, 16)
	scanner := bufio.NewScanner(strings.NewReader(string(output)))
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" {
			continue
		}
		results = append(results, model.USBDevice{Name: line})
	}
	return truncateUSB(results, 24)
}

func windowsFirewallState() (string, string) {
	if !commandAvailable("powershell") {
		return "unknown", ""
	}
	output, err := exec.Command(
		"powershell",
		"-NoProfile",
		"-Command",
		"Get-NetFirewallProfile | Select-Object Name,Enabled | ConvertTo-Json -Compress",
	).Output()
	if err != nil {
		return "unknown", ""
	}
	text := strings.ToLower(string(output))
	if strings.Contains(text, "\"enabled\":true") {
		return "enabled", strings.TrimSpace(string(output))
	}
	if strings.Contains(text, "\"enabled\":false") {
		return "disabled", strings.TrimSpace(string(output))
	}
	return "unknown", strings.TrimSpace(string(output))
}

func windowsEncryptionState() (string, string) {
	if !commandAvailable("powershell") {
		return "unknown", ""
	}
	output, err := exec.Command(
		"powershell",
		"-NoProfile",
		"-Command",
		"Get-BitLockerVolume | Select-Object MountPoint,VolumeStatus,ProtectionStatus,EncryptionMethod | ConvertTo-Json -Compress",
	).Output()
	if err != nil {
		return "unknown", ""
	}
	text := strings.ToLower(string(output))
	if strings.Contains(text, "\"protectionstatus\":1") {
		return "enabled", strings.TrimSpace(string(output))
	}
	return "unknown", strings.TrimSpace(string(output))
}

type windowsAVRecord struct {
	DisplayName string `json:"displayName"`
}

func windowsAntivirusState() (string, []string) {
	if !commandAvailable("powershell") {
		return "unknown", nil
	}
	output, err := exec.Command(
		"powershell",
		"-NoProfile",
		"-Command",
		"Get-CimInstance -Namespace root/SecurityCenter2 -ClassName AntivirusProduct | Select-Object displayName | ConvertTo-Json -Compress",
	).Output()
	if err != nil || len(output) == 0 {
		return "unknown", nil
	}
	var single windowsAVRecord
	if json.Unmarshal(output, &single) == nil && single.DisplayName != "" {
		return "detected", []string{single.DisplayName}
	}
	var records []windowsAVRecord
	if err := json.Unmarshal(output, &records); err != nil {
		return "unknown", nil
	}
	names := make([]string, 0, len(records))
	for _, record := range records {
		if strings.TrimSpace(record.DisplayName) != "" {
			names = append(names, record.DisplayName)
		}
	}
	if len(names) == 0 {
		return "not_detected", nil
	}
	return "detected", uniqueSorted(names)
}

func windowsUSBDevices() []model.USBDevice {
	if !commandAvailable("powershell") {
		return nil
	}
	output, err := exec.Command(
		"powershell",
		"-NoProfile",
		"-Command",
		"Get-PnpDevice -Class USB | Select-Object FriendlyName,InstanceId | ConvertTo-Json -Compress",
	).Output()
	if err != nil || len(output) == 0 {
		return nil
	}
	var single map[string]string
	if json.Unmarshal(output, &single) == nil && single["FriendlyName"] != "" {
		return []model.USBDevice{{Name: single["FriendlyName"], ProductID: single["InstanceId"]}}
	}
	var records []map[string]string
	if err := json.Unmarshal(output, &records); err != nil {
		return nil
	}
	results := make([]model.USBDevice, 0, len(records))
	for _, record := range records {
		results = append(results, model.USBDevice{
			Name:      record["FriendlyName"],
			ProductID: record["InstanceId"],
		})
	}
	return truncateUSB(results, 24)
}

func browserExtensions() []model.ExtensionItem {
	roots := extensionRoots()
	results := make([]model.ExtensionItem, 0, 24)
	seen := make(map[string]struct{})
	for _, root := range roots {
		entries, err := os.ReadDir(root.Path)
		if err != nil {
			continue
		}
		for _, entry := range entries {
			if !entry.IsDir() {
				continue
			}
			extID := entry.Name()
			versionEntries, err := os.ReadDir(filepath.Join(root.Path, extID))
			if err != nil {
				continue
			}
			for _, versionEntry := range versionEntries {
				if !versionEntry.IsDir() {
					continue
				}
				manifestPath := filepath.Join(root.Path, extID, versionEntry.Name(), "manifest.json")
				data, err := os.ReadFile(manifestPath)
				if err != nil {
					continue
				}
				var manifest map[string]any
				if err := json.Unmarshal(data, &manifest); err != nil {
					continue
				}
				key := root.Name + "|" + extID
				if _, exists := seen[key]; exists {
					continue
				}
				seen[key] = struct{}{}
				results = append(results, model.ExtensionItem{
					Name:       firstNonEmptyString(stringValue(manifest["name"]), extID),
					Identifier: extID,
					Version:    firstNonEmptyString(stringValue(manifest["version"]), versionEntry.Name()),
					Source:     root.Name,
					State:      "installed",
				})
			}
		}
	}
	sort.SliceStable(results, func(i, j int) bool {
		if results[i].Source == results[j].Source {
			return strings.ToLower(results[i].Name) < strings.ToLower(results[j].Name)
		}
		return results[i].Source < results[j].Source
	})
	return truncateExtensions(results, 48)
}

type extensionRoot struct {
	Name string
	Path string
}

func extensionRoots() []extensionRoot {
	roots := make([]extensionRoot, 0, 8)
	home, err := os.UserHomeDir()
	if err != nil || strings.TrimSpace(home) == "" {
		return roots
	}

	switch runtime.GOOS {
	case "darwin":
		roots = append(roots,
			extensionRoot{Name: "chrome", Path: filepath.Join(home, "Library", "Application Support", "Google", "Chrome", "Default", "Extensions")},
			extensionRoot{Name: "brave", Path: filepath.Join(home, "Library", "Application Support", "BraveSoftware", "Brave-Browser", "Default", "Extensions")},
			extensionRoot{Name: "edge", Path: filepath.Join(home, "Library", "Application Support", "Microsoft Edge", "Default", "Extensions")},
		)
	case "linux":
		roots = append(roots,
			extensionRoot{Name: "chrome", Path: filepath.Join(home, ".config", "google-chrome", "Default", "Extensions")},
			extensionRoot{Name: "brave", Path: filepath.Join(home, ".config", "BraveSoftware", "Brave-Browser", "Default", "Extensions")},
			extensionRoot{Name: "edge", Path: filepath.Join(home, ".config", "microsoft-edge", "Default", "Extensions")},
		)
	case "windows":
		localAppData := os.Getenv("LOCALAPPDATA")
		if localAppData != "" {
			roots = append(roots,
				extensionRoot{Name: "chrome", Path: filepath.Join(localAppData, "Google", "Chrome", "User Data", "Default", "Extensions")},
				extensionRoot{Name: "brave", Path: filepath.Join(localAppData, "BraveSoftware", "Brave-Browser", "User Data", "Default", "Extensions")},
				extensionRoot{Name: "edge", Path: filepath.Join(localAppData, "Microsoft", "Edge", "User Data", "Default", "Extensions")},
			)
		}
	}
	return roots
}

func truncateExtensions(items []model.ExtensionItem, limit int) []model.ExtensionItem {
	if len(items) > limit {
		return items[:limit]
	}
	return items
}

func truncateUSB(items []model.USBDevice, limit int) []model.USBDevice {
	if len(items) > limit {
		return items[:limit]
	}
	return items
}

func uniqueSorted(values []string) []string {
	seen := make(map[string]struct{}, len(values))
	results := make([]string, 0, len(values))
	for _, value := range values {
		value = strings.TrimSpace(value)
		if value == "" {
			continue
		}
		if _, exists := seen[value]; exists {
			continue
		}
		seen[value] = struct{}{}
		results = append(results, value)
	}
	sort.Strings(results)
	return results
}
