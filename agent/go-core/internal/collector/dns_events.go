package collector

import (
	"bufio"
	"encoding/json"
	"net"
	"runtime"
	"sort"
	"strings"
	"sync"
	"time"

	"hostlens-go-agent/internal/model"
)

const maxDNSEvents = 40

var dnsEventState struct {
	sync.Mutex
	seen map[string]time.Time
}

func collectDNSEvents() []model.DNSEvent {
	var events []model.DNSEvent
	switch runtime.GOOS {
	case "darwin":
		events = collectDarwinDNSEvents()
	case "linux":
		events = collectLinuxDNSEvents()
	case "windows":
		events = collectWindowsDNSEvents()
	}
	return dedupeDNSEvents(events)
}

func collectDarwinDNSEvents() []model.DNSEvent {
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
		"2m",
		"--predicate",
		`process == "mDNSResponder" AND (eventMessage CONTAINS[c] "query" OR eventMessage CONTAINS[c] "DNSService")`,
	)
	if err != nil {
		return nil
	}
	return parseDNSLines(string(output), "unified-log")
}

func collectLinuxDNSEvents() []model.DNSEvent {
	if !commandAvailable("journalctl") {
		return nil
	}
	output, err := exec.Command(
		"journalctl",
		"--since",
		"10 minutes ago",
		"--no-pager",
		"-u",
		"systemd-resolved",
	).Output()
	if err != nil {
		return nil
	}
	return parseDNSLines(string(output), "systemd-resolved")
}

type windowsDNSEvent struct {
	TimeCreated string `json:"TimeCreated"`
	Id          int    `json:"Id"`
	Message     string `json:"Message"`
}

func collectWindowsDNSEvents() []model.DNSEvent {
	if !commandAvailable("powershell") {
		return nil
	}
	output, err := exec.Command(
		"powershell",
		"-NoProfile",
		"-Command",
		"Get-WinEvent -FilterHashtable @{LogName='Microsoft-Windows-DNS-Client/Operational'} -MaxEvents 16 | Select-Object TimeCreated,Id,Message | ConvertTo-Json -Compress",
	).Output()
	if err != nil || len(output) == 0 {
		return nil
	}

	var single windowsDNSEvent
	if json.Unmarshal(output, &single) == nil && single.TimeCreated != "" {
		return []model.DNSEvent{windowsDNSToModel(single)}
	}

	var records []windowsDNSEvent
	if err := json.Unmarshal(output, &records); err != nil {
		return nil
	}

	results := make([]model.DNSEvent, 0, len(records))
	for _, record := range records {
		results = append(results, windowsDNSToModel(record))
	}
	return results
}

func windowsDNSToModel(record windowsDNSEvent) model.DNSEvent {
	return model.DNSEvent{
		Query:      extractDNSQuery(record.Message),
		RecordType: "unknown",
		Status:     "observed",
		Source:     "windows-dns-client",
		OccurredAt: record.TimeCreated,
		Answers:    nil,
	}
}

func parseDNSLines(output string, source string) []model.DNSEvent {
	results := make([]model.DNSEvent, 0, 24)
	scanner := bufio.NewScanner(strings.NewReader(output))
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" {
			continue
		}
		query := extractDNSQuery(line)
		if query == "" {
			continue
		}
		results = append(results, model.DNSEvent{
			Query:      query,
			RecordType: "unknown",
			Status:     "observed",
			Source:     source,
			OccurredAt: time.Now().UTC().Format(time.RFC3339),
		})
	}
	return results
}

func extractDNSQuery(line string) string {
	for _, token := range strings.Fields(strings.ReplaceAll(line, "\"", "")) {
		candidate := strings.Trim(token, "[](),;:")
		lower := strings.ToLower(candidate)
		if looksLikeTimestamp(candidate) || net.ParseIP(candidate) != nil {
			continue
		}
		if !strings.Contains(candidate, ".") {
			continue
		}
		if strings.HasPrefix(lower, "com.apple") || strings.HasPrefix(lower, "process") {
			continue
		}
		if strings.Contains(lower, "arpa") || strings.Contains(lower, "local.") || strings.Contains(lower, "localhost") {
			continue
		}
		if strings.ContainsAny(candidate, "/\\") {
			continue
		}
		if strings.Count(candidate, ".") >= 1 && strings.IndexFunc(candidate, func(r rune) bool {
			return !(r == '.' || r == '-' || r == '_' || (r >= '0' && r <= '9') || (r >= 'a' && r <= 'z') || (r >= 'A' && r <= 'Z'))
		}) == -1 {
			return candidate
		}
	}
	return ""
}

func looksLikeTimestamp(value string) bool {
	if strings.Count(value, ":") < 2 {
		return false
	}
	for _, part := range strings.Split(value, ":") {
		if part == "" {
			return false
		}
		for _, r := range part {
			if r < '0' || r > '9' {
				return false
			}
		}
	}
	return true
}

func dedupeDNSEvents(events []model.DNSEvent) []model.DNSEvent {
	if len(events) == 0 {
		return nil
	}

	dnsEventState.Lock()
	defer dnsEventState.Unlock()
	if dnsEventState.seen == nil {
		dnsEventState.seen = make(map[string]time.Time)
	}

	cutoff := time.Now().Add(-30 * time.Minute)
	for key, seenAt := range dnsEventState.seen {
		if seenAt.Before(cutoff) {
			delete(dnsEventState.seen, key)
		}
	}

	results := make([]model.DNSEvent, 0, len(events))
	for _, event := range events {
		key := strings.ToLower(strings.TrimSpace(event.Query + "|" + event.Source + "|" + event.Status))
		if key == "" {
			continue
		}
		if _, exists := dnsEventState.seen[key]; exists {
			continue
		}
		dnsEventState.seen[key] = time.Now()
		results = append(results, event)
	}

	sort.SliceStable(results, func(i, j int) bool {
		return results[i].Query < results[j].Query
	})
	if len(results) > maxDNSEvents {
		results = results[:maxDNSEvents]
	}
	return results
}
