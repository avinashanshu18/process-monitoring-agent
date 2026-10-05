#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 2 ]]; then
  echo "usage: sudo $0 /path/to/hostlens-agent /path/to/config.json" >&2
  exit 1
fi

BIN_SOURCE=$1
CONFIG_SOURCE=$2
INSTALL_DIR=${HOSTLENS_INSTALL_DIR:-/opt/hostlens}
LOG_PATH=${HOSTLENS_LOG_PATH:-/var/log/hostlens-agent.log}
SERVICE_TARGET=${HOSTLENS_SERVICE_TARGET:-/etc/systemd/system/hostlens-agent.service}
TEMPLATE_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
TEMPLATE_PATH="$TEMPLATE_DIR/hostlens-agent.service"

mkdir -p "$INSTALL_DIR" "$(dirname "$LOG_PATH")"
install -m 755 "$BIN_SOURCE" "$INSTALL_DIR/hostlens-agent"
install -m 600 "$CONFIG_SOURCE" "$INSTALL_DIR/config.json"

sed \
  -e "s|/opt/hostlens|$INSTALL_DIR|g" \
  -e "s|/var/log/hostlens-agent.log|$LOG_PATH|g" \
  "$TEMPLATE_PATH" > "$SERVICE_TARGET"

systemctl daemon-reload
systemctl enable --now hostlens-agent.service

echo "HostLens agent installed."
echo "Binary: $INSTALL_DIR/hostlens-agent"
echo "Config: $INSTALL_DIR/config.json"
echo "Service: $SERVICE_TARGET"
