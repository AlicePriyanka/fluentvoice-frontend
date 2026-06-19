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

  process.exitCode = report.fail > 0 ? 1 : 0;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
