package updater

import "testing"

func TestTargetKey(t *testing.T) {
	cases := []struct {
		goos   string
		goarch string
		want   string
	}{
		{goos: "darwin", goarch: "arm64", want: "macos_universal"},
		{goos: "darwin", goarch: "amd64", want: "macos_universal"},
		{goos: "linux", goarch: "amd64", want: "linux_amd64"},
		{goos: "windows", goarch: "amd64", want: "windows_amd64"},
	}

	for _, tc := range cases {
		got, err := TargetKey(tc.goos, tc.goarch)
		if err != nil {
			t.Fatalf("unexpected error for %s/%s: %v", tc.goos, tc.goarch, err)
		}
		if got != tc.want {
			t.Fatalf("target mismatch for %s/%s: got %s want %s", tc.goos, tc.goarch, got, tc.want)
		}
	}
}

func TestShouldAutoUpdate(t *testing.T) {
	if ShouldAutoUpdate("", true, "2026.04.01-0000", "/usr/local/bin/hostlens-agent") {
		t.Fatal("expected empty manifest url to disable updates")
	}
	if ShouldAutoUpdate("http://example.com/release-manifest.json", false, "2026.04.01-0000", "/usr/local/bin/hostlens-agent") {
		t.Fatal("expected auto_update=false to disable updates")
	}
	if ShouldAutoUpdate("http://example.com/release-manifest.json", true, "dev", "/usr/local/bin/hostlens-agent") {
		t.Fatal("expected dev builds to disable updates")
	}
	if ShouldAutoUpdate("http://example.com/release-manifest.json", true, "2026.04.01-0000", "/var/folders/.../go-build123/b001/exe/hostlens-agent") {
		t.Fatal("expected go-build paths to disable updates")
	}
	if !ShouldAutoUpdate("http://example.com/release-manifest.json", true, "2026.04.01-0000", "/usr/local/bin/hostlens-agent") {
		t.Fatal("expected installed binary path to allow updates")
	}
}

func TestResolveArtifactURL(t *testing.T) {
	got, err := resolveArtifactURL("https://hostlens.app/downloads/release-manifest.json", "/downloads/hostlens-agent")
	if err != nil {
		t.Fatalf("unexpected error resolving relative artifact url: %v", err)
	}
	if got != "https://hostlens.app/downloads/hostlens-agent" {
		t.Fatalf("unexpected resolved url: %s", got)
	}
}
