package actions

import (
	"encoding/json"
	"fmt"
	"os"
	"strconv"
	"strings"
	"time"

	"hostlens-go-agent/internal/collector"
	"hostlens-go-agent/internal/config"
	"hostlens-go-agent/internal/model"
)

func Execute(cfg config.Config, action model.AgentAction) (model.AgentActionResult, bool, error) {
	switch action.Kind {
	case "refresh_snapshot":
		return model.AgentActionResult{
			Status: "succeeded",
			Result: map[string]any{
				"message":      "refresh snapshot acknowledged",
				"requested_at": time.Now().UTC().Format(time.RFC3339),
			},
		}, true, nil
	case "terminate_process":
		return terminateProcess(action)
	case "collect_diagnostics":
		return collectDiagnostics(cfg)
	case "live_query":
		return liveQuery(cfg, action)
	default:
		return model.AgentActionResult{
			Status: "failed",
			Result: map[string]any{"error": fmt.Sprintf("unsupported action kind: %s", action.Kind)},
		}, false, fmt.Errorf("unsupported action kind: %s", action.Kind)
	}
}

func terminateProcess(action model.AgentAction) (model.AgentActionResult, bool, error) {
	pid, err := intFromAny(action.Parameters["pid"])
	if err != nil {
		return model.AgentActionResult{
			Status: "failed",
			Result: map[string]any{"error": "terminate_process requires a numeric pid"},
		}, false, err
	}
	process, err := os.FindProcess(pid)
	if err != nil {
		return model.AgentActionResult{
			Status: "failed",
			Result: map[string]any{"pid": pid, "error": err.Error()},
		}, false, err
	}
	if err := process.Kill(); err != nil {
		return model.AgentActionResult{
			Status: "failed",
			Result: map[string]any{"pid": pid, "error": err.Error()},
		}, false, err
	}
	return model.AgentActionResult{
		Status: "succeeded",
		Result: map[string]any{
			"pid":       pid,
			"message":   "process termination signal sent",
			"completed": time.Now().UTC().Format(time.RFC3339),
		},
	}, false, nil
}

func collectDiagnostics(cfg config.Config) (model.AgentActionResult, bool, error) {
	payload, err := collector.Collect(cfg)
	if err != nil {
		return model.AgentActionResult{
			Status: "failed",
			Result: map[string]any{"error": err.Error()},
		}, false, err
	}
	return model.AgentActionResult{
		Status: "succeeded",
		Result: map[string]any{
			"hostname":               payload.Hostname,
			"agent_id":               payload.AgentID,
			"cpu_percent":            valueOrNil(payload.CPUPercent),
			"memory_percent":         valueOrNil(payload.MemoryPercent),
			"disk_percent":           valueOrNil(payload.DiskPercent),
			"total_processes":        len(payload.Processes),
			"service_inventory":      len(payload.ServiceInventory),
			"startup_items":          len(payload.StartupItems),
			"file_integrity_items":   len(payload.FileIntegrityItems),
			"auth_events":            len(payload.AuthEvents),
			"dns_events":             len(payload.DNSEvents),
			"network_connections":    len(payload.NetworkConnections),
			"network_events":         len(payload.NetworkEvents),
			"process_events":         len(payload.ProcessEvents),
			"collector_sources":      payload.CollectorSources,
			"collector_capabilities": payload.SecurityPosture.CollectorCapabilities,
		},
	}, false, nil
}

func liveQuery(cfg config.Config, action model.AgentAction) (model.AgentActionResult, bool, error) {
	payload, err := collector.Collect(cfg)
	if err != nil {
		return model.AgentActionResult{
			Status: "failed",
			Result: map[string]any{"error": err.Error()},
		}, false, err
	}

	source := stringValue(action.Parameters["source"])
	field := stringValue(action.Parameters["field"])
	operator := stringValue(action.Parameters["operator"])
	value := stringValue(action.Parameters["value"])
	limit, _ := intFromAny(action.Parameters["limit"])
	if limit <= 0 || limit > 50 {
		limit = 10
	}

	rows := snapshotRows(payload, source)
	matches := make([]map[string]any, 0, limit)
	for _, row := range rows {
		cell := ""
		if raw, ok := row[field]; ok && raw != nil {
			cell = fmt.Sprint(raw)
		}
		if queryMatch(cell, operator, value) {
			matches = append(matches, row)
		}
		if len(matches) >= limit {
			break
		}
	}

	return model.AgentActionResult{
		Status: "succeeded",
		Result: map[string]any{
			"source":   source,
			"field":    field,
			"operator": operator,
			"value":    value,
			"count":    len(matches),
			"matches":  matches,
		},
	}, false, nil
}

func snapshotRows(payload model.SnapshotPayload, source string) []map[string]any {
	var raw any
	switch source {
	case "software_inventory":
		raw = payload.SoftwareInventory
	case "service_inventory":
		raw = payload.ServiceInventory
	case "startup_items":
		raw = payload.StartupItems
	case "file_integrity_items":
		raw = payload.FileIntegrityItems
	case "auth_events":
		raw = payload.AuthEvents
	case "network_connections":
		raw = payload.NetworkConnections
	default:
		raw = payload.Processes
	}

	body, _ := json.Marshal(raw)
	var rows []map[string]any
	_ = json.Unmarshal(body, &rows)
	return rows
}

func queryMatch(cell, operator, value string) bool {
	left := strings.ToLower(strings.TrimSpace(cell))
	right := strings.ToLower(strings.TrimSpace(value))

	switch operator {
	case "equals":
		return left == right
	case "starts_with":
		return right != "" && strings.HasPrefix(left, right)
	case "ends_with":
		return right != "" && strings.HasSuffix(left, right)
	case "gt":
		leftNum, leftErr := strconv.ParseFloat(left, 64)
		rightNum, rightErr := strconv.ParseFloat(right, 64)
		return leftErr == nil && rightErr == nil && leftNum > rightNum
	case "lt":
		leftNum, leftErr := strconv.ParseFloat(left, 64)
		rightNum, rightErr := strconv.ParseFloat(right, 64)
		return leftErr == nil && rightErr == nil && leftNum < rightNum
	case "exists":
		return left != ""
	default:
		return right != "" && strings.Contains(left, right)
	}
}

func intFromAny(value any) (int, error) {
	switch cast := value.(type) {
	case int:
		return cast, nil
	case int32:
		return int(cast), nil
	case int64:
		return int(cast), nil
	case float64:
		return int(cast), nil
	case float32:
		return int(cast), nil
	case string:
		return strconv.Atoi(cast)
	default:
		return 0, fmt.Errorf("unsupported numeric type")
	}
}

func stringValue(value any) string {
	if value == nil {
		return ""
	}
	return fmt.Sprint(value)
}

func valueOrNil(value *float64) any {
	if value == nil {
		return nil
	}
	return *value
}
