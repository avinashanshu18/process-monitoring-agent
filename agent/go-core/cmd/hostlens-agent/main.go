package main

import (
	"flag"
	"fmt"
	"os"
	"os/signal"
	"path/filepath"
	"runtime"
	"syscall"
	"time"

	"hostlens-go-agent/internal/actions"
	"hostlens-go-agent/internal/collector"
	"hostlens-go-agent/internal/config"
	"hostlens-go-agent/internal/eventstream"
	"hostlens-go-agent/internal/helperbridge"
	"hostlens-go-agent/internal/transport"
	"hostlens-go-agent/internal/updater"
	"hostlens-go-agent/internal/version"
)

func main() {
	runOnce := flag.Bool("once", false, "collect and upload a single snapshot, then exit")
	printVersion := flag.Bool("version", false, "print the current HostLens agent version")
	flag.Parse()

	if *printVersion {
		fmt.Println(version.AgentVersion)
		return
	}

	collector.SetRuntimeSignals(collector.RuntimeSignals{})

	cfg, configPath, err := config.Load()
	if err != nil {
		exitWithError(err)
	}
	collector.SetRuntimeStatePath(runtimeStatePath(configPath))

	executablePath, err := os.Executable()
	if err != nil {
		exitWithError(err)
	}

	if runtime.GOOS != "windows" && !*runOnce {
		if err := maybeSelfUpdate(cfg, executablePath); err != nil {
			fmt.Fprintf(os.Stderr, "agent update warning: %v\n", err)
		}
	}

	if !*runOnce {
		if tracker, err := eventstream.NewFileTracker(); err == nil {
			bridge, _ := helperbridge.New(cfg.DeepCollectorSpoolDir)
			defer tracker.Close()
			collector.SetRuntimeSignals(collector.RuntimeSignals{
				DrainFileEvents: tracker.Drain,
				DrainHelperBatch: func() collector.HelperBatch {
					if bridge == nil {
						return collector.HelperBatch{}
					}
					return bridge.Drain()
				},
				DynamicSources: func() []string {
					sources := tracker.Sources()
					if bridge != nil {
						sources = append(sources, bridge.Sources()...)
					}
					return sources
				},
			})
		} else {
			fmt.Fprintf(os.Stderr, "agent watcher warning: %v\n", err)
		}
	}

	if *runOnce {
		if _, err := uploadSnapshot(cfg, configPath); err != nil {
			exitWithError(err)
		}
		return
	}

	if cfg, err = uploadSnapshot(cfg, configPath); err != nil {
		fmt.Fprintf(os.Stderr, "agent warning: %v\n", err)
	}
	if cfg, err = processQueuedActions(cfg, configPath); err != nil {
		fmt.Fprintf(os.Stderr, "agent action warning: %v\n", err)
	}

	ticker := time.NewTicker(time.Duration(cfg.IntervalSeconds) * time.Second)
	defer ticker.Stop()

	signals := make(chan os.Signal, 1)
	signal.Notify(signals, syscall.SIGINT, syscall.SIGTERM)
	defer signal.Stop(signals)

	fmt.Printf("HostLens agent running with %ds interval\n", cfg.IntervalSeconds)

	for {
		select {
		case <-signals:
			fmt.Println("HostLens agent stopping")
			return
		case <-ticker.C:
			updatedCfg, err := uploadSnapshot(cfg, configPath)
			if err != nil {
				fmt.Fprintf(os.Stderr, "agent warning: %v\n", err)
				continue
			}
			updatedCfg, err = processQueuedActions(updatedCfg, configPath)
			if err != nil {
				fmt.Fprintf(os.Stderr, "agent action warning: %v\n", err)
			}
			cfg = updatedCfg
		}
	}
}

func maybeSelfUpdate(cfg config.Config, executablePath string) error {
	if !updater.ShouldAutoUpdate(
		cfg.ReleaseManifestURL,
		cfg.AutoUpdate,
		version.AgentVersion,
		executablePath,
	) {
		return nil
	}

	targetKey, err := updater.TargetKey(runtime.GOOS, runtime.GOARCH)
	if err != nil {
		return err
	}

	result, err := updater.ApplyBinaryUpdate(
		cfg.ReleaseManifestURL,
		version.AgentVersion,
		executablePath,
		targetKey,
	)
	if err != nil || !result.Applied {
		return err
	}

	fmt.Printf(
		"Applied HostLens update %s using %s. Restarting agent.\n",
		result.Version,
		result.Artifact.Filename,
	)

	return restartProcess(executablePath)
}

func uploadSnapshot(cfg config.Config, configPath string) (config.Config, error) {
	payload, err := collector.Collect(cfg)
	if err != nil {
		return cfg, err
	}

	response, err := transport.PostSnapshot(cfg.Endpoint, cfg.APIKey, payload)
	if err != nil {
		return cfg, err
	}

	if response.HostAPIKey != "" && response.HostAPIKey != cfg.APIKey {
		cfg.APIKey = response.HostAPIKey
		if err := config.Save(configPath, cfg); err != nil {
			return cfg, err
		}
	}

	fmt.Printf(
		"Uploaded snapshot for %s (%s): %d processes\n",
		payload.Hostname,
		payload.AgentID,
		response.TotalProcesses,
	)
	return cfg, nil
}

func processQueuedActions(cfg config.Config, configPath string) (config.Config, error) {
	for {
		action, err := transport.FetchNextAction(cfg.Endpoint, cfg.APIKey, cfg.AgentID)
		if err != nil {
			return cfg, err
		}
		if action == nil {
			return cfg, nil
		}

		result, refreshAfter, execErr := actions.Execute(cfg, *action)
		if execErr != nil && result.Status == "" {
			result.Status = "failed"
			result.Result = map[string]any{"error": execErr.Error()}
		}
		if result.Status == "" {
			result.Status = "failed"
			result.Result = map[string]any{"error": "action completed without status"}
		}
		if err := transport.PostActionResult(cfg.Endpoint, cfg.APIKey, action.ID, result); err != nil {
			return cfg, err
		}
		if refreshAfter {
			updatedCfg, err := uploadSnapshot(cfg, configPath)
			if err != nil {
				return cfg, err
			}
			cfg = updatedCfg
		}
	}
}

func exitWithError(err error) {
	fmt.Fprintf(os.Stderr, "agent error: %v\n", err)
	os.Exit(1)
}

func runtimeStatePath(configPath string) string {
	if configPath == "" {
		return ""
	}
	base := filepath.Base(configPath)
	return filepath.Join(filepath.Dir(configPath), "."+base+".runtime-state.json")
}
