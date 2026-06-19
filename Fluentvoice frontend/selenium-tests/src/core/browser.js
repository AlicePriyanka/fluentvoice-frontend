const { Builder } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const edge = require("selenium-webdriver/edge");
const firefox = require("selenium-webdriver/firefox");

function chromeOptions(config, mobile = false) {
  const options = new chrome.Options();
  if (config.headless) options.addArguments("--headless=new");
  options.addArguments(
    "--disable-notifications",
    "--disable-dev-shm-usage",
    "--no-sandbox",
    "--disable-gpu"
  );
  if (mobile) {
    options.setMobileEmulation({ deviceName: "Pixel 7" });
  } else {
    options.addArguments("--window-size=1440,1000");
  }
  return options;
}

async function createDriver(browserName, config, mobile = false) {
  let builder = new Builder().forBrowser(browserName);

  if (browserName === "chrome") {
    builder = builder.setChromeOptions(chromeOptions(config, mobile));
  } else if (browserName === "MicrosoftEdge" || browserName === "edge") {
    const options = new edge.Options();
    if (config.headless) options.addArguments("--headless=new");
    options.addArguments("--window-size=1440,1000", "--disable-notifications");
    builder = new Builder().forBrowser("MicrosoftEdge").setEdgeOptions(options);
  } else if (browserName === "firefox") {
    const options = new firefox.Options();
    if (config.headless) options.addArguments("-headless");
    options.addArguments("--width=1440", "--height=1000");
    builder = builder.setFirefoxOptions(options);
  } else {
    throw new Error(`Unsupported browser: ${browserName}`);
  }

  const driver = await builder.build();
  await driver.manage().setTimeouts({
    implicit: 0,
    pageLoad: Math.max(config.timeoutMs * 2, 30000),
    script: config.timeoutMs,
  });
  if (!mobile) await driver.manage().window().setRect({ width: 1440, height: 1000 });
  return driver;
}

module.exports = { createDriver };
