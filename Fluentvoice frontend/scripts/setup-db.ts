/**
 * Run once to create MongoDB indexes.
 * Usage: npx tsx scripts/setup-db.ts
 * (requires MONGODB_URI in .env.local)
 */
import { MongoClient } from "mongodb";
import * as dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(process.cwd(), ".env.local") });

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI not set in .env.local");

async function main() {
  const client = new MongoClient(uri!);
  await client.connect();
  const db = client.db("fluentvoice");

  // users: unique email index
  await db.collection("users").createIndex({ email: 1 }, { unique: true });
  console.log("✓ users.email unique index");

  // sessions: index by userId + createdAt for fast per-user queries
  await db.collection("sessions").createIndex({ userId: 1, createdAt: -1 });
  console.log("✓ sessions.userId + createdAt index");

  // treatment_plans: index by patientId (one plan per patient)
  await db.collection("treatment_plans").createIndex({ patientId: 1 }, { unique: true });
  console.log("✓ treatment_plans.patientId unique index");

  await client.close();
  console.log("\nAll indexes created successfully.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
