#!/usr/bin/env bash
# Downloads the app under test into apps/.
#
# App: Sauce Labs "My Demo App" for Android (native), release 2.3.0, build 27.
# Source: https://github.com/saucelabs/my-demo-app-android/releases/tag/2.3.0
#
# The APK is pinned by version and SHA-256 so every local and CI run tests the
# same binary. To move to a newer release, update the three values below and
# the matching ids in src/config/app.ts.
set -euo pipefail

APP_VERSION="2.3.0"
APK_NAME="mda-2.3.0-27.apk"
APK_SHA256="bd3a3d6f2d50e076b2701ed2cc6a0ca82157b40a7033cf5be9f5d084b6591ec8"
APK_URL="https://github.com/saucelabs/my-demo-app-android/releases/download/${APP_VERSION}/${APK_NAME}"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEST="${ROOT_DIR}/apps/${APK_NAME}"

sha256_of() {
  if command -v sha256sum >/dev/null 2>&1; then
    sha256sum "$1" | awk '{print $1}'
  else
    shasum -a 256 "$1" | awk '{print $1}'
  fi
}

if [[ -f "$DEST" && "$(sha256_of "$DEST")" == "$APK_SHA256" ]]; then
  echo "App already present: apps/${APK_NAME}"
  exit 0
fi

mkdir -p "${ROOT_DIR}/apps"
echo "Downloading ${APK_NAME} ..."
curl --fail --location --silent --show-error --retry 3 --output "${DEST}.part" "$APK_URL"

ACTUAL_SHA256="$(sha256_of "${DEST}.part")"
if [[ "$ACTUAL_SHA256" != "$APK_SHA256" ]]; then
  rm -f "${DEST}.part"
  echo "Checksum mismatch for ${APK_NAME}" >&2
  echo "  expected ${APK_SHA256}" >&2
  echo "  actual   ${ACTUAL_SHA256}" >&2
  exit 1
fi

mv "${DEST}.part" "$DEST"
echo "Saved apps/${APK_NAME} (sha256 ${APK_SHA256})"
