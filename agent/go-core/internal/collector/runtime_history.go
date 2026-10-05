package collector

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"sync"
	"time"

	"hostlens-go-agent/internal/model"
)

type trackedProcess struct {
	Process model.Process
	Key     string
}

type trackedConnection struct {
	Connection model.NetworkConnection
	Key        string
}

var runtimeHistoryState struct {
	sync.Mutex
	processes   map[string]trackedProcess
	connections map[string]trackedConnection
	statePath   string
	loaded      bool
}

type persistedRuntimeState struct {
	Processes   []model.Process           `json:"processes"`
	Connections []model.NetworkConnection `json:"connections"`
}

func SetRuntimeStatePath(path string) {
	runtimeHistoryState.Lock()
	defer runtimeHistoryState.Unlock()

	runtimeHistoryState.statePath = path
	loadRuntimeStateLocked()
}

func runtimeProcessEvents(processes []model.Process) []model.ProcessEvent {
	now := time.Now().UTC().Format(time.RFC3339)

	current := make(map[string]trackedProcess, len(processes))
	for _, process := range processes {
		key := processTrackingKey(process)
		if key == "" {
			continue
		}
		current[key] = trackedProcess{Process: process, Key: key}
	}

	runtimeHistoryState.Lock()
	defer runtimeHistoryState.Unlock()
	loadRuntimeStateLocked()

	previous := runtimeHistoryState.processes
	if previous == nil {
		runtimeHistoryState.processes = current
		persistRuntimeStateLocked()
		return nil
	}

	events := make([]model.ProcessEvent, 0, 48)
	for key, process := range current {
		if _, exists := previous[key]; exists {
			continue
		}
		parentName := ""
		if parent, ok := current[parentTrackingKey(process.Process.PPID, processes)]; ok {
			parentName = parent.Process.Name
		}
		events = append(events, model.ProcessEvent{
			PID:        process.Process.PID,
			PPID:       process.Process.PPID,
			Name:       process.Process.Name,
			ParentName: parentName,
			Username:   process.Process.Username,
			Cmdline:    process.Process.Cmdline,
			ExePath:    process.Process.ExePath,
			EventType:  "started",
			OccurredAt: now,
			StartedAt:  process.Process.StartedAt,
		})
	}

	for key, process := range previous {
		if _, exists := current[key]; exists {
			continue
		}
		events = append(events, model.ProcessEvent{
			PID:        process.Process.PID,
			PPID:       process.Process.PPID,
			Name:       process.Process.Name,
			Username:   process.Process.Username,
			Cmdline:    process.Process.Cmdline,
			ExePath:    process.Process.ExePath,
			EventType:  "exited",
			OccurredAt: now,
			StartedAt:  process.Process.StartedAt,
		})
	}

	runtimeHistoryState.processes = current
	persistRuntimeStateLocked()
	sort.SliceStable(events, func(i, j int) bool {
		if events[i].EventType == events[j].EventType {
			return events[i].Name < events[j].Name
		}
		return events[i].EventType < events[j].EventType
	})
	if len(events) > 80 {
		events = events[:80]
	}
	return events
}

func runtimeConnectionEvents(connections []model.NetworkConnection) []model.NetworkEvent {
	current := make(map[string]trackedConnection, len(connections))
	for _, connection := range connections {
		key := connectionTrackingKey(connection)
		if key == "" {
			continue
		}
		current[key] = trackedConnection{Connection: connection, Key: key}
	}

	runtimeHistoryState.Lock()
	defer runtimeHistoryState.Unlock()
	loadRuntimeStateLocked()

	previous := runtimeHistoryState.connections
	if previous == nil {
		runtimeHistoryState.connections = current
		persistRuntimeStateLocked()
		return nil
	}

	now := time.Now().UTC().Format(time.RFC3339)
	events := make([]model.NetworkEvent, 0, 64)
	for key, connection := range current {
		if _, exists := previous[key]; exists {
			continue
		}
		events = append(events, networkConnectionEvent(connection.Connection, "opened", now))
	}
	for key, connection := range previous {
		if _, exists := current[key]; exists {
			continue
		}
		events = append(events, networkConnectionEvent(connection.Connection, "closed", now))
	}

	runtimeHistoryState.connections = current
	persistRuntimeStateLocked()
	if len(events) > 80 {
		events = events[:80]
	}
	return events
}

