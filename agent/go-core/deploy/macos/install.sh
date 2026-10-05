#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 2 ]]; then
  echo "usage: $0 /path/to/hostlens-agent /path/to/config.json" >&2
  exit 1
fi

BIN_SOURCE=$1
CONFIG_SOURCE=$2
INSTALL_DIR=${HOSTLENS_INSTALL_DIR:-/opt/hostlens}
LOG_PATH=${HOSTLENS_LOG_PATH:-/usr/local/var/log/hostlens-agent.log}
PLIST_TARGET=${HOSTLENS_PLIST_TARGET:-$HOME/Library/LaunchAgents/com.hostlens.agent.plist}
TEMPLATE_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
TEMPLATE_PATH="$TEMPLATE_DIR/com.hostlens.agent.plist"

mkdir -p "$INSTALL_DIR" "$(dirname "$PLIST_TARGET")" "$(dirname "$LOG_PATH")"
install -m 755 "$BIN_SOURCE" "$INSTALL_DIR/hostlens-agent"
install -m 600 "$CONFIG_SOURCE" "$INSTALL_DIR/config.json"

sed \
  -e "s|/opt/hostlens|$INSTALL_DIR|g" \
  -e "s|/usr/local/var/log/hostlens-agent.log|$LOG_PATH|g" \
  "$TEMPLATE_PATH" > "$PLIST_TARGET"

launchctl unload "$PLIST_TARGET" >/dev/null 2>&1 || true
launchctl load "$PLIST_TARGET"
launchctl kickstart -k "gui/$(id -u)/com.hostlens.agent" >/dev/null 2>&1 || true

echo "HostLens agent installed."
echo "Binary: $INSTALL_DIR/hostlens-agent"
echo "Config: $INSTALL_DIR/config.json"
echo "LaunchAgent: $PLIST_TARGET"
