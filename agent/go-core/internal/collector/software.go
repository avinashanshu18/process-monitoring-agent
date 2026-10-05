package collector

import (
	"bufio"
	"crypto/sha256"
	"encoding/hex"
	"io"
	"io/fs"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"sort"
	"strings"
	"sync"
	"time"

	"hostlens-go-agent/internal/model"

	"howett.net/plist"
)

const (
	maxSoftwareItems     = 60
	softwareInventoryTTL = 15 * time.Minute
	maxHashFileSize      = 35 * 1024 * 1024
)

var softwareInventoryCache struct {
	mu          sync.Mutex
	collectedAt time.Time
	items       []model.SoftwareItem
}

func collectSoftwareInventory() []model.SoftwareItem {
	softwareInventoryCache.mu.Lock()
	defer softwareInventoryCache.mu.Unlock()

	if len(softwareInventoryCache.items) > 0 && time.Since(softwareInventoryCache.collectedAt) < softwareInventoryTTL {
		return cloneSoftwareInventory(softwareInventoryCache.items)
	}

	var items []model.SoftwareItem
	switch runtime.GOOS {
	case "darwin":
		items = collectDarwinSoftwareInventory()
	case "linux":
		items = collectLinuxSoftwareInventory()
	case "windows":
		items = collectWindowsSoftwareInventory()
	default:
		items = nil
	}

	softwareInventoryCache.collectedAt = time.Now()
	softwareInventoryCache.items = cloneSoftwareInventory(items)
	return cloneSoftwareInventory(items)
}

func cloneSoftwareInventory(items []model.SoftwareItem) []model.SoftwareItem {
	cloned := make([]model.SoftwareItem, len(items))
	copy(cloned, items)
	return cloned
}

func collectDarwinSoftwareInventory() []model.SoftwareItem {
	roots := []string{"/Applications"}
	if home, err := os.UserHomeDir(); err == nil && strings.TrimSpace(home) != "" {
		roots = append(roots, filepath.Join(home, "Applications"))
	}

	items := make([]model.SoftwareItem, 0, 32)
	seen := make(map[string]struct{})
	for _, root := range roots {
		for _, appPath := range discoverDarwinAppBundles(root) {
			item, ok := buildDarwinSoftwareItem(appPath)
			if !ok {
				continue
			}
			key := softwareInventoryKey(item)
			if _, exists := seen[key]; exists {
				continue
			}
			seen[key] = struct{}{}
			items = append(items, item)
		}
	}

	sortSoftwareInventory(items)
	if len(items) > maxSoftwareItems {
		items = items[:maxSoftwareItems]
	}
	return items
}

func discoverDarwinAppBundles(root string) []string {
	paths := make([]string, 0, 32)
	info, err := os.Stat(root)
	if err != nil || !info.IsDir() {
		return paths
	}

	_ = filepath.WalkDir(root, func(path string, entry fs.DirEntry, walkErr error) error {
		if walkErr != nil {
			return nil
		}

		relativePath, err := filepath.Rel(root, path)
		if err == nil && relativePath != "." {
			depth := strings.Count(relativePath, string(filepath.Separator))
			if depth > 2 && entry.IsDir() {
				return filepath.SkipDir
			}
		}

		if entry.IsDir() && strings.HasSuffix(strings.ToLower(entry.Name()), ".app") {
			paths = append(paths, path)
			return filepath.SkipDir
		}

		return nil
	})

	sort.Strings(paths)
	return paths
}

