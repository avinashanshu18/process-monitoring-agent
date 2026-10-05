//go:build linux

package collector

import (
	"bufio"
	"os"
	"strings"

	"hostlens-go-agent/internal/model"
)

func collectNativeAuthEvents() []model.AuthEvent {
	for _, path := range []string{"/var/log/auth.log", "/var/log/secure"} {
		events := collectLinuxAuthLog(path)
		if len(events) > 0 {
			return events
		}
	}
	return nil
}

func collectLinuxAuthLog(path string) []model.AuthEvent {
	file, err := os.Open(path)
	if err != nil {
		return nil
	}
	defer file.Close()

	lines := make([]string, 0, 64)
	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line != "" {
			lines = append(lines, line)
		}
	}
	if len(lines) == 0 {
		return nil
	}

	start := 0
	if len(lines) > 80 {
		start = len(lines) - 80
	}

	events := make([]model.AuthEvent, 0, maxAuthEvents)
	for _, line := range lines[start:] {
		lower := strings.ToLower(line)
		if !(strings.Contains(lower, "sshd") || strings.Contains(lower, "sudo") || strings.Contains(lower, "pam_unix")) {
			continue
		}
		status := "observed"
		if strings.Contains(lower, "failed") || strings.Contains(lower, "invalid") {
			status = "failed"
		} else if strings.Contains(lower, "accepted") || strings.Contains(lower, "session opened") {
			status = "success"
		}
		username := "system"
		if strings.Contains(lower, "for ") {
			parts := strings.SplitN(line, " for ", 2)
			if len(parts) == 2 {
				username = strings.Fields(parts[1])[0]
			}
		}
		method := "auth_log"
		if strings.Contains(lower, "sshd") {
			method = "ssh"
		} else if strings.Contains(lower, "sudo") {
			method = "sudo"
		}
		events = append(events, model.AuthEvent{
			Username:   username,
			Terminal:   "auth.log",
			Source:     path,
			OccurredAt: line[0:minInt(len(line), 15)],
			EventType:  "auth_log",
			Status:     status,
			Summary:    line,
			Method:     method,
			Session:    "system",
		})
		if len(events) >= maxAuthEvents {
			break
		}
	}
	return events
}
