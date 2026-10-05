//go:build windows

package collector

import (
	"encoding/json"
	"os/exec"
	"strings"

	"hostlens-go-agent/internal/model"
)

type windowsAuthEvent struct {
	TimeCreated string `json:"TimeCreated"`
	Id          int    `json:"Id"`
	Message     string `json:"Message"`
}

func collectNativeAuthEvents() []model.AuthEvent {
	output, err := exec.Command(
		"powershell",
		"-NoProfile",
		"-Command",
		"Get-WinEvent -FilterHashtable @{LogName='Security'; Id=4624,4625} -MaxEvents 16 | Select-Object TimeCreated,Id,Message | ConvertTo-Json -Compress",
	).Output()
	if err != nil || len(output) == 0 {
		return nil
	}

	var single windowsAuthEvent
	if json.Unmarshal(output, &single) == nil && single.Id != 0 {
		return []model.AuthEvent{windowsEventToModel(single)}
	}

	var events []windowsAuthEvent
	if err := json.Unmarshal(output, &events); err != nil {
		return nil
	}

	result := make([]model.AuthEvent, 0, len(events))
	for _, event := range events {
		result = append(result, windowsEventToModel(event))
	}
	return result
}

func windowsEventToModel(event windowsAuthEvent) model.AuthEvent {
	status := "success"
	if event.Id == 4625 {
		status = "failed"
	}
	username := "windows-user"
	sourceIP := ""
	for _, line := range strings.Split(event.Message, "\n") {
		lower := strings.ToLower(strings.TrimSpace(line))
		if strings.Contains(lower, "account name:") && username == "windows-user" {
			username = strings.TrimSpace(strings.TrimPrefix(strings.TrimSpace(line), "Account Name:"))
		}
		if strings.Contains(lower, "source network address:") {
			sourceIP = strings.TrimSpace(strings.TrimPrefix(strings.TrimSpace(line), "Source Network Address:"))
		}
	}
	return model.AuthEvent{
		Username:   username,
		Terminal:   "Security",
		Source:     "windows-event-log",
		OccurredAt: event.TimeCreated,
		EventType:  "auth_log",
		Status:     status,
		Summary:    event.Message,
		SourceIP:   sourceIP,
		Method:     "winlogon",
		EventID:    intToString(event.Id),
		Session:    "security",
	}
}