func buildDarwinSoftwareItem(appPath string) (model.SoftwareItem, bool) {
	infoPlist := filepath.Join(appPath, "Contents", "Info.plist")
	file, err := os.Open(infoPlist)
	if err != nil {
		return model.SoftwareItem{}, false
	}
	defer file.Close()

	var metadata map[string]any
	if err := plist.NewDecoder(file).Decode(&metadata); err != nil {
		return model.SoftwareItem{}, false
	}

	name := firstNonEmptyString(
		stringValue(metadata["CFBundleDisplayName"]),
		stringValue(metadata["CFBundleName"]),
		strings.TrimSuffix(filepath.Base(appPath), ".app"),
	)
	executableName := stringValue(metadata["CFBundleExecutable"])
	executablePath := ""
	if executableName != "" {
		executablePath = filepath.Join(appPath, "Contents", "MacOS", executableName)
	}

	signer, teamIdentifier, signatureState := darwinSignatureMetadata(appPath)
	publisher := signer
	if publisher == "" {
		publisher = teamIdentifier
	}

	return model.SoftwareItem{
		Name:           name,
		Identifier:     stringValue(metadata["CFBundleIdentifier"]),
		Version:        firstNonEmptyString(stringValue(metadata["CFBundleShortVersionString"]), stringValue(metadata["CFBundleVersion"])),
		Publisher:      publisher,
		InstallPath:    appPath,
		InstallScope:   installScope(appPath),
		InstallSource:  "app_bundle",
		ExecutablePath: executablePath,
		SignatureState: signatureState,
		Signer:         signer,
		TeamIdentifier: teamIdentifier,
		SHA256:         fileSHA256(executablePath),
	}, true
}

func darwinSignatureMetadata(appPath string) (string, string, string) {
	output, err := runCommandCombinedOutput(
		1500*time.Millisecond,
		48*1024,
		"/usr/bin/codesign",
		"-dv",
		"--verbose=4",
		appPath,
	)
	text := string(output)
	signer := ""
	teamIdentifier := ""

	scanner := bufio.NewScanner(strings.NewReader(text))
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if strings.HasPrefix(line, "Authority=") && signer == "" {
			signer = strings.TrimSpace(strings.TrimPrefix(line, "Authority="))
		}
		if strings.HasPrefix(line, "TeamIdentifier=") {
			teamIdentifier = strings.TrimSpace(strings.TrimPrefix(line, "TeamIdentifier="))
		}
	}

	if err != nil {
		return signer, teamIdentifier, "unsigned"
	}
	if strings.Contains(strings.ToLower(signer), "apple") {
		return signer, teamIdentifier, "platform"
	}
	return signer, teamIdentifier, "trusted"
}

func collectLinuxSoftwareInventory() []model.SoftwareItem {
	switch {
	case commandAvailable("dpkg-query"):
		return collectLinuxDpkgInventory()
	case commandAvailable("rpm"):
		return collectLinuxRpmInventory()
	default:
		return collectLinuxDesktopEntries()
	}
}

func collectLinuxDpkgInventory() []model.SoftwareItem {
	output, err := exec.Command("dpkg-query", "-W", "-f=${binary:Package}\t${Version}\t${Maintainer}\n").Output()
	if err != nil {
		return nil
	}

	items := make([]model.SoftwareItem, 0, 64)
	scanner := bufio.NewScanner(strings.NewReader(string(output)))
	for scanner.Scan() {
		parts := strings.Split(scanner.Text(), "\t")
		if len(parts) == 0 || strings.TrimSpace(parts[0]) == "" {
			continue
		}
		item := model.SoftwareItem{
			Name:           strings.TrimSpace(parts[0]),
			Identifier:     strings.TrimSpace(parts[0]),
			Version:        safeIndex(parts, 1),
			Publisher:      safeIndex(parts, 2),
			InstallScope:   "system",
			InstallSource:  "dpkg",
			SignatureState: "managed",
		}
		items = append(items, item)
	}

	sortSoftwareInventory(items)
	if len(items) > maxSoftwareItems {
		items = items[:maxSoftwareItems]
	}
	return items
}