func processTrackingKey(process model.Process) string {
	if process.PID == 0 {
		return ""
	}
	return fmt.Sprintf(
		"%d|%s|%s|%s",
		process.PID,
		strings.ToLower(strings.TrimSpace(process.Name)),
		strings.TrimSpace(process.StartedAt),
		strings.TrimSpace(process.ExePath),
	)
}

func parentTrackingKey(ppid int32, processes []model.Process) string {
	if ppid == 0 {
		return ""
	}
	for _, process := range processes {
		if process.PID != ppid {
			continue
		}
		return processTrackingKey(process)
	}
	return ""
}

func connectionTrackingKey(connection model.NetworkConnection) string {
	if connection.LocalPort == 0 && connection.RemotePort == 0 {
		return ""
	}
	return strings.ToLower(
		fmt.Sprintf(
			"%d|%s|%s|%s|%d|%s|%d|%s",
			connection.PID,
			connection.ProcessName,
			connection.Protocol,
			connection.LocalAddress,
			connection.LocalPort,
			connection.RemoteAddress,
			connection.RemotePort,
			connection.Status,
		),
	)
}

func networkConnectionEvent(connection model.NetworkConnection, eventType string, occurredAt string) model.NetworkEvent {
	return model.NetworkEvent{
		PID:           connection.PID,
		ProcessName:   connection.ProcessName,
		Protocol:      connection.Protocol,
		Status:        connection.Status,
		LocalAddress:  connection.LocalAddress,
		LocalPort:     connection.LocalPort,
		RemoteAddress: connection.RemoteAddress,
		RemotePort:    connection.RemotePort,
		RemoteDomain:  connection.RemoteDomain,
		RemoteScope:   connection.RemoteScope,
		ServiceLabel:  connection.ServiceLabel,
		TLSSuspected:  connection.TLSSuspected,
		SecurityHint:  connection.SecurityHint,
		Direction:     connection.Direction,
		Family:        connection.Family,
		EventType:     eventType,
		OccurredAt:    occurredAt,
	}
}

func loadRuntimeStateLocked() {
	if runtimeHistoryState.loaded {
		return
	}
	runtimeHistoryState.loaded = true

	path := strings.TrimSpace(runtimeHistoryState.statePath)
	if path == "" {
		return
	}

	data, err := os.ReadFile(path)
	if err != nil {
		return
	}

	var persisted persistedRuntimeState
	if json.Unmarshal(data, &persisted) != nil {
		return
	}

	runtimeHistoryState.processes = make(map[string]trackedProcess, len(persisted.Processes))
	for _, process := range persisted.Processes {
		key := processTrackingKey(process)
		if key == "" {
			continue
		}
		runtimeHistoryState.processes[key] = trackedProcess{Process: process, Key: key}
	}

	runtimeHistoryState.connections = make(map[string]trackedConnection, len(persisted.Connections))
	for _, connection := range persisted.Connections {
		key := connectionTrackingKey(connection)
		if key == "" {
			continue
		}
		runtimeHistoryState.connections[key] = trackedConnection{Connection: connection, Key: key}
	}
}

func persistRuntimeStateLocked() {
	path := strings.TrimSpace(runtimeHistoryState.statePath)
	if path == "" {
		return
	}

	persisted := persistedRuntimeState{
		Processes:   make([]model.Process, 0, len(runtimeHistoryState.processes)),
		Connections: make([]model.NetworkConnection, 0, len(runtimeHistoryState.connections)),
	}
	for _, process := range runtimeHistoryState.processes {
		persisted.Processes = append(persisted.Processes, process.Process)
	}
	for _, connection := range runtimeHistoryState.connections {
		persisted.Connections = append(persisted.Connections, connection.Connection)
	}

	data, err := json.MarshalIndent(persisted, "", "  ")
	if err != nil {
		return
	}
	if err := os.MkdirAll(filepath.Dir(path), 0o700); err != nil {
		return
	}
	_ = os.WriteFile(path, data, 0o600)
}
