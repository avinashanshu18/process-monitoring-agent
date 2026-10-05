package collector

import (
	"bufio"
	"os/exec"
	"sort"
	"strings"

	"hostlens-go-agent/internal/model"
)

const maxAuthEvents = 16

func collectAuthEvents() []model.AuthEvent {
	if nativeEvents := collectNativeAuthEvents(); len(nativeEvents) > 0 {
		return sortAuthEvents(nativeEvents)
	}
	return collectFallbackAuthEvents()
}

func collectFallbackAuthEvents() []model.AuthEvent {
	if !commandAvailable("last") {
		return nil
	}

	output, err := exec.Command("last", "-n", "16").Output()
	if err != nil {
		return nil
	}

	events := make([]model.AuthEvent, 0, maxAuthEvents)
	scanner := bufio.NewScanner(strings.NewReader(string(output)))
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" || strings.Contains(strings.ToLower(line), "wtmp begins") {
			continue
		}

		event, ok := parseAuthEventLine(line)
		if !ok {
			continue
		}
		events = append(events, event)
		if len(events) >= maxAuthEvents {
			break
		}
	}

	return sortAuthEvents(events)
}

func parseAuthEventLine(line string) (model.AuthEvent, bool) {
	fields := strings.Fields(line)
	if len(fields) < 2 {
		return model.AuthEvent{}, false
	}

	username := fields[0]
	terminal := fields[1]
	source := ""
	occurredAt := ""
	if len(fields) >= 5 {
		sourceCandidate := fields[2]
		if !looksLikeDateToken(sourceCandidate) && sourceCandidate != "-" {
			source = sourceCandidate
			occurredAt = strings.Join(fields[3:minInt(len(fields), 8)], " ")
		} else {
			occurredAt = strings.Join(fields[2:minInt(len(fields), 7)], " ")
		}
	}

	status := "closed"
	if strings.Contains(strings.ToLower(line), "still logged in") {
		status = "active"
	}

	return model.AuthEvent{
		Username:   username,
		Terminal:   terminal,
		Source:     source,
		OccurredAt: occurredAt,
		EventType:  "login_session",
		Status:     status,
		Summary:    line,
		SourceIP:   source,
		Method:     "session_history",
		Session:    terminal,
	}, true
}

func looksLikeDateToken(value string) bool {
	lower := strings.ToLower(value)
	if len(lower) < 3 {
		return false
	}
	for _, candidate := range []string{
		"mon", "tue", "wed", "thu", "fri", "sat", "sun",
		"jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec",
	} {
		if strings.HasPrefix(lower, candidate) {
			return true
		}
	}
	return false
}

func minInt(left int, right int) int {
	if left < right {
		return left
	}
	return right
}

func sortAuthEvents(events []model.AuthEvent) []model.AuthEvent {
	sort.SliceStable(events, func(i, j int) bool {
		if events[i].Status == events[j].Status {
			if events[i].Source == events[j].Source {
				return events[i].Username < events[j].Username
			}
			return events[i].Source < events[j].Source
		}
		return events[i].Status < events[j].Status
	})
	if len(events) > maxAuthEvents {
		return events[:maxAuthEvents]
	}
	return events
}
