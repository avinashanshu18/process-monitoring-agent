#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
GO_CORE_DIR=$(cd "$SCRIPT_DIR/.." && pwd)
PUBLIC_DOWNLOAD_DIR=${1:-"$GO_CORE_DIR/../../frontend/process-monitor/public/downloads"}
RELEASE_VERSION=${HOSTLENS_RELEASE_VERSION:-$(date -u +"%Y.%m.%d-%H%M")}
GENERATED_AT=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
MAC_BINARY_IDENTITY=${HOSTLENS_MAC_BINARY_IDENTITY:-}
MAC_INSTALLER_IDENTITY=${HOSTLENS_MAC_INSTALLER_IDENTITY:-}
MAC_NOTARY_PROFILE=${HOSTLENS_MAC_NOTARY_PROFILE:-}
WINDOWS_SIGNTOOL=${HOSTLENS_WINDOWS_SIGNTOOL:-signtool}
WINDOWS_CERT_SHA1=${HOSTLENS_WINDOWS_SIGNING_CERT_SHA1:-}
WINDOWS_CERT_NAME=${HOSTLENS_WINDOWS_SIGNING_CERT_NAME:-}
WINDOWS_PFX_PATH=${HOSTLENS_WINDOWS_PFX_PATH:-}
WINDOWS_PFX_PASSWORD=${HOSTLENS_WINDOWS_PFX_PASSWORD:-}
WINDOWS_TIMESTAMP_URL=${HOSTLENS_WINDOWS_TIMESTAMP_URL:-http://timestamp.digicert.com}

mkdir -p "$PUBLIC_DOWNLOAD_DIR"

cd "$GO_CORE_DIR"

echo "Building HostLens agent release binaries into $PUBLIC_DOWNLOAD_DIR"

LDFLAGS="-X hostlens-go-agent/internal/version.AgentVersion=$RELEASE_VERSION"

GOOS=darwin GOARCH=arm64 go build -ldflags "$LDFLAGS" -o "$PUBLIC_DOWNLOAD_DIR/hostlens-agent-darwin-arm64" ./cmd/hostlens-agent
GOOS=darwin GOARCH=amd64 go build -ldflags "$LDFLAGS" -o "$PUBLIC_DOWNLOAD_DIR/hostlens-agent-darwin-amd64" ./cmd/hostlens-agent
GOOS=linux GOARCH=amd64 go build -ldflags "$LDFLAGS" -o "$PUBLIC_DOWNLOAD_DIR/hostlens-agent-linux-amd64" ./cmd/hostlens-agent
GOOS=windows GOARCH=amd64 go build -ldflags "$LDFLAGS" -o "$PUBLIC_DOWNLOAD_DIR/hostlens-agent-windows-amd64.exe" ./cmd/hostlens-agent
GOOS=windows GOARCH=amd64 go build -ldflags "$LDFLAGS" -o "$PUBLIC_DOWNLOAD_DIR/hostlens-service-windows-amd64.exe" ./cmd/hostlens-service

if command -v lipo >/dev/null 2>&1; then
  lipo -create \
    "$PUBLIC_DOWNLOAD_DIR/hostlens-agent-darwin-arm64" \
    "$PUBLIC_DOWNLOAD_DIR/hostlens-agent-darwin-amd64" \
    -output "$PUBLIC_DOWNLOAD_DIR/hostlens-agent-darwin-universal"
fi

codesign_artifact() {
  local filepath=$1
  if [[ -n "$MAC_BINARY_IDENTITY" ]] && command -v codesign >/dev/null 2>&1 && [[ -f "$filepath" ]]; then
    codesign --force --timestamp --options runtime --sign "$MAC_BINARY_IDENTITY" "$filepath"
  fi
}

sign_windows_artifact() {
  local filepath=$1
  if [[ ! -f "$filepath" ]]; then
    return
  fi
  if [[ -n "$WINDOWS_PFX_PATH" && -n "$WINDOWS_PFX_PASSWORD" && -x "$(command -v "$WINDOWS_SIGNTOOL" || true)" ]]; then
    "$WINDOWS_SIGNTOOL" sign /f "$WINDOWS_PFX_PATH" /p "$WINDOWS_PFX_PASSWORD" /fd SHA256 /tr "$WINDOWS_TIMESTAMP_URL" /td SHA256 "$filepath"
    return
  fi
  if [[ -n "$WINDOWS_CERT_SHA1" && -x "$(command -v "$WINDOWS_SIGNTOOL" || true)" ]]; then
    "$WINDOWS_SIGNTOOL" sign /sha1 "$WINDOWS_CERT_SHA1" /fd SHA256 /tr "$WINDOWS_TIMESTAMP_URL" /td SHA256 "$filepath"
    return
  fi
  if [[ -n "$WINDOWS_CERT_NAME" && -x "$(command -v "$WINDOWS_SIGNTOOL" || true)" ]]; then
    "$WINDOWS_SIGNTOOL" sign /n "$WINDOWS_CERT_NAME" /fd SHA256 /tr "$WINDOWS_TIMESTAMP_URL" /td SHA256 "$filepath"
  fi
}

codesign_artifact "$PUBLIC_DOWNLOAD_DIR/hostlens-agent-darwin-arm64"
codesign_artifact "$PUBLIC_DOWNLOAD_DIR/hostlens-agent-darwin-amd64"
codesign_artifact "$PUBLIC_DOWNLOAD_DIR/hostlens-agent-darwin-universal"

bash deploy/macos/build-pkg.sh \
  "$PUBLIC_DOWNLOAD_DIR/hostlens-agent-darwin-universal" \
  "$PUBLIC_DOWNLOAD_DIR/HostLens-macOS-Installer.pkg" \
  "$RELEASE_VERSION"

cp deploy/macos/install.sh "$PUBLIC_DOWNLOAD_DIR/install-macos.sh"
cp deploy/macos/com.hostlens.agent.plist "$PUBLIC_DOWNLOAD_DIR/com.hostlens.agent.plist"
cp deploy/macos/hostlensctl "$PUBLIC_DOWNLOAD_DIR/hostlensctl"
cp deploy/linux/install.sh "$PUBLIC_DOWNLOAD_DIR/install-linux.sh"
cp deploy/linux/hostlens-agent.service "$PUBLIC_DOWNLOAD_DIR/hostlens-agent.service"
cp deploy/windows/install.ps1 "$PUBLIC_DOWNLOAD_DIR/install-windows.ps1"

codesign_artifact "$PUBLIC_DOWNLOAD_DIR/hostlensctl"
sign_windows_artifact "$PUBLIC_DOWNLOAD_DIR/hostlens-agent-windows-amd64.exe"
sign_windows_artifact "$PUBLIC_DOWNLOAD_DIR/hostlens-service-windows-amd64.exe"

chmod +x \
  "$PUBLIC_DOWNLOAD_DIR/hostlens-agent-darwin-arm64" \
  "$PUBLIC_DOWNLOAD_DIR/hostlens-agent-darwin-amd64" \
  "$PUBLIC_DOWNLOAD_DIR/hostlens-agent-darwin-universal" \
  "$PUBLIC_DOWNLOAD_DIR/hostlens-agent-linux-amd64" \
  "$PUBLIC_DOWNLOAD_DIR/install-macos.sh" \
  "$PUBLIC_DOWNLOAD_DIR/install-linux.sh" \
  "$PUBLIC_DOWNLOAD_DIR/hostlensctl"

artifacts=(
  "hostlens-agent-darwin-arm64|macos_arm64|macOS Apple Silicon agent binary|agent|darwin-arm64"
  "hostlens-agent-darwin-amd64|macos_amd64|macOS Intel agent binary|agent|darwin-amd64"
  "hostlens-agent-darwin-universal|macos_universal|macOS universal agent binary|agent|darwin-universal"
  "HostLens-macOS-Installer.pkg|macos_pkg|macOS installer package|package|darwin-universal"
  "hostlens-agent-linux-amd64|linux_amd64|Linux amd64 agent binary|agent|linux-amd64"
  "hostlens-agent-windows-amd64.exe|windows_amd64|Windows amd64 agent binary|agent|windows-amd64"
  "hostlens-service-windows-amd64.exe|windows_service|Windows service wrapper|service|windows-amd64"
  "install-macos.sh|macos_installer|macOS installer script|installer|darwin"
  "hostlensctl|macos_control|macOS HostLens control command|tool|darwin"
  "install-linux.sh|linux_installer|Linux installer script|installer|linux"
  "install-windows.ps1|windows_installer|Windows installer script|installer|windows"
  "com.hostlens.agent.plist|macos_launchd|macOS launchd service template|template|darwin"
  "hostlens-agent.service|linux_systemd|Linux systemd service template|template|linux"
)

artifact_trust() {
  local key=$1
  local signed=false
  local notarized=false
  local signature_label="Unsigned in this environment"

  case "$key" in
    macos_arm64|macos_amd64|macos_universal|macos_control)
      if [[ -n "$MAC_BINARY_IDENTITY" ]]; then
        signed=true
        signature_label="Developer ID signed"
      fi
      ;;
    macos_pkg)
      if [[ -n "$MAC_INSTALLER_IDENTITY" ]]; then
        signed=true
        signature_label="Developer ID installer signed"
      fi
      if [[ -n "$MAC_NOTARY_PROFILE" ]]; then
        notarized=true
        signature_label="Signed and notarized"
      fi
      ;;
    windows_amd64|windows_service)
      if [[ -n "$WINDOWS_PFX_PATH" || -n "$WINDOWS_CERT_SHA1" || -n "$WINDOWS_CERT_NAME" ]]; then
        signed=true
        signature_label="Authenticode signed"
      fi
      ;;
  esac

  printf '%s|%s|%s' "$signed" "$notarized" "$signature_label"
}

