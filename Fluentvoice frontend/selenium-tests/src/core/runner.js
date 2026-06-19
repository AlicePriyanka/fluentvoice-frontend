const fs = require("node:fs");
const path = require("node:path");
const { createDriver } = require("./browser");
const { SkipTest, takeScreenshot } = require("./helpers");

class TestRunner {
  constructor(config) {
    this.config = config;
    this.tests = [];
    this.results = [];
    this.performance = [];
    this.accessibility = [];
    this.runStartedAt = new Date();
  }

  test(definition) {
    this.tests.push({
      browsers: null,
      mobile: false,
      suites: ["full"],
      ...definition,
    });
  }

  shouldRun(test) {
    if (this.config.suite === "full") return true;
    return test.suites.includes(this.config.suite);
  }

  async run() {
    fs.mkdirSync(this.config.artifactsDir, { recursive: true });
    const driverCache = {};

    try {
      for (const test of this.tests.filter((item) => this.shouldRun(item))) {
        const browsers = test.browsers || this.config.browsers;
        for (const browser of browsers) {
          const cacheKey = `${browser}-${test.mobile ? "mobile" : "desktop"}`;
          let driver = driverCache[cacheKey];
          if (!driver) {
            driver = await createDriver(browser, this.config, test.mobile);
            driverCache[cacheKey] = driver;
          }
          try {
            await this.runOne(test, browser, driver);
          } catch (runError) {
            // WebDriver / session crash occurred, clean up this driver from cache
            try {
              await driver.quit();
            } catch {}
            delete driverCache[cacheKey];
          }
        }
      }
    } finally {
      // Clean up all cached drivers at the end of the entire run
      for (const driver of Object.values(driverCache)) {
        try {
          await driver.quit();
        } catch {}
      }
    }

    return this.results;
  }

  async runOne(test, browser, driver) {
    const startedAt = Date.now();
    let status = "PASS";
    let actual = test.expected;
    let error = "";
    let screenshot = "";

    process.stdout.write(`  [RUN ] ${test.id} ${test.name} (${browser}${test.mobile ? ", mobile" : ""})\n`);

    try {
      const context = {
        driver,
        config: this.config,
        recordPerformance: (metric) => this.performance.push({ testId: test.id, browser, ...metric }),
        recordAccessibility: (finding) => this.accessibility.push({ testId: test.id, browser, ...finding }),
      };
      const message = await test.run(context);
      if (message) actual = message;
    } catch (caught) {
      if (caught instanceof SkipTest) {
        status = "SKIP";
        actual = caught.message;
      } else {
        status = "FAIL";
        error = caught?.stack || String(caught);
        actual = caught?.message || String(caught);
        
        const safeName = `${test.id}-${browser}`.replace(/[^a-z0-9-]/gi, "_");
        screenshot = path.join(this.config.artifactsDir, "screenshots", `${safeName}.png`);
        try {
          await takeScreenshot(driver, screenshot);
        } catch {
          screenshot = "";
        }

        // If the error indicates connection refusal, session loss, or webdriver crash, re-throw it to trigger recreation
        const errStr = String(caught);
        if (errStr.includes("WebDriverError") || errStr.includes("NoSuchSessionError") || errStr.includes("ECONNREFUSED") || errStr.includes("socket hang up")) {
          throw caught;
        }
      }
    }

    const result = {
      id: test.id,
      category: test.category,
      module: test.module || "",
      name: test.name,
      description: test.description,
      steps: test.steps.join("\n"),
      expected: test.expected,
      actual,
      status,
      browser,
      viewport: test.mobile ? "Pixel 7 emulation" : "1440x1000",
      durationMs: Date.now() - startedAt,
      screenshot,
      error,
    };
    this.results.push(result);
    process.stdout.write(`  [${status.padEnd(4)}] ${test.id} ${actual}\n`);
  }
}

module.exports = { TestRunner };
