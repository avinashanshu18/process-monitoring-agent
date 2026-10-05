#!/usr/bin/env bash
set -euo pipefail

SPOOL_DIR="${1:-./spool}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

mkdir -p "$SPOOL_DIR"

emit_capability() {
  local state="$1"
  local detail="$2"
  local file="$SPOOL_DIR/ebpf-$(date +%s)-$$.json"
  cat >"$file" <<JSON
{"source":"ebpf","collector_capabilities":[{"name":"ebpf","layer":"kernel-bridge","state":"$state","detail":"$detail"}]}
JSON
}

if ! command -v bpftrace >/dev/null 2>&1; then
  emit_capability "not-enabled" "bpftrace is not installed on this Linux host."
  exit 0
fi

emit_capability "active" "eBPF helper is attached to process and TCP tracepoints through bpftrace."

bpftrace "$SCRIPT_DIR/trace.bt" | while IFS= read -r line; do
  [[ -z "$line" ]] && continue
  file="$SPOOL_DIR/ebpf-$(date +%s%N).json"
  printf '%s\n' "$line" >"$file"
done
