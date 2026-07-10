#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

if [[ "$#" -ne 1 ]]; then
  echo "Usage: $0 <service-url>" >&2
  exit 64
fi

exec env MAHJONG_SERVICE_URL="$1" npm start
