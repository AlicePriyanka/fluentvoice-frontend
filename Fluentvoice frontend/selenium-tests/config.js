const path = require("node:path");

function parseBoolean(value, fallback) {
  if (value === undefined) return fallback;
  return ["1", "true", "yes", "on"].includes(String(value).toLowerCase());
}

function parseArgs(argv) {
  return argv.reduce((result, arg) => {
    if (!arg.startsWith("--")) return result;
    const [key, value = "true"] = arg.slice(2).split("=");
    result[key] = value;
    return result;
  }, {});
}

function loadEnvFile() {
  const fs = require("node:fs");
  const envPath = path.join(__dirname, ".env");
  if (!fs.existsSync(envPath)) return;

  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separator = trimmed.indexOf("=");
    if (separator < 1) continue;
    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim().replace(/^["']|["']$/g, "");
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

loadEnvFile();
const args = parseArgs(process.argv.slice(2));

const baseUrl = (args.url || process.env.BASE_URL || "http://localhost:3000").replace(/\/$/, "");
const browsers = (args.browsers || process.env.BROWSERS || "chrome")
  .split(",")
  .map((browser) => browser.trim().toLowerCase())
  .filter(Boolean);

module.exports = {
  baseUrl,
  browsers,
  suite: (args.suite || process.env.TEST_SUITE || "full").toLowerCase(),
  headless: args.headed === "true" ? false : parseBoolean(process.env.HEADLESS, true),
  timeoutMs: Number(process.env.DEFAULT_TIMEOUT_MS || 15000),
  pageLoadThresholdMs: Number(process.env.PAGE_LOAD_THRESHOLD_MS || 5000),
  artifactsDir: path.join(__dirname, "artifacts"),
  allowDataMutation: parseBoolean(process.env.ALLOW_DATA_MUTATION, false),
  failOnSeriousA11y: parseBoolean(process.env.FAIL_ON_SERIOUS_A11Y, true),
  securityHeadersStrict: parseBoolean(process.env.SECURITY_HEADERS_STRICT, false),
  credentials: {
    patient: {
      email: process.env.PATIENT_EMAIL || "",
      password: process.env.PATIENT_PASSWORD || "",
    },
    therapist: {
      email: process.env.THERAPIST_EMAIL || "",
      password: process.env.THERAPIST_PASSWORD || "",
    },
  },
};
