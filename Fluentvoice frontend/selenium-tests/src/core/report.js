const fs = require("node:fs");
const path = require("node:path");
const ExcelJS = require("exceljs");

const COLORS = {
  navy: "1B2B5E",
  gold: "F2C94C",
  white: "FFFFFF",
  green: "DCFCE7",
  red: "FEE2E2",
  yellow: "FEF3C7",
  gray: "E5E7EB",
};

function styleHeader(row) {
  row.font = { bold: true, color: { argb: COLORS.white } };
  row.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.navy } };
  row.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
  row.height = 30;
}

function addTitle(sheet, title, columns) {
  sheet.mergeCells(1, 1, 1, columns);
  const cell = sheet.getCell(1, 1);
  cell.value = title;
  cell.font = { bold: true, size: 18, color: { argb: COLORS.white } };
  cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.navy } };
  cell.alignment = { horizontal: "center", vertical: "middle" };
  sheet.getRow(1).height = 34;
}

function statusFill(status) {
  if (status === "PASS") return COLORS.green;
  if (status === "FAIL") return COLORS.red;
  return COLORS.yellow;
}

function categoryRows(results) {
  const categories = new Map();
  for (const result of results) {
    const row = categories.get(result.category) || { total: 0, pass: 0, fail: 0, skip: 0 };
    row.total += 1;
    row[result.status.toLowerCase()] += 1;
    categories.set(result.category, row);
  }
  return [...categories.entries()].map(([category, values]) => ({
    category,
    ...values,
    passRate: values.total ? values.pass / values.total : 0,
  }));
}

