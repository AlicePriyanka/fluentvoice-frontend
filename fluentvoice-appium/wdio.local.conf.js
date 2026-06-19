const path = require("path");
const fs = require("fs");
const { startRun, recordTest, generateReport } = require("./utils/xlsxReporter");

const APK_PATH = process.env.APK_PATH ||
  path.join(__dirname, "../fluentvoice/app/build/outputs/apk/debug/app-debug.apk");

exports.config = {
  runner: "local",
  port: 4723,
  path: "/",
  specs: [
    "./tests/12_e2e/**/*.js"
  ],
  maxInstances: 1,
  capabilities: [{
    platformName: "Android",
    "appium:deviceName":    "RMX3990",
    "appium:udid":          "7cc68663",           // Realme serial
    "appium:platformVersion": "16",               // Android 16
    "appium:automationName":  "UiAutomator2",
    "appium:app":             APK_PATH,
    "appium:autoGrantPermissions": true,
    "appium:newCommandTimeout": 300,
    "appium:noReset": false,
    "appium:fullReset": false
  }],
  logLevel: "warn",
  bail: 0,
  waitforTimeout: 15000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,
  services: [],
  framework: "mocha",
  reporters: ["spec"],
  mochaOpts: {
    ui: "bdd",
    timeout: 600000
  },

  onPrepare: function () {
    const resultsFile = path.join(__dirname, ".wdio-results.jsonl");
    if (fs.existsSync(resultsFile)) fs.unlinkSync(resultsFile);
    fs.mkdirSync(path.join(__dirname, "artifacts/reports"), { recursive: true });
    console.log("\n🚀 FluentVoice Appium Local Test Run Starting...");
    console.log(`📱 Device: Realme RMX3990 (7cc68663) — Android 16`);
    console.log(`📦 APK: ${APK_PATH}\n`);
  },

  afterTest: function (test, context, { error, duration, passed }) {
    const resultsFile = path.join(__dirname, ".wdio-results.jsonl");
    const status = passed ? "PASS" : "FAIL";
    const record = {
      id:         test.title.match(/TC_\d+/)?.[0] || "TC_000",
      category:   test.parent || "General",
      name:       test.title,
      durationMs: duration || 0,
      status,
      error:      error ? error.message : ""
    };
    fs.appendFileSync(resultsFile, JSON.stringify(record) + "\n");
  },

  onComplete: async function () {
    const resultsFile = path.join(__dirname, ".wdio-results.jsonl");
    const allTests = [];
    if (fs.existsSync(resultsFile)) {
      const lines = fs.readFileSync(resultsFile, "utf-8").trim().split("\n");
      for (const line of lines) {
        if (line) allTests.push(JSON.parse(line));
      }
    }

    // Excel report
    const xlsxPath = path.join(__dirname, "artifacts/reports/selenium-report.xlsx");
    startRun();
    for (const t of allTests) {
      recordTest(t.id, t.category, t.name, t.durationMs, t.status, t.error);
    }
    await generateReport(xlsxPath);
    console.log(`\n📊 Excel Report: ${xlsxPath}`);

    // HTML report
    const htmlPath = path.join(__dirname, "artifacts/reports/execution-report.html");
    const { generateHtmlReport } = require("./utils/generateHtmlReport");
    try {
      generateHtmlReport(allTests, htmlPath);
      console.log(`📄 HTML Report: ${htmlPath}`);
    } catch (e) {
      console.error("HTML report failed:", e.message);
    }

    // Console summary
    const pass = allTests.filter(t => t.status === "PASS").length;
    const fail = allTests.filter(t => t.status === "FAIL").length;
    const rate = allTests.length ? ((pass / allTests.length) * 100).toFixed(1) : "0.0";
    console.log(`\n✅ PASS: ${pass}  ❌ FAIL: ${fail}  📈 Pass Rate: ${rate}%`);
    console.log(`📱 Tested on: Realme RMX3990 — Android 16\n`);
  }
};
