package updater

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"
	"time"
)

type Artifact struct {
	Filename  string `json:"filename"`
	Label     string `json:"label"`
	Kind      string `json:"kind"`
	Target    string `json:"target"`
	SHA256    string `json:"sha256"`
	SizeBytes int64  `json:"size_bytes"`
	URL       string `json:"url"`
}

type Manifest struct {
	Version     string              `json:"version"`
	GeneratedAt string              `json:"generated_at"`
	Artifacts   map[string]Artifact `json:"artifacts"`
}

type Result struct {
	Applied  bool
	Version  string
	Artifact Artifact
}

func FetchManifest(url string) (Manifest, error) {
	client := &http.Client{Timeout: 20 * time.Second}
	response, err := client.Get(url)
	if err != nil {
		return Manifest{}, err
	}
	defer response.Body.Close()

	if response.StatusCode >= 300 {
		return Manifest{}, fmt.Errorf("update manifest returned %d", response.StatusCode)
	}

	var manifest Manifest
	if err := json.NewDecoder(response.Body).Decode(&manifest); err != nil {
		return Manifest{}, err
	}
	if manifest.Version == "" {
		return Manifest{}, errors.New("release manifest is missing version")
	}
	return manifest, nil
}

func TargetKey(goos, goarch string) (string, error) {
	switch {
	case goos == "darwin":
		return "macos_universal", nil
	case goos == "linux" && goarch == "amd64":
		return "linux_amd64", nil
	case goos == "windows" && goarch == "amd64":
		return "windows_amd64", nil
	default:
		return "", fmt.Errorf("no update artifact mapping for %s/%s", goos, goarch)
	}
}

func BinaryVersion(executablePath string) string {
	output, err := exec.Command(executablePath, "--version").Output()
	if err != nil {
		return ""
	}
	return strings.TrimSpace(string(output))
}

func ShouldAutoUpdate(manifestURL string, autoUpdate bool, currentVersion string, executablePath string) bool {
	if !autoUpdate || manifestURL == "" || currentVersion == "" || currentVersion == "dev" {
		return false
	}
	lower := strings.ToLower(executablePath)
	return !strings.Contains(lower, "go-build")
}

func ApplyBinaryUpdate(manifestURL, currentVersion, executablePath string, targetKey string) (Result, error) {
	manifest, err := FetchManifest(manifestURL)
	if err != nil {
		return Result{}, err
	}
	if manifest.Version == currentVersion {
		return Result{Applied: false, Version: manifest.Version}, nil
	}

	artifact, ok := manifest.Artifacts[targetKey]
	if !ok {
		return Result{}, fmt.Errorf("update artifact %s not found", targetKey)
	}

	client := &http.Client{Timeout: 60 * time.Second}
	artifactURL, err := resolveArtifactURL(manifestURL, artifact.URL)
	if err != nil {
		return Result{}, err
	}

	response, err := client.Get(artifactURL)
	if err != nil {
		return Result{}, err
	}
	defer response.Body.Close()

	if response.StatusCode >= 300 {
		return Result{}, fmt.Errorf("artifact download returned %d", response.StatusCode)
	}

	execDir := filepath.Dir(executablePath)
	tmpFile, err := os.CreateTemp(execDir, ".hostlens-update-*")
	if err != nil {
		return Result{}, err
	}

	hasher := sha256.New()
	writer := io.MultiWriter(tmpFile, hasher)
	if _, err := io.Copy(writer, response.Body); err != nil {
		_ = tmpFile.Close()
		_ = os.Remove(tmpFile.Name())
		return Result{}, err
	}

	if err := tmpFile.Close(); err != nil {
		_ = os.Remove(tmpFile.Name())
		return Result{}, err
	}

	checksum := hex.EncodeToString(hasher.Sum(nil))
	if !strings.EqualFold(checksum, artifact.SHA256) {
		_ = os.Remove(tmpFile.Name())
		return Result{}, fmt.Errorf("checksum mismatch for %s", artifact.Filename)
	}

	if runtime.GOOS != "windows" {
		if err := os.Chmod(tmpFile.Name(), 0o755); err != nil {
			_ = os.Remove(tmpFile.Name())
			return Result{}, err
		}
	}

	if runtime.GOOS == "windows" {
		if err := os.Remove(executablePath); err != nil && !os.IsNotExist(err) {
			_ = os.Remove(tmpFile.Name())
			return Result{}, err
		}
	}

	if err := os.Rename(tmpFile.Name(), executablePath); err != nil {
		_ = os.Remove(tmpFile.Name())
		return Result{}, err
	}

	return Result{
		Applied:  true,
		Version:  manifest.Version,
		Artifact: artifact,
	}, nil
}

func resolveArtifactURL(manifestURL, artifactURL string) (string, error) {
	parsedArtifact, err := url.Parse(artifactURL)
	if err != nil {
		return "", err
	}
	if parsedArtifact.IsAbs() {
		return parsedArtifact.String(), nil
	}

	parsedManifest, err := url.Parse(manifestURL)
	if err != nil {
		return "", err
	}
	return parsedManifest.ResolveReference(parsedArtifact).String(), nil
}
