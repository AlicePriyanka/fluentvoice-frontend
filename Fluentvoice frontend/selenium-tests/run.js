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
    
    // Normalize categories to 11 base categories
    function getBaseTestingType(result) {
      const mod = result.module || "";
      const cat = result.category || "";
      
      if (mod.startsWith("Functional") || cat.includes("Functional")) return "Functional";
      if (mod.startsWith("UI/UX") || cat.includes("UI/UX") || cat.includes("Aesthetics")) return "UI/UX";
      if (mod.startsWith("Compatibility") || cat.includes("Compatibility")) return "Compatibility";
      if (mod.startsWith("Performance") || cat.includes("Performance")) return "Performance";
      if (mod.startsWith("Security") || cat.includes("Security")) return "Security";
      if (mod.startsWith("API") || cat.includes("API")) return "API";
      if (mod.startsWith("Database") || cat.includes("Database")) return "Database";
      if (mod.startsWith("Accessibility") || cat.includes("Accessibility")) return "Accessibility";
      if (mod.startsWith("Mobile") || cat.includes("Mobile")) return "Mobile";
      if (mod.startsWith("Regression") || cat.includes("Regression")) return "Regression";
      if (mod.startsWith("End-to-End") || cat.includes("End-to-End") || cat.includes("End_to_End")) return "End-to-End";
      
      return "Functional";
    }

    const typeSummary = {};
    const baseCategoriesList = [
      "Functional", "UI/UX", "Compatibility", "Performance", "Security",
      "API", "Database", "Accessibility", "Mobile", "Regression", "End-to-End"
    ];
    baseCategoriesList.forEach(t => {
      typeSummary[t] = { total: 0, passed: 0, failed: 0 };
    });
    
    for (const r of runner.results) {
      const tType = getBaseTestingType(r);
      if (!typeSummary[tType]) {
        typeSummary[tType] = { total: 0, passed: 0, failed: 0 };
      }
      typeSummary[tType].total++;
      if (r.status === "PASS") {
        typeSummary[tType].passed++;
      } else {
        typeSummary[tType].failed++;
      }
    }

    let typeRows = "";
    Object.entries(typeSummary).forEach(([type, metrics]) => {
      typeRows += `| ${type} | ${metrics.total} | ${metrics.passed} | ${metrics.failed} |\n`;
    });

    let testRows = "";
    for (const r of runner.results) {
      const statusIcon = r.status === "PASS" ? "🟢 PASS PASSED" : (r.status === "FAIL" ? "🔴 FAIL FAILED" : "🟡 SKIP SKIPPED");
      const suite = r.category || "-";
      const type = r.module || "-";
      const name = `${r.id} — ${r.name}`;
      const dur = `${r.durationMs}ms`;
      const err = r.error ? `\`${r.error.replace(/\n/g, " ")}\`` : "";
      testRows += `| ${statusIcon} | ${suite} | ${type} | ${name} | ${dur} | ${err} |\n`;
    }

    const summaryMarkdown = `
### E2E Selenium Test Results
Total Tests: ${total} | Failed: ${report.fail}

#### Testing Types Performed

| Testing Type | Total | Passed | Failed |
| --- | --- | --- | --- |
${typeRows}

#### Test Results

| Status | Suite | Testing Type | Test Name | Duration | Error |
| --- | --- | --- | --- | --- | --- |
${testRows}
`;
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, summaryMarkdown);
  }

  process.exitCode = report.fail > 0 ? 1 : 0;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