async function generateReport(runner) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "FluentVoice Selenium Test Suite";
  workbook.created = new Date();

  const results = runner.results;
  const pass = results.filter((item) => item.status === "PASS").length;
  const fail = results.filter((item) => item.status === "FAIL").length;
  const skip = results.filter((item) => item.status === "SKIP").length;

  const summary = workbook.addWorksheet("Executive Summary", { views: [{ showGridLines: false }] });
  addTitle(summary, "FluentVoice Automated Test Report", 6);
  summary.addRow([]);
  summary.addRow(["Run date", new Date().toISOString(), "Base URL", runner.config.baseUrl, "Suite", runner.config.suite]);
  summary.addRow(["Total", results.length, "Passed", pass, "Failed", fail]);
  summary.addRow(["Skipped", skip, "Pass rate", results.length ? pass / results.length : 0, "Browsers", runner.config.browsers.join(", ")]);
  summary.getCell("D5").numFmt = "0.00%";
  summary.addRow([]);
  const summaryHeader = summary.addRow(["Category", "Total", "Pass", "Fail", "Skip", "Pass Rate"]);
  styleHeader(summaryHeader);
  for (const row of categoryRows(results)) {
    const added = summary.addRow([row.category, row.total, row.pass, row.fail, row.skip, row.passRate]);
    added.getCell(6).numFmt = "0.00%";
  }
  summary.columns = [
    { width: 28 }, { width: 15 }, { width: 15 }, { width: 15 }, { width: 15 }, { width: 18 },
  ];

  const detail = workbook.addWorksheet("Detailed Results", { views: [{ state: "frozen", ySplit: 2 }] });
  addTitle(detail, "Detailed Test Results", 15);
  const detailHeader = detail.addRow([
    "Test ID", "Category", "Type of Test", "Test Name", "Description", "Steps", "Expected", "Actual",
    "Status", "Browser", "Viewport", "Duration (ms)", "Screenshot", "Error", "Executed At",
  ]);
  styleHeader(detailHeader);
  for (const result of results) {
    const row = detail.addRow([
      result.id, result.module, result.category, result.name, result.description, result.steps, result.expected,
      result.actual, result.status, result.browser, result.viewport, result.durationMs,
      result.screenshot, result.error, new Date().toISOString(),
    ]);
    row.getCell(9).fill = { type: "pattern", pattern: "solid", fgColor: { argb: statusFill(result.status) } };
    row.alignment = { vertical: "top", wrapText: true };
  }
  detail.autoFilter = { from: "A2", to: "O2" };
  detail.columns = [
    { width: 13 }, { width: 24 }, { width: 24 }, { width: 32 }, { width: 38 }, { width: 42 }, { width: 35 },
    { width: 45 }, { width: 12 }, { width: 15 }, { width: 20 }, { width: 16 }, { width: 45 },
    { width: 60 }, { width: 25 },
  ];

  const browserSheet = workbook.addWorksheet("Browser Analysis");
  addTitle(browserSheet, "Compatibility Results by Browser", 6);
  const browserHeader = browserSheet.addRow(["Browser", "Total", "Pass", "Fail", "Skip", "Pass Rate"]);
  styleHeader(browserHeader);
  for (const browser of [...new Set(results.map((item) => item.browser))]) {
    const rows = results.filter((item) => item.browser === browser);
    const passed = rows.filter((item) => item.status === "PASS").length;
    const row = browserSheet.addRow([
      browser,
      rows.length,
      passed,
      rows.filter((item) => item.status === "FAIL").length,
      rows.filter((item) => item.status === "SKIP").length,
      rows.length ? passed / rows.length : 0,
    ]);
    row.getCell(6).numFmt = "0.00%";
  }
  browserSheet.columns = Array.from({ length: 6 }, () => ({ width: 20 }));

  const performance = workbook.addWorksheet("Performance");
  addTitle(performance, "Navigation Timing Metrics", 8);
  const performanceHeader = performance.addRow([
    "Test ID", "Browser", "Route", "Duration (ms)", "DOM Content Loaded (ms)",
    "Load Event (ms)", "Response Time (ms)", "Transfer Size (bytes)",
  ]);
  styleHeader(performanceHeader);
  runner.performance.forEach((metric) => performance.addRow([
    metric.testId, metric.browser, metric.route, metric.duration, metric.domContentLoaded,
    metric.loadEvent, metric.responseTime, metric.transferSize,
  ]));
  performance.columns = Array.from({ length: 8 }, (_, index) => ({ width: index === 2 ? 30 : 22 }));

  const accessibility = workbook.addWorksheet("Accessibility");
  addTitle(accessibility, "WCAG Automated Findings", 8);
  const accessibilityHeader = accessibility.addRow([
    "Test ID", "Browser", "Page", "Rule", "Impact", "Description", "Affected Nodes", "Help URL",
  ]);
  styleHeader(accessibilityHeader);
  runner.accessibility.forEach((finding) => accessibility.addRow([
    finding.testId, finding.browser, finding.page, finding.id, finding.impact,
    finding.description, finding.nodes, finding.helpUrl,
  ]));
  accessibility.columns = [
    { width: 13 }, { width: 14 }, { width: 24 }, { width: 25 }, { width: 12 },
    { width: 55 }, { width: 18 }, { width: 55 },
  ];

  const environment = workbook.addWorksheet("Environment");
  addTitle(environment, "Execution Environment", 2);
  const environmentHeader = environment.addRow(["Property", "Value"]);
  styleHeader(environmentHeader);
  [
    ["Base URL", runner.config.baseUrl],
    ["Node.js", process.version],
    ["Platform", `${process.platform} ${process.arch}`],
    ["Headless", String(runner.config.headless)],
    ["Browsers", runner.config.browsers.join(", ")],
    ["Timeout (ms)", runner.config.timeoutMs],
    ["Data mutation enabled", String(runner.config.allowDataMutation)],
    ["Started", runner.runStartedAt.toISOString()],
    ["Completed", new Date().toISOString()],
  ].forEach((row) => environment.addRow(row));
  environment.columns = [{ width: 30 }, { width: 80 }];

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const reportDir = path.join(runner.config.artifactsDir, "reports");
  fs.mkdirSync(reportDir, { recursive: true });
  const reportPath = path.join(reportDir, `FluentVoice_Selenium_Report_${timestamp}.xlsx`);
  const jsonPath = path.join(reportDir, `FluentVoice_Selenium_Results_${timestamp}.json`);
  await workbook.xlsx.writeFile(reportPath);
  fs.writeFileSync(jsonPath, JSON.stringify({
    config: { ...runner.config, credentials: undefined },
    results,
    performance: runner.performance,
    accessibility: runner.accessibility,
  }, null, 2));
  return { reportPath, jsonPath, pass, fail, skip };
}

module.exports = { generateReport };
