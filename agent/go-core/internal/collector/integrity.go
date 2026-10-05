package collector

import (
	"fmt"
	"os"
	"path/filepath"
	"runtime"
	"sort"
	"strings"
	"time"

	"hostlens-go-agent/internal/model"
)

const maxIntegrityItems = 200

func collectFileIntegrityItems() []model.FileIntegrityItem {
	candidates := integrityCandidates()
	items := make([]model.FileIntegrityItem, 0, len(candidates))
	seen := make(map[string]struct{})

	for _, candidate := range candidates {
		if candidate.directory {
			entries, err := os.ReadDir(candidate.path)
			if err != nil {
				continue
			}
			for _, entry := range entries {
				if entry.IsDir() {
					continue
				}
				childPath := filepath.Join(candidate.path, entry.Name())
				if !matchesIntegrityExtension(childPath) {
					continue
				}
				if _, exists := seen[childPath]; exists {
					continue
				}
				item, ok := buildFileIntegrityItem(childPath, candidate.category)
				if !ok {
					continue
				}
				seen[childPath] = struct{}{}
				items = append(items, item)
			}
			continue
		}

		if _, exists := seen[candidate.path]; exists {
			continue
		}
		item, ok := buildFileIntegrityItem(candidate.path, candidate.category)
		if !ok {
			continue
		}
		seen[candidate.path] = struct{}{}
		items = append(items, item)
	}

	sort.SliceStable(items, func(i, j int) bool {
		if items[i].Category == items[j].Category {
			return items[i].Path < items[j].Path
		}
		return items[i].Category < items[j].Category
	})
	if len(items) > maxIntegrityItems {
		items = items[:maxIntegrityItems]
	}
	return items
}

type integrityCandidate struct {
	path      string
	category  string
	directory bool
}

type IntegrityTarget struct {
	Path      string
	Category  string
	Directory bool
}

func integrityCandidates() []integrityCandidate {
	candidates := []integrityCandidate{
		{path: "/etc/hosts", category: "system_config"},
	}

	if runtime.GOOS == "darwin" {
		candidates = append(candidates,
			integrityCandidate{path: "/etc/sudoers", category: "system_config"},
			integrityCandidate{path: "/Library/LaunchDaemons", category: "launch_daemon", directory: true},
			integrityCandidate{path: "/Library/LaunchAgents", category: "launch_agent", directory: true},
			integrityCandidate{path: "/Library/Preferences", category: "system_preferences", directory: true},
		)
	}

	if runtime.GOOS == "linux" {
		candidates = append(candidates,
			integrityCandidate{path: "/etc/passwd", category: "system_config"},
			integrityCandidate{path: "/etc/sudoers", category: "system_config"},
			integrityCandidate{path: "/etc/ssh", category: "ssh_config", directory: true},
			integrityCandidate{path: "/etc/NetworkManager/system-connections", category: "network_profile", directory: true},
			integrityCandidate{path: "/etc/systemd/system", category: "service_unit", directory: true},
			integrityCandidate{path: "/etc/cron.d", category: "cron", directory: true},
		)
	}

	if home, err := os.UserHomeDir(); err == nil && strings.TrimSpace(home) != "" {
		candidates = append(candidates,
			integrityCandidate{path: filepath.Join(home, ".zshrc"), category: "shell_profile"},
			integrityCandidate{path: filepath.Join(home, ".bash_profile"), category: "shell_profile"},
			integrityCandidate{path: filepath.Join(home, ".bashrc"), category: "shell_profile"},
			integrityCandidate{path: filepath.Join(home, ".profile"), category: "shell_profile"},
			integrityCandidate{path: filepath.Join(home, ".ssh", "authorized_keys"), category: "ssh_config"},
			integrityCandidate{path: filepath.Join(home, ".ssh", "config"), category: "ssh_config"},
			integrityCandidate{path: filepath.Join(home, ".config", "autostart"), category: "user_autostart", directory: true},
		)
		if runtime.GOOS == "darwin" {
			candidates = append(candidates,
				integrityCandidate{path: filepath.Join(home, "Library", "LaunchAgents"), category: "launch_agent", directory: true},
				integrityCandidate{path: filepath.Join(home, "Library", "Preferences"), category: "user_preferences", directory: true},
			)
		}
		if runtime.GOOS == "linux" {
			candidates = append(candidates,
				integrityCandidate{path: filepath.Join(home, ".config", "systemd", "user"), category: "service_unit", directory: true},
			)
		}
	}

	return candidates
}

func IntegrityWatchTargets() []IntegrityTarget {
	targets := integrityCandidates()
	result := make([]IntegrityTarget, 0, len(targets))
	for _, target := range targets {
		result = append(result, IntegrityTarget{
			Path:      target.path,
			Category:  target.category,
			Directory: target.directory,
		})
	}
	return result
}

func IntegrityCategoryForPath(path string) (string, bool) {
	cleanedPath := filepath.Clean(path)
	for _, target := range integrityCandidates() {
		if target.directory {
			if strings.HasPrefix(cleanedPath, filepath.Clean(target.path)+string(os.PathSeparator)) &&
				matchesIntegrityExtension(cleanedPath) {
				return target.category, true
			}
			continue
		}
		if filepath.Clean(target.path) == cleanedPath {
			return target.category, true
		}
	}
	return "", false
}

func matchesIntegrityExtension(path string) bool {
	lower := strings.ToLower(path)
	for _, suffix := range []string{".plist", ".service", ".timer", ".socket", ".conf", ".rules", ".cron"} {
		if strings.HasSuffix(lower, suffix) {
			return true
		}
	}
	return false
}

func buildFileIntegrityItem(path string, category string) (model.FileIntegrityItem, bool) {
	info, err := os.Stat(path)
	if err != nil || info.IsDir() {
		return model.FileIntegrityItem{}, false
	}

	modifiedAt := ""
	if !info.ModTime().IsZero() {
		modifiedAt = info.ModTime().UTC().Format(time.RFC3339)
	}

	return model.FileIntegrityItem{
		Path:       path,
		Category:   category,
		ModifiedAt: modifiedAt,
		SizeBytes:  info.Size(),
		SHA256:     fileSHA256(path),
		Mode:       fmt.Sprintf("%#o", info.Mode().Perm()),
	}, true
}
