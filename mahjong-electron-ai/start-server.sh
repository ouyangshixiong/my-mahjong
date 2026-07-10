#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

case "$#" in
  0)
    listen_host="127.0.0.1"
    port="5057"
    ;;
  2)
    listen_host="$1"
    port="$2"
    ;;
  *)
    echo "Usage: $0 [<listen-host> <port>]" >&2
    exit 64
    ;;
esac

exec env HOST="$listen_host" PORT="$port" npm run server
