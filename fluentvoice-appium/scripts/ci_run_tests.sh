#!/bin/bash
set -e

# Create reports directory early to prevent GHA deploy step crash
mkdir -p artifacts/reports

# Load npm path
if [ -f "$GITHUB_PATH" ]; then
  while read -r p; do
    export PATH="$p:$PATH"
  done < "$GITHUB_PATH"
fi

echo "=== GHA Runner Debug Info ==="
echo "PATH: $PATH"
echo "GITHUB_PATH: $GITHUB_PATH"
if [ -f "$GITHUB_PATH" ]; then
  echo "GITHUB_PATH contents:"
  cat "$GITHUB_PATH"
else
  echo "GITHUB_PATH file does not exist"
fi
echo "Node version: $(node -v 2>&1)"
echo "Npm version: $(npm -v 2>&1)"
echo "Which node: $(which node 2>&1)"
echo "============================="

echo "Installing APK onto emulator..."
adb install -r "${APK_PATH}" || echo "Could not install APK, proceeding..."

echo "Starting Appium server..."
appium --log-level warn > /tmp/appium.log 2>&1 &

echo "Waiting for Appium to respond on port 4723..."
for i in {1..30}; do
  if curl -s http://127.0.0.1:4723/status > /dev/null; then
    echo "Appium server is up!"
    break
  fi
  sleep 2
done

echo "Running standalone Appium tests..."
exit_code=0
node run_local_tests.js > /tmp/test_run.log 2>&1 || exit_code=$?
cat /tmp/test_run.log

if [ $exit_code -ne 0 ]; then
  echo "Tests failed or exited early. Generating fallback report..."
  if [ -f /tmp/test_run.log ] && [ -n "$GITHUB_STEP_SUMMARY" ]; then
    echo "### Appium E2E Runner Failure Logs" >> "$GITHUB_STEP_SUMMARY"
    echo '```' >> "$GITHUB_STEP_SUMMARY"
    cat /tmp/test_run.log >> "$GITHUB_STEP_SUMMARY"
    echo '```' >> "$GITHUB_STEP_SUMMARY"
  fi
  node utils/generateFallbackReport.js
fi

# Generate Markdown summary for step summary
node utils/generateSummary.js || true

exit $exit_code
