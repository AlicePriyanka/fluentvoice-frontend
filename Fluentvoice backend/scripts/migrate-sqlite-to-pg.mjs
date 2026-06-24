import Database from "better-sqlite3";
import pg from "pg";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

const __dirname = dirname(fileURLToPath(import.meta.url));
const sqlitePath = resolve(__dirname, "../fluentvoice.db");

console.log(`Connecting to SQLite at ${sqlitePath}`);
const sqliteDb = new Database(sqlitePath, { fileMustExist: true });

console.log(`Connecting to Postgres at ${process.env.DATABASE_URL}`);
const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes("localhost") ? false : { rejectUnauthorized: false }
});

async function migrate() {
  const client = await pgPool.connect();
  try {
    // 1. Users
    try {
      const users = sqliteDb.prepare("SELECT * FROM users").all();
      console.log(`Migrating ${users.length} users...`);
      
      const therapists = users.filter(u => u.role === "therapist");
      const patients = users.filter(u => u.role === "patient");

      for (const u of therapists) {
        await client.query(
          "INSERT INTO users (_id, email, passwordHash, name, role, therapistId, joinedDate, createdAt) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (_id) DO NOTHING",
          [u._id, u.email, u.passwordHash, u.name, u.role, u.therapistId, u.joinedDate, u.createdAt]
        );
      }
      for (const u of patients) {
        await client.query(
          "INSERT INTO users (_id, email, passwordHash, name, role, therapistId, joinedDate, createdAt) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (_id) DO NOTHING",
          [u._id, u.email, u.passwordHash, u.name, u.role, u.therapistId, u.joinedDate, u.createdAt]
        );
      }
    } catch (e) { console.warn("Could not migrate users:", e.message); }

    // 2. Profiles
    try {
      const profiles = sqliteDb.prepare("SELECT * FROM profiles").all();
      console.log(`Migrating ${profiles.length} profiles...`);
      for (const p of profiles) {
        await client.query(
          "INSERT INTO profiles (_id, userId, role, phone, age, condition, bio, specialty, licenseNumber, clinicName, updatedAt) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) ON CONFLICT (_id) DO NOTHING",
          [p._id, p.userId, p.role, p.phone, p.age, p.condition, p.bio, p.specialty, p.licenseNumber, p.clinicName, p.updatedAt]
        );
      }
    } catch (e) { console.warn("Could not migrate profiles:", e.message); }

    // 3. Sessions
    try {
      const sessions = sqliteDb.prepare("SELECT * FROM sessions").all();
      console.log(`Migrating ${sessions.length} sessions...`);
      for (const s of sessions) {
        const fluency_score = Math.round(Number(s.fluency_score));
        await client.query(
          "INSERT INTO sessions (_id, userId, fluency_score, severity, speech_rate, transcript, disfluencies, pauses, timeline, audioUrl, createdAt) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) ON CONFLICT (_id) DO NOTHING",
          [s._id, s.userId, fluency_score, s.severity, s.speech_rate, s.transcript, s.disfluencies, s.pauses, s.timeline, s.audioUrl, s.createdAt]
        );
      }
    } catch (e) { console.warn("Could not migrate sessions:", e.message); }

    // 4. Appointments
    try {
      const appointments = sqliteDb.prepare("SELECT * FROM appointments").all();
      console.log(`Migrating ${appointments.length} appointments...`);
      for (const a of appointments) {
        await client.query(
          "INSERT INTO appointments (_id, patientId, therapistId, patientName, date, time, durationMinutes, type, status, notes, createdAt, updatedAt) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) ON CONFLICT (_id) DO NOTHING",
          [a._id, a.patientId, a.therapistId, a.patientName, a.date, a.time, a.durationMinutes, a.type, a.status, a.notes, a.createdAt, a.updatedAt]
        );
      }
    } catch (e) { console.warn("Could not migrate appointments:", e.message); }

    // 5. Treatment Plans
    try {
      const plans = sqliteDb.prepare("SELECT * FROM treatment_plans").all();
      console.log(`Migrating ${plans.length} treatment plans...`);
      for (const p of plans) {
        await client.query(
          "INSERT INTO treatment_plans (_id, patientId, therapistId, goals, exercises, remarks, updatedAt) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (_id) DO NOTHING",
          [p._id, p.patientId, p.therapistId, p.goals, p.exercises, p.remarks, p.updatedAt]
        );
      }
    } catch (e) { console.warn("Could not migrate treatment_plans:", e.message); }

    // 6. Treatment Plan Versions
    try {
      const versions = sqliteDb.prepare("SELECT * FROM treatment_plan_versions").all();
      console.log(`Migrating ${versions.length} treatment plan versions...`);
      for (const v of versions) {
        await client.query(
          "INSERT INTO treatment_plan_versions (_id, patientId, therapistId, goals, exercises, remarks, updatedAt) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (_id) DO NOTHING",
          [v._id, v.patientId, v.therapistId, v.goals, v.exercises, v.remarks, v.updatedAt]
        );
      }
    } catch (e) { console.warn("Could not migrate treatment_plan_versions:", e.message); }

    console.log("Migration completed successfully!");
  } catch (err) {
    console.error("Error migrating data:", err);
  } finally {
    client.release();
    await pgPool.end();
    sqliteDb.close();
  }
}

migrate();