size_bytes() {
  if stat -f%z "$1" >/dev/null 2>&1; then
    stat -f%z "$1"
  else
    stat -c%s "$1"
  fi
}

json_escape() {
  printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g'
}

checksums_file="$PUBLIC_DOWNLOAD_DIR/hostlens-checksums.txt"
manifest_file="$PUBLIC_DOWNLOAD_DIR/release-manifest.json"

: > "$checksums_file"

{
  printf '{\n'
  printf '  "version": "%s",\n' "$(json_escape "$RELEASE_VERSION")"
  printf '  "generated_at": "%s",\n' "$GENERATED_AT"
  printf '  "artifacts": {\n'

  index=0
  last_index=$((${#artifacts[@]} - 1))
  for artifact in "${artifacts[@]}"; do
    IFS='|' read -r filename key label kind target <<<"$artifact"
    filepath="$PUBLIC_DOWNLOAD_DIR/$filename"
    checksum=$(shasum -a 256 "$filepath" | awk '{print $1}')
    bytes=$(size_bytes "$filepath")
    trust_info=$(artifact_trust "$key")
    IFS='|' read -r signed notarized signature_label <<<"$trust_info"
    printf '%s  %s\n' "$checksum" "$filename" >> "$checksums_file"

    printf '    "%s": {\n' "$(json_escape "$key")"
    printf '      "filename": "%s",\n' "$(json_escape "$filename")"
    printf '      "label": "%s",\n' "$(json_escape "$label")"
    printf '      "kind": "%s",\n' "$(json_escape "$kind")"
    printf '      "target": "%s",\n' "$(json_escape "$target")"
    printf '      "sha256": "%s",\n' "$checksum"
    printf '      "size_bytes": %s,\n' "$bytes"
    printf '      "url": "/downloads/%s",\n' "$(json_escape "$filename")"
    printf '      "signed": %s,\n' "$signed"
    printf '      "notarized": %s,\n' "$notarized"
    printf '      "signature_label": "%s"\n' "$(json_escape "$signature_label")"

    if [[ $index -eq $last_index ]]; then
      printf '    }\n'
    else
      printf '    },\n'
    fi

    index=$((index + 1))
  done

  printf '  }\n'
  printf '}\n'
} > "$manifest_file"

echo "Release artifacts ready."
echo "Checksums: $checksums_file"
echo "Manifest: $manifest_file"
