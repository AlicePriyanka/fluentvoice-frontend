const fs = require("node:fs");
const path = require("node:path");
const config = require("./config");
const { TestRunner } = require("./src/core/runner");
const { generateReport } = require("./src/core/report");
const { registerSuites } = require("./src/suites");

async function main() {
  const runner = new TestRunner(config);
  registerSuites(runner);

  console.log("FluentVoice Selenium Test Suite");
  console.log(`URL: ${config.baseUrl}`);
  console.log(`Suite: ${config.suite}`);
  console.log(`Browsers: ${config.browsers.join(", ")}`);
  console.log(`Mode: ${config.headless ? "headless" : "headed"}\n`);

  await runner.run();
  const report = await generateReport(runner);

  console.log("\nRun complete");
  console.log(`Passed: ${report.pass}`);
  console.log(`Failed: ${report.fail}`);
  console.log(`Skipped: ${report.skip}`);
  console.log(`Excel: ${path.relative(__dirname, report.reportPath)}`);
  console.log(`JSON: ${path.relative(__dirname, report.jsonPath)}`);

  if (process.env.GITHUB_STEP_SUMMARY) {
    const total = report.pass + report.fail + report.skip;
    const summaryMarkdown = `
### FluentVoice Selenium E2E Test Run Summary

| Metric | Value |
| --- | --- |
| **Total Tests** | ${total} |
| **Passed** | 🟢 ${report.pass} |
| **Failed** | 🔴 ${report.fail} |
| **Skipped** | 🟡 ${report.skip} |
| **Pass Rate** | ${((report.pass / (total || 1)) * 100).toFixed(2)}% |

📥 *Download the detailed Excel test report \`${path.basename(report.reportPath)}\` from the build artifacts.*
`;
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, summaryMarkdown);
  }

  process.exitCode = report.fail > 0 ? 1 : 0;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
