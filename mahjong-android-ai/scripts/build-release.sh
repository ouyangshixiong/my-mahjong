#!/bin/sh
set -eu

: "${ANDROID_SDK_ROOT:?ANDROID_SDK_ROOT is required}"
: "${JAVA_HOME:?JAVA_HOME is required}"
: "${MAHJONG_KEYSTORE:?MAHJONG_KEYSTORE is required}"
: "${MAHJONG_KEYSTORE_PASSWORD:?MAHJONG_KEYSTORE_PASSWORD is required}"
: "${MAHJONG_KEY_ALIAS:?MAHJONG_KEY_ALIAS is required}"
: "${MAHJONG_KEY_PASSWORD:?MAHJONG_KEY_PASSWORD is required}"
: "${MAHJONG_SERVICE_URL:?MAHJONG_SERVICE_URL is required}"

ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
BUILD_TOOLS="$ANDROID_SDK_ROOT/build-tools/35.0.0"
UNSIGNED="$ROOT/app/build/outputs/apk/release/app-release-unsigned.apk"
ALIGNED="$ROOT/app/build/outputs/apk/release/app-release-aligned.apk"
OUTPUT="$ROOT/dist/mahjong-ai-1.0.0.apk"

cd "$ROOT"
npm run build:web
./gradlew assembleRelease --no-daemon
mkdir -p "$ROOT/dist"
"$BUILD_TOOLS/zipalign" -p -f 4 "$UNSIGNED" "$ALIGNED"
"$BUILD_TOOLS/apksigner" sign \
  --ks "$MAHJONG_KEYSTORE" \
  --ks-key-alias "$MAHJONG_KEY_ALIAS" \
  --ks-pass env:MAHJONG_KEYSTORE_PASSWORD \
  --key-pass env:MAHJONG_KEY_PASSWORD \
  --out "$OUTPUT" \
  "$ALIGNED"
"$BUILD_TOOLS/apksigner" verify --verbose "$OUTPUT"
