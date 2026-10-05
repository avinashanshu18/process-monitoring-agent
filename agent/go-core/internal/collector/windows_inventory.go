//go:build windows

package collector

import (
	"encoding/json"
	"os/exec"
	"sort"
	"strings"

	"hostlens-go-agent/internal/model"
)

type windowsStartupRecord struct {
	Name        string `json:"TaskName"`
	Command     string `json:"TaskToRun"`
	Location    string `json:"Location"`
	Publisher   string `json:"Author"`
	State       string `json:"State"`
	TriggerType string `json:"TriggerType"`
}

type windowsSoftwareRecord struct {
	Name          string `json:"DisplayName"`
	Version       string `json:"DisplayVersion"`
	Publisher     string `json:"Publisher"`
	InstallPath   string `json:"InstallLocation"`
	InstallSource string `json:"Source"`
	Identifier    string `json:"PSChildName"`
}

func collectWindowsStartupItems() []model.StartupItem {
	if !commandAvailable("powershell") {
		return nil
	}

	output, err := exec.Command(
		"powershell",
		"-NoProfile",
		"-Command",
		"$tasks = Get-ScheduledTask | Select-Object TaskName,@{Name='TaskToRun';Expression={$_.Actions.Execute -join '; '}},TaskPath,Author,State,@{Name='TriggerType';Expression={$_.Triggers[0].CimClass.CimClassName}}; $tasks | ConvertTo-Json -Compress",
	).Output()
	if err != nil || len(output) == 0 {
		return nil
	}

	var single windowsStartupRecord
	if json.Unmarshal(output, &single) == nil && single.Name != "" {
		return []model.StartupItem{windowsStartupToModel(single)}
	}

	var records []windowsStartupRecord
	if err := json.Unmarshal(output, &records); err != nil {
		return nil
	}

	items := make([]model.StartupItem, 0, len(records))
	for _, record := range records {
		items = append(items, windowsStartupToModel(record))
	}
	sort.SliceStable(items, func(i, j int) bool {
		return strings.ToLower(items[i].Name) < strings.ToLower(items[j].Name)
	})
	if len(items) > 120 {
		items = items[:120]
	}
	return items
}

func windowsStartupToModel(record windowsStartupRecord) model.StartupItem {
	return model.StartupItem{
		Name:      record.Name,
		Type:      "scheduled_task",
		Scope:     "system",
		Location:  strings.TrimSpace(record.Location),
		Command:   strings.TrimSpace(record.Command),
		Publisher: firstNonEmptyString(record.Publisher, record.State, record.TriggerType),
	}
}

func collectWindowsSoftwareInventory() []model.SoftwareItem {
	if !commandAvailable("powershell") {
		return nil
	}

	script := "$paths=@('HKLM:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*','HKLM:\\Software\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*','HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*'); Get-ItemProperty $paths -ErrorAction SilentlyContinue | Where-Object {$_.DisplayName} | Select-Object DisplayName,DisplayVersion,Publisher,InstallLocation,@{Name='Source';Expression={'registry'}},PSChildName | ConvertTo-Json -Compress"
	output, err := exec.Command("powershell", "-NoProfile", "-Command", script).Output()
	if err != nil || len(output) == 0 {
		return nil
	}

	var single windowsSoftwareRecord
	if json.Unmarshal(output, &single) == nil && single.Name != "" {
		return []model.SoftwareItem{windowsSoftwareToModel(single)}
	}

	var records []windowsSoftwareRecord
	if err := json.Unmarshal(output, &records); err != nil {
		return nil
	}

	items := make([]model.SoftwareItem, 0, len(records))
	seen := make(map[string]struct{})
	for _, record := range records {
		item := windowsSoftwareToModel(record)
		key := softwareInventoryKey(item)
		if key == "" {
			continue
		}
		if _, exists := seen[key]; exists {
			continue
		}
		seen[key] = struct{}{}
		items = append(items, item)
	}
	sortSoftwareInventory(items)
	if len(items) > maxSoftwareItems {
		items = items[:maxSoftwareItems]
	}
	return items
}

func windowsSoftwareToModel(record windowsSoftwareRecord) model.SoftwareItem {
	return model.SoftwareItem{
		Name:           strings.TrimSpace(record.Name),
		Identifier:     strings.TrimSpace(record.Identifier),
		Version:        strings.TrimSpace(record.Version),
		Publisher:      strings.TrimSpace(record.Publisher),
		InstallPath:    strings.TrimSpace(record.InstallPath),
		InstallScope:   "system",
		InstallSource:  firstNonEmptyString(record.InstallSource, "registry"),
		SignatureState: "managed",
	}
}
