#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 2 ]]; then
  echo "usage: $0 /path/to/hostlens-agent-macos-universal /path/to/output.pkg [version]" >&2
  exit 1
fi

BIN_SOURCE=$1
OUTPUT_PKG=$2
VERSION=${3:-0.1.0}
SIGNING_IDENTITY=${HOSTLENS_MAC_INSTALLER_IDENTITY:-}
NOTARY_PROFILE=${HOSTLENS_MAC_NOTARY_PROFILE:-}

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
ROOT_DIR=$(mktemp -d "${TMPDIR:-/tmp}/hostlens-pkg-root.XXXXXX")
trap 'rm -rf "$ROOT_DIR"' EXIT

APP_SUPPORT_DIR="$ROOT_DIR/Library/Application Support/HostLens"
LAUNCH_DAEMON_DIR="$ROOT_DIR/Library/LaunchDaemons"
BIN_DIR="$ROOT_DIR/usr/local/bin"

mkdir -p "$APP_SUPPORT_DIR" "$LAUNCH_DAEMON_DIR" "$BIN_DIR"

install -m 755 "$BIN_SOURCE" "$APP_SUPPORT_DIR/hostlens-agent"
install -m 600 "$SCRIPT_DIR/../../config.example.json" "$APP_SUPPORT_DIR/config.template.json"
install -m 644 "$SCRIPT_DIR/com.hostlens.agent.daemon.plist" "$LAUNCH_DAEMON_DIR/com.hostlens.agent.plist"
install -m 755 "$SCRIPT_DIR/hostlensctl" "$BIN_DIR/hostlensctl"

UNSIGNED_PKG="$OUTPUT_PKG"
if [[ -n "$SIGNING_IDENTITY" ]]; then
  UNSIGNED_PKG="${OUTPUT_PKG%.pkg}-unsigned.pkg"
fi

pkgbuild \
  --root "$ROOT_DIR" \
  --scripts "$SCRIPT_DIR/pkg-scripts" \
  --identifier "com.hostlens.agent" \
  --version "$VERSION" \
  --install-location "/" \
  "$UNSIGNED_PKG"

if [[ -n "$SIGNING_IDENTITY" ]]; then
  productsign \
    --sign "$SIGNING_IDENTITY" \
    "$UNSIGNED_PKG" \
    "$OUTPUT_PKG"
  rm -f "$UNSIGNED_PKG"
fi

if [[ -n "$NOTARY_PROFILE" ]]; then
  xcrun notarytool submit "$OUTPUT_PKG" --keychain-profile "$NOTARY_PROFILE" --wait
  xcrun stapler staple "$OUTPUT_PKG"
fi
