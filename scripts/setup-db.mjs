/**
 * Creates MongoDB indexes for FluentVoice.
 * Run once: node scripts/setup-db.mjs
 */
import { MongoClient } from "mongodb";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Parse .env.local manually (dotenv may not be ESM-friendly everywhere)
function loadEnv() {
  try {
    const env = readFileSync(resolve(__dirname, "../.env.local"), "utf8");
    for (const line of env.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const val = trimmed.slice(eq + 1).trim();
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {
    // .env.local not found — rely on existing env
  }
}

loadEnv();

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("❌  MONGODB_URI not set. Fill in .env.local first.");
  process.exit(1);
}
if (uri.includes("<db_password>")) {
  console.error("❌  Replace <db_password> in .env.local with your actual Atlas password.");
  process.exit(1);
}

const client = new MongoClient(uri);

try {
  await client.connect();
  console.log("✓ Connected to MongoDB Atlas");

  const db = client.db("fluentvoice");

  await db.collection("users").createIndex({ email: 1 }, { unique: true });
  console.log("✓ users.email — unique index");

  await db.collection("sessions").createIndex({ userId: 1, createdAt: -1 });
  console.log("✓ sessions.userId + createdAt — compound index");

  await db.collection("treatment_plans").createIndex({ patientId: 1 }, { unique: true });
  console.log("✓ treatment_plans.patientId — unique index");

  console.log("\n✅  All indexes ready. Database is set up.");
} catch (err) {
  console.error("❌  Error:", err.message);
  process.exit(1);
} finally {
  await client.close();
}
