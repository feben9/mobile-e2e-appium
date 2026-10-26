#!/usr/bin/env bash
# Runs the suite inside the emulator started by android-emulator-runner in CI.
# Starts Appium, waits until it answers, runs the tests, then keeps the
# device log and Appium log next to the test reports. Exits with the test
# result, not with the result of the clean-up steps.
set -uo pipefail

APPIUM_PORT="${APPIUM_PORT:-4723}"
mkdir -p reports

adb logcat -c || true

appium --address 127.0.0.1 --port "$APPIUM_PORT" --log reports/appium.log --log-timestamp &
APPIUM_PID=$!

ready=false
for _ in $(seq 1 60); do
  if curl --silent --fail "http://127.0.0.1:${APPIUM_PORT}/status" >/dev/null; then
    ready=true
    break
  fi
  sleep 1
done
if [[ "$ready" != true ]]; then
  echo "Appium did not start on port ${APPIUM_PORT}; see reports/appium.log" >&2
  kill "$APPIUM_PID" 2>/dev/null || true
  exit 1
fi

npm test
status=$?

adb logcat -d > reports/logcat.txt 2>/dev/null || true
kill "$APPIUM_PID" 2>/dev/null || true
exit "$status"
