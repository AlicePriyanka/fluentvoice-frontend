const fs = require("fs");
const path = require("path");

const resultsFile = fs.existsSync(path.join(__dirname, "../.wdio-results.jsonl"))
  ? path.join(__dirname, "../.wdio-results.jsonl")
  : path.join(__dirname, "../artifacts/reports/results.jsonl");
if (fs.existsSync(resultsFile)) {
  const lines = fs.readFileSync(resultsFile, "utf-8").trim().split("\n");
  const results = lines.map(line => JSON.parse(line));
  const total = results.length;
  const pass = results.filter(r => r.status === "PASS").length;
  const fail = results.filter(r => r.status === "FAIL").length;
  const passRate = total ? ((pass / total) * 100).toFixed(2) : "0.00";

  const markdown = `
### Mobile Appium E2E Test Run Summary

| Metric | Value |
| --- | --- |
| **Total Tests** | ${total} |
| **Passed** | 🟢 ${pass} |
| **Failed** | 🔴 ${fail} |
| **Pass Rate** | ${passRate}% |
`;
  if (process.env.GITHUB_STEP_SUMMARY) {
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, markdown);
  }
}
