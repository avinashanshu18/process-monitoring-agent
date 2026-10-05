package helperbridge

import (
	"encoding/json"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"time"

	"hostlens-go-agent/internal/collector"
	"hostlens-go-agent/internal/model"
)

type Envelope struct {
	Source           string                      `json:"source"`
	ProcessEvents    []model.ProcessEvent        `json:"process_events,omitempty"`
	NetworkEvents    []model.NetworkEvent        `json:"network_events,omitempty"`
	FileEvents       []model.FileEvent           `json:"file_events,omitempty"`
	AuthEvents       []model.AuthEvent           `json:"auth_events,omitempty"`
	DNSEvents        []model.DNSEvent            `json:"dns_events,omitempty"`
	ServiceInventory []model.ServiceItem         `json:"service_inventory,omitempty"`
	StartupItems     []model.StartupItem         `json:"startup_items,omitempty"`
	Capabilities     []model.CollectorCapability `json:"collector_capabilities,omitempty"`
}

type Bridge struct {
	spoolDir string
}

func New(spoolDir string) (*Bridge, error) {
	spoolDir = strings.TrimSpace(spoolDir)
	if spoolDir == "" {
		return nil, nil
	}
	if err := os.MkdirAll(spoolDir, 0o700); err != nil {
		return nil, err
	}
	return &Bridge{spoolDir: spoolDir}, nil
}

func (bridge *Bridge) Drain() collector.HelperBatch {
	if bridge == nil {
		return collector.HelperBatch{}
	}
	entries, err := os.ReadDir(bridge.spoolDir)
	if err != nil {
		return collector.HelperBatch{}
	}

	sort.SliceStable(entries, func(i, j int) bool {
		return entries[i].Name() < entries[j].Name()
	})

	batch := collector.HelperBatch{}
	for _, entry := range entries {
		if entry.IsDir() || !strings.HasSuffix(entry.Name(), ".json") {
			continue
		}
		path := filepath.Join(bridge.spoolDir, entry.Name())
		data, err := os.ReadFile(path)
		if err != nil {
			continue
		}
		var envelope Envelope
		if json.Unmarshal(data, &envelope) != nil {
			_ = os.Rename(path, path+".invalid-"+time.Now().UTC().Format("20060102150405"))
			continue
		}
		batch.ProcessEvents = append(batch.ProcessEvents, envelope.ProcessEvents...)
		batch.NetworkEvents = append(batch.NetworkEvents, envelope.NetworkEvents...)
		batch.FileEvents = append(batch.FileEvents, envelope.FileEvents...)
		batch.AuthEvents = append(batch.AuthEvents, envelope.AuthEvents...)
		batch.DNSEvents = append(batch.DNSEvents, envelope.DNSEvents...)
		batch.ServiceInventory = append(batch.ServiceInventory, envelope.ServiceInventory...)
		batch.StartupItems = append(batch.StartupItems, envelope.StartupItems...)
		batch.Capabilities = append(batch.Capabilities, envelope.Capabilities...)
		_ = os.Remove(path)
	}

	batch.ProcessEvents = truncateProcessEvents(batch.ProcessEvents, 240)
	batch.NetworkEvents = truncateNetworkEvents(batch.NetworkEvents, 240)
	batch.FileEvents = truncateFileEvents(batch.FileEvents, 200)
	batch.AuthEvents = truncateAuthEvents(batch.AuthEvents, 96)
	batch.DNSEvents = truncateDNSEvents(batch.DNSEvents, 160)
	batch.ServiceInventory = truncateServiceItems(batch.ServiceInventory, 240)
	batch.StartupItems = truncateStartupItems(batch.StartupItems, 120)
	batch.Capabilities = truncateCapabilities(batch.Capabilities, 24)
	return batch
}

func (bridge *Bridge) Sources() []string {
	if bridge == nil {
		return nil
	}
	entries, err := os.ReadDir(bridge.spoolDir)
	if err != nil {
		return nil
	}
	seen := make(map[string]struct{})
	results := make([]string, 0, len(entries))
	for _, entry := range entries {
		if entry.IsDir() || !strings.HasSuffix(entry.Name(), ".json") {
			continue
		}
		source := strings.TrimSuffix(entry.Name(), ".json")
		source = strings.SplitN(source, "-", 2)[0]
		if source == "" {
			continue
		}
		if _, ok := seen[source]; ok {
			continue
		}
		seen[source] = struct{}{}
		results = append(results, source)
	}
	sort.Strings(results)
	return results
}

func truncateProcessEvents(items []model.ProcessEvent, limit int) []model.ProcessEvent {
	if len(items) > limit {
		return items[:limit]
	}
	return items
}

func truncateNetworkEvents(items []model.NetworkEvent, limit int) []model.NetworkEvent {
	if len(items) > limit {
		return items[:limit]
	}
	return items
}

func truncateFileEvents(items []model.FileEvent, limit int) []model.FileEvent {
	if len(items) > limit {
		return items[:limit]
	}
	return items
}

func truncateAuthEvents(items []model.AuthEvent, limit int) []model.AuthEvent {
	if len(items) > limit {
		return items[:limit]
	}
	return items
}

func truncateDNSEvents(items []model.DNSEvent, limit int) []model.DNSEvent {
	if len(items) > limit {
		return items[:limit]
	}
	return items
}

func truncateServiceItems(items []model.ServiceItem, limit int) []model.ServiceItem {
	if len(items) > limit {
		return items[:limit]
	}
	return items
}

func truncateStartupItems(items []model.StartupItem, limit int) []model.StartupItem {
	if len(items) > limit {
		return items[:limit]
	}
	return items
}

func truncateCapabilities(items []model.CollectorCapability, limit int) []model.CollectorCapability {
	if len(items) > limit {
		return items[:limit]
	}
	return items
}