func collectLinuxRpmInventory() []model.SoftwareItem {
	output, err := exec.Command("rpm", "-qa", "--queryformat", "%{NAME}\t%{VERSION}-%{RELEASE}\t%{VENDOR}\n").Output()
	if err != nil {
		return nil
	}

	items := make([]model.SoftwareItem, 0, 64)
	scanner := bufio.NewScanner(strings.NewReader(string(output)))
	for scanner.Scan() {
		parts := strings.Split(scanner.Text(), "\t")
		if len(parts) == 0 || strings.TrimSpace(parts[0]) == "" {
			continue
		}
		items = append(items, model.SoftwareItem{
			Name:           strings.TrimSpace(parts[0]),
			Identifier:     strings.TrimSpace(parts[0]),
			Version:        safeIndex(parts, 1),
			Publisher:      safeIndex(parts, 2),
			InstallScope:   "system",
			InstallSource:  "rpm",
			SignatureState: "managed",
		})
	}

	sortSoftwareInventory(items)
	if len(items) > maxSoftwareItems {
		items = items[:maxSoftwareItems]
	}
	return items
}

func collectLinuxDesktopEntries() []model.SoftwareItem {
	paths := []string{"/usr/share/applications"}
	if home, err := os.UserHomeDir(); err == nil && strings.TrimSpace(home) != "" {
		paths = append(paths, filepath.Join(home, ".local", "share", "applications"))
	}

	items := make([]model.SoftwareItem, 0, 32)
	seen := make(map[string]struct{})
	for _, directory := range paths {
		entries, err := os.ReadDir(directory)
		if err != nil {
			continue
		}
		for _, entry := range entries {
			if entry.IsDir() || !strings.HasSuffix(entry.Name(), ".desktop") {
				continue
			}
			name := strings.TrimSuffix(entry.Name(), ".desktop")
			path := filepath.Join(directory, entry.Name())
			if _, exists := seen[path]; exists {
				continue
			}
			seen[path] = struct{}{}
			items = append(items, model.SoftwareItem{
				Name:           name,
				Identifier:     name,
				InstallPath:    path,
				InstallScope:   installScope(path),
				InstallSource:  "desktop_entry",
				SignatureState: "unknown",
			})
		}
	}

	sortSoftwareInventory(items)
	if len(items) > maxSoftwareItems {
		items = items[:maxSoftwareItems]
	}
	return items
}

func sortSoftwareInventory(items []model.SoftwareItem) {
	sort.SliceStable(items, func(i, j int) bool {
		left := strings.ToLower(items[i].Name)
		right := strings.ToLower(items[j].Name)
		if left == right {
			return items[i].Version > items[j].Version
		}
		return left < right
	})
}

func softwareInventoryKey(item model.SoftwareItem) string {
	return firstNonEmptyString(item.Identifier, item.InstallPath, item.Name)
}

func installScope(path string) string {
	if path == "" {
		return ""
	}
	if home, err := os.UserHomeDir(); err == nil && strings.TrimSpace(home) != "" && strings.HasPrefix(path, home) {
		return "user"
	}
	return "system"
}

func commandAvailable(name string) bool {
	_, err := exec.LookPath(name)
	return err == nil
}

func fileSHA256(path string) string {
	if strings.TrimSpace(path) == "" {
		return ""
	}
	info, err := os.Stat(path)
	if err != nil || info.IsDir() || info.Size() > maxHashFileSize {
		return ""
	}

	file, err := os.Open(path)
	if err != nil {
		return ""
	}
	defer file.Close()

	hash := sha256.New()
	if _, err := io.Copy(hash, file); err != nil {
		return ""
	}
	return hex.EncodeToString(hash.Sum(nil))
}

func stringValue(value any) string {
	switch typed := value.(type) {
	case string:
		return strings.TrimSpace(typed)
	case []byte:
		return strings.TrimSpace(string(typed))
	default:
		return ""
	}
}

func firstNonEmptyString(values ...string) string {
	for _, value := range values {
		if strings.TrimSpace(value) != "" {
			return strings.TrimSpace(value)
		}
	}
	return ""
}

func safeIndex(values []string, index int) string {
	if index < len(values) {
		return strings.TrimSpace(values[index])
	}
	return ""
}
