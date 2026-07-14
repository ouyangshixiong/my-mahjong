#!/bin/sh
set -eu

ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
OUTPUT="$ROOT/app/src/main/assets/web"

rm -rf "$OUTPUT"
mkdir -p "$OUTPUT/client"
cp "$ROOT/client/index.html" "$ROOT/client/renderer.js" "$ROOT/client/styles.css" "$OUTPUT/client/"
cp -R "$ROOT/assets" "$OUTPUT/assets"
"$ROOT/node_modules/.bin/esbuild" "$ROOT/client/android-bridge.js" \
  --bundle \
  --platform=browser \
  --target=chrome98 \
  --minify \
  --outfile="$OUTPUT/client/android-bridge.js"
