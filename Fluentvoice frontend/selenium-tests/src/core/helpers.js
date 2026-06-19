const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { By, Key, until } = require("selenium-webdriver");

async function waitForPage(driver, timeoutMs) {
  await driver.wait(
    async () => (await driver.executeScript("return document.readyState")) === "complete",
    timeoutMs,
    "Page did not reach readyState=complete"
  );
}

async function navigate(driver, config, route) {
  let finalRoute = route;
  if (finalRoute && finalRoute !== "/") {
    const urlParts = finalRoute.split("?");
    let pathPart = urlParts[0];
    const queryPart = urlParts[1];
    if (!pathPart.endsWith("/")) {
      pathPart += "/";
    }
    finalRoute = queryPart ? `${pathPart}?${queryPart}` : pathPart;
  }
  await driver.get(`${config.baseUrl}${finalRoute}`);
  await waitForPage(driver, config.timeoutMs);
}

async function visible(driver, locator, timeoutMs) {
  const element = await driver.wait(until.elementLocated(locator), timeoutMs);
  await driver.wait(until.elementIsVisible(element), timeoutMs);
  return element;
}

async function clickText(driver, text, timeoutMs) {
  const xpath = `//*[self::button or self::a][contains(normalize-space(.), ${xpathLiteral(text)})]`;
  const element = await visible(driver, By.xpath(xpath), timeoutMs);
  await driver.wait(until.elementIsEnabled(element), timeoutMs);
  await element.click();
  return element;
}

function xpathLiteral(value) {
  if (!value.includes("'")) return `'${value}'`;
  if (!value.includes('"')) return `"${value}"`;
  return `concat('${value.replace(/'/g, `',"'",'`)}')`;
}

async function login(driver, config, role) {
  const credentials = config.credentials[role];
  if (!credentials?.email || !credentials?.password) {
    throw new SkipTest(`Set ${role.toUpperCase()}_EMAIL and ${role.toUpperCase()}_PASSWORD to run this test.`);
  }

  await navigate(driver, config, "/login");
  const email = await visible(driver, By.css("input[type='email']"), config.timeoutMs);
  const password = await visible(driver, By.css("input[type='password']"), config.timeoutMs);
  await email.clear();
  await email.sendKeys(credentials.email);
  await password.clear();
  await password.sendKeys(credentials.password, Key.ENTER);
  await driver.wait(until.urlContains(`/${role}`), config.timeoutMs);
}

async function apiRequest(driver, pathName, options = {}) {
  return driver.executeAsyncScript(
    `
      const done = arguments[arguments.length - 1];
      fetch(arguments[0], arguments[1])
        .then(async (response) => {
          const text = await response.text();
          let body = text;
          try { body = JSON.parse(text); } catch {}
          done({
            status: response.status,
            ok: response.ok,
            body,
            headers: Object.fromEntries(response.headers.entries())
          });
        })
        .catch((error) => done({ status: 0, ok: false, error: error.message }));
    `,
    pathName,
    options
  );
}

async function navigationMetrics(driver) {
  return driver.executeScript(`
    const nav = performance.getEntriesByType("navigation")[0];
    if (!nav) return null;
    return {
      duration: Math.round(nav.duration),
      domContentLoaded: Math.round(nav.domContentLoadedEventEnd),
      loadEvent: Math.round(nav.loadEventEnd),
      responseTime: Math.round(nav.responseEnd - nav.requestStart),
      transferSize: nav.transferSize || 0
    };
  `);
}

async function assertNoHorizontalOverflow(driver) {
  const dimensions = await driver.executeScript(`
    return {
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth
    };
  `);
  assert.ok(
    dimensions.scrollWidth <= dimensions.clientWidth + 2,
    `Horizontal overflow: scrollWidth=${dimensions.scrollWidth}, clientWidth=${dimensions.clientWidth}`
  );
}

async function takeScreenshot(driver, targetPath) {
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.writeFileSync(targetPath, await driver.takeScreenshot(), "base64");
}

class SkipTest extends Error {
  constructor(message) {
    super(message);
    this.name = "SkipTest";
  }
}

async function clickLink(driver, selector, timeoutMs = 15000) {
  const elements = await driver.findElements(By.css(selector));
  for (const el of elements) {
    if (await el.isDisplayed()) {
      try {
        await el.click();
        return;
      } catch {}
    }
  }
  if (elements.length > 0) {
    await driver.executeScript("arguments[0].click();", elements[0]);
  } else {
    throw new Error(`No element matching selector: ${selector}`);
  }
}

async function urlContains(driver, text, timeoutMs = 15000) {
  await driver.wait(until.urlContains(text), timeoutMs);
}

module.exports = {
  assert,
  By,
  Key,
  until,
  SkipTest,
  navigate,
  visible,
  clickText,
  login,
  apiRequest,
  navigationMetrics,
  assertNoHorizontalOverflow,
  takeScreenshot,
  clickLink,
  urlContains,
};

