//go:build darwin

package collector

import (
	"bufio"
	"strings"
	"time"

	"hostlens-go-agent/internal/model"
)

func collectNativeAuthEvents() []model.AuthEvent {
	if !commandAvailable("log") {
		return nil
	}

	output, err := runCommandOutput(
		4*time.Second,
		256*1024,
		"/usr/bin/log",
		"show",
		"--style",
		"compact",
		"--last",
		"5m",
		"--predicate",
		`process == "sshd" || process == "sudo" || process == "loginwindow" || eventMessage CONTAINS[c] "authentication" || eventMessage CONTAINS[c] "login"`,
	)
	if err != nil {
		return nil
	}

	events := make([]model.AuthEvent, 0, maxAuthEvents)
	scanner := bufio.NewScanner(strings.NewReader(string(output)))
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" {
			continue
		}
		event, ok := parseDarwinAuthLine(line)
		if !ok {
			continue
		}
		events = append(events, event)
		if len(events) >= maxAuthEvents {
			break
		}
	}
	return events
}

func parseDarwinAuthLine(line string) (model.AuthEvent, bool) {
	fields := strings.Fields(line)
	if len(fields) < 4 {
		return model.AuthEvent{}, false
	}

	occurredAt := strings.Join(fields[0:2], " ")
	source := fields[2]
	summary := strings.Join(fields[3:], " ")
	username := "system"
	status := "observed"
	terminal := source

	lowerSummary := strings.ToLower(summary)
	sourceIP := ""
	method := "native_log"
	for _, token := range strings.Fields(summary) {
		if strings.HasPrefix(token, "user=") || strings.HasPrefix(token, "for") {
			candidate := strings.Trim(strings.TrimPrefix(strings.TrimPrefix(token, "user="), "for"), " :")
			if candidate != "" {
				username = candidate
				break
			}
		}
		if sourceIP == "" && (strings.Count(token, ".") >= 3 || strings.Contains(strings.ToLower(token), "localhost")) {
			sourceIP = strings.Trim(token, " :")
		}
		if strings.Contains(strings.ToLower(token), "sudo") {
			method = "sudo"
		}
		if strings.Contains(strings.ToLower(token), "ssh") {
			method = "ssh"
		}
	}
	if strings.TrimSpace(username) == "" {
		username = "system"
	}
	if strings.Contains(lowerSummary, "failed") || strings.Contains(lowerSummary, "invalid") {
		status = "failed"
	} else if strings.Contains(lowerSummary, "accepted") || strings.Contains(lowerSummary, "opened") {
		status = "success"
	}

	return model.AuthEvent{
		Username:   username,
		Terminal:   terminal,
		Source:     source,
		OccurredAt: occurredAt,
		EventType:  "auth_log",
		Status:     status,
		Summary:    summary,
		SourceIP:   sourceIP,
		Method:     method,
		EventID:    source,
		Session:    terminal,
	}, true
}
