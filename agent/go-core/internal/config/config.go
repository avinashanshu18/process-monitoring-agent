package config

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"errors"
	"os"
	"path/filepath"
	"strconv"
)

type Config struct {
	Endpoint              string `json:"endpoint"`
	APIKey                string `json:"api_key"`
	AgentID               string `json:"agent_id"`
	DeviceType            string `json:"device_type"`
	HostnameOverride      string `json:"hostname_override"`
	IntervalSeconds       int    `json:"interval_seconds"`
	ReleaseManifestURL    string `json:"release_manifest_url"`
	ReleaseChannel        string `json:"release_channel"`
	AutoUpdate            bool   `json:"auto_update"`
	DeepCollectorSpoolDir string `json:"deep_collector_spool_dir"`
}

func defaultConfigPath() string {
	if value := os.Getenv("HOSTLENS_AGENT_CONFIG"); value != "" {
		return value
	}
	return filepath.Join(".", "config.json")
}

func Load() (Config, string, error) {
	path := defaultConfigPath()
	cfg := Config{
		DeviceType:      "desktop",
		IntervalSeconds: 60,
		ReleaseChannel:  "stable",
		AutoUpdate:      true,
	}

	if data, err := os.ReadFile(path); err == nil {
		if err := json.Unmarshal(data, &cfg); err != nil {
			return Config{}, path, err
		}
	}

	if value := os.Getenv("PROC_ENDPOINT"); value != "" {
		cfg.Endpoint = value
	}
	if value := os.Getenv("PROC_API_KEY"); value != "" {
		cfg.APIKey = value
	}
	if value := os.Getenv("PROC_AGENT_ID"); value != "" {
		cfg.AgentID = value
	}
	if value := os.Getenv("PROC_DEVICE_TYPE"); value != "" {
		cfg.DeviceType = value
	}
	if value := os.Getenv("PROC_HOSTNAME_OVERRIDE"); value != "" {
		cfg.HostnameOverride = value
	}
	if value := os.Getenv("PROC_INTERVAL_SECONDS"); value != "" {
		interval, err := strconv.Atoi(value)
		if err != nil {
			return Config{}, path, errors.New("PROC_INTERVAL_SECONDS must be a whole number")
		}
		cfg.IntervalSeconds = interval
	}
	if value := os.Getenv("PROC_RELEASE_MANIFEST_URL"); value != "" {
		cfg.ReleaseManifestURL = value
	}
	if value := os.Getenv("PROC_RELEASE_CHANNEL"); value != "" {
		cfg.ReleaseChannel = value
	}
	if value := os.Getenv("PROC_AUTO_UPDATE"); value != "" {
		autoUpdate, err := strconv.ParseBool(value)
		if err != nil {
			return Config{}, path, errors.New("PROC_AUTO_UPDATE must be true or false")
		}
		cfg.AutoUpdate = autoUpdate
	}
	if value := os.Getenv("PROC_DEEP_COLLECTOR_SPOOL_DIR"); value != "" {
		cfg.DeepCollectorSpoolDir = value
	}

	if cfg.DeviceType == "" {
		cfg.DeviceType = "desktop"
	}
	if cfg.IntervalSeconds <= 0 {
		cfg.IntervalSeconds = 60
	}
	if cfg.ReleaseChannel == "" {
		cfg.ReleaseChannel = "stable"
	}
	if cfg.DeepCollectorSpoolDir == "" {
		cfg.DeepCollectorSpoolDir = filepath.Join(filepath.Dir(path), ".hostlens-deep-collectors")
	}

	if cfg.AgentID == "" {
		cfg.AgentID = generateAgentID()
		if err := Save(path, cfg); err != nil {
			return Config{}, path, err
		}
	}

	if cfg.Endpoint == "" || cfg.APIKey == "" {
		return Config{}, path, errors.New("missing endpoint or api_key in config/env")
	}

	return cfg, path, nil
}

func Save(path string, cfg Config) error {
	data, err := json.MarshalIndent(cfg, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(path, data, 0o600)
}

func generateAgentID() string {
	var bytes [16]byte
	if _, err := rand.Read(bytes[:]); err != nil {
		return "hostlens-agent-fallback"
	}
	return hex.EncodeToString(bytes[:])
}
