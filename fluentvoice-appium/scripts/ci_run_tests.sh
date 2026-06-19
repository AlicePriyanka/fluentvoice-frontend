#!/bin/bash
set -e

# Load npm path
if [ -f "$GITHUB_PATH" ]; then
  while read -r p; do
    export PATH="$p:$PATH"
  done < "$GITHUB_PATH"
fi

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
node run_local_tests.js || exit_code=$?

if [ $exit_code -ne 0 ]; then
  echo "Tests failed or exited early. Generating fallback report..."
  node utils/generateFallbackReport.js
fi

# Generate Markdown summary for step summary
node utils/generateSummary.js || true

exit $exit_code
