package collector

import (
	"bufio"
	"encoding/json"
	"os/exec"
	"runtime"
	"sort"
	"strconv"
	"strings"

	"hostlens-go-agent/internal/model"
)

func collectServiceInventory() []model.ServiceItem {
	switch runtime.GOOS {
	case "darwin":
		return collectDarwinServiceInventory()
	case "linux":
		return collectLinuxServiceInventory()
	case "windows":
		return collectWindowsServiceInventory()
	default:
		return nil
	}
}

func collectDarwinServiceInventory() []model.ServiceItem {
	if !commandAvailable("launchctl") {
		return nil
	}

	output, err := exec.Command("launchctl", "list").Output()
	if err != nil {
		return nil
	}

	results := make([]model.ServiceItem, 0, 64)
	scanner := bufio.NewScanner(strings.NewReader(string(output)))
	firstLine := true
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" {
			continue
		}
		if firstLine {
			firstLine = false
			if strings.Contains(strings.ToLower(line), "label") {
				continue
			}
		}
		parts := strings.Fields(line)
		if len(parts) < 3 {
			continue
		}
		label := parts[len(parts)-1]
		pid := int32(0)
		if parsedPID := parseInt32(parts[0]); parsedPID > 0 {
			pid = parsedPID
		}
		results = append(results, model.ServiceItem{
			Name:        label,
			DisplayName: label,
			Manager:     "launchd",
			Scope:       "system",
			State:       launchdState(parts[0], parts[1]),
			SubState:    strings.TrimSpace(parts[1]),
			Status:      strings.TrimSpace(parts[1]),
			PID:         pid,
		})
	}

	sortServiceInventory(results)
	return truncateServices(results, 120)
}

func launchdState(pidField string, statusField string) string {
	if strings.TrimSpace(pidField) != "-" && strings.TrimSpace(pidField) != "0" {
		return "running"
	}
	if strings.TrimSpace(statusField) != "0" {
		return "stopped"
	}
	return "loaded"
}

func collectLinuxServiceInventory() []model.ServiceItem {
	if !commandAvailable("systemctl") {
		return nil
	}

	unitStates := make(map[string][]string)
	output, err := exec.Command(
		"systemctl",
		"list-units",
		"--type=service",
		"--all",
		"--no-legend",
		"--no-pager",
	).Output()
	if err == nil {
		scanner := bufio.NewScanner(strings.NewReader(string(output)))
		for scanner.Scan() {
			parts := strings.Fields(scanner.Text())
			if len(parts) < 4 {
				continue
			}
			unitStates[parts[0]] = parts
		}
	}

	unitFiles := make(map[string]string)
	unitOutput, err := exec.Command(
		"systemctl",
		"list-unit-files",
		"--type=service",
		"--no-legend",
		"--no-pager",
	).Output()
	if err == nil {
		scanner := bufio.NewScanner(strings.NewReader(string(unitOutput)))
		for scanner.Scan() {
			parts := strings.Fields(scanner.Text())
			if len(parts) < 2 {
				continue
			}
			unitFiles[parts[0]] = parts[1]
		}
	}

	results := make([]model.ServiceItem, 0, len(unitStates))
	for name, parts := range unitStates {
		loadState := safeIndex(parts, 1)
		activeState := safeIndex(parts, 2)
		subState := safeIndex(parts, 3)
		description := strings.Join(parts[4:], " ")
		results = append(results, model.ServiceItem{
			Name:          name,
			DisplayName:   description,
			Manager:       "systemd",
			Scope:         "system",
			State:         activeState,
			SubState:      subState,
			Status:        loadState,
			UnitFileState: unitFiles[name],
			StartupType:   unitFiles[name],
		})
	}

	sortServiceInventory(results)
	return truncateServices(results, 160)
}

type windowsServiceRecord struct {
	Name        string `json:"Name"`
	DisplayName string `json:"DisplayName"`
	State       string `json:"State"`
	Status      string `json:"Status"`
	StartMode   string `json:"StartMode"`
	StartName   string `json:"StartName"`
	PathName    string `json:"PathName"`
	ProcessId   int32  `json:"ProcessId"`
	ExitCode    int32  `json:"ExitCode"`
}

func collectWindowsServiceInventory() []model.ServiceItem {
	if !commandAvailable("powershell") {
		return nil
	}

	output, err := exec.Command(
		"powershell",
		"-NoProfile",
		"-Command",
		"Get-CimInstance Win32_Service | Select-Object Name,DisplayName,State,Status,StartMode,StartName,PathName,ProcessId,ExitCode | ConvertTo-Json -Compress",
	).Output()
	if err != nil || len(output) == 0 {
		return nil
	}

	var single windowsServiceRecord
	if json.Unmarshal(output, &single) == nil && single.Name != "" {
		return []model.ServiceItem{windowsServiceToModel(single)}
	}

	var records []windowsServiceRecord
	if err := json.Unmarshal(output, &records); err != nil {
		return nil
	}

	results := make([]model.ServiceItem, 0, len(records))
	for _, record := range records {
		results = append(results, windowsServiceToModel(record))
	}
	sortServiceInventory(results)
	return truncateServices(results, 180)
}

func windowsServiceToModel(record windowsServiceRecord) model.ServiceItem {
	return model.ServiceItem{
		Name:        record.Name,
		DisplayName: record.DisplayName,
		Manager:     "windows-service",
		Scope:       "system",
		State:       strings.ToLower(record.State),
		Status:      record.Status,
		StartupType: strings.ToLower(record.StartMode),
		Executable:  record.PathName,
		Username:    record.StartName,
		PID:         record.ProcessId,
		ExitCode:    intToString(int(record.ExitCode)),
	}
}

func sortServiceInventory(items []model.ServiceItem) {
	sort.SliceStable(items, func(i, j int) bool {
		if items[i].State == items[j].State {
			return strings.ToLower(items[i].Name) < strings.ToLower(items[j].Name)
		}
		return items[i].State > items[j].State
	})
}

func truncateServices(items []model.ServiceItem, limit int) []model.ServiceItem {
	if len(items) > limit {
		return items[:limit]
	}
	return items
}

func parseInt32(value string) int32 {
	parsed, err := strconv.ParseInt(strings.TrimSpace(value), 10, 32)
	if err != nil {
		return 0
	}
	return int32(parsed)
}

func intToString(value int) string {
	if value == 0 {
		return ""
	}
	return strconv.Itoa(value)
}
