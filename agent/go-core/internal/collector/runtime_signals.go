package collector

import (
	"sort"
	"sync"

	"hostlens-go-agent/internal/model"
	"hostlens-go-agent/internal/platformsignals"
)

type RuntimeSignals struct {
	DrainFileEvents  func() []model.FileEvent
	DrainHelperBatch func() HelperBatch
	DynamicSources   func() []string
}

type HelperBatch struct {
	ProcessEvents    []model.ProcessEvent
	NetworkEvents    []model.NetworkEvent
	FileEvents       []model.FileEvent
	AuthEvents       []model.AuthEvent
	DNSEvents        []model.DNSEvent
	ServiceInventory []model.ServiceItem
	StartupItems     []model.StartupItem
	Capabilities     []model.CollectorCapability
}

var runtimeSignalsState struct {
	sync.RWMutex
	signals RuntimeSignals
}

func SetRuntimeSignals(signals RuntimeSignals) {
	runtimeSignalsState.Lock()
	defer runtimeSignalsState.Unlock()
	runtimeSignalsState.signals = signals
}

func drainRuntimeFileEvents() []model.FileEvent {
	runtimeSignalsState.RLock()
	drain := runtimeSignalsState.signals.DrainFileEvents
	runtimeSignalsState.RUnlock()
	if drain == nil {
		return nil
	}
	return drain()
}

func drainRuntimeHelperBatch() HelperBatch {
	runtimeSignalsState.RLock()
	drain := runtimeSignalsState.signals.DrainHelperBatch
	runtimeSignalsState.RUnlock()
	if drain == nil {
		return HelperBatch{}
	}
	return drain()
}

func runtimeCollectorSources() []string {
	base := append([]string{}, platformsignals.DeepCollectors()...)

	runtimeSignalsState.RLock()
	dynamic := runtimeSignalsState.signals.DynamicSources
	runtimeSignalsState.RUnlock()
	if dynamic != nil {
		base = append(base, dynamic()...)
	}

	seen := make(map[string]struct{}, len(base))
	result := make([]string, 0, len(base))
	for _, item := range base {
		if item == "" {
			continue
		}
		if _, exists := seen[item]; exists {
			continue
		}
		seen[item] = struct{}{}
		result = append(result, item)
	}
	sort.Strings(result)
	return result
}
