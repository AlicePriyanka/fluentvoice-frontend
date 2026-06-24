import pg from "pg";

const url = "postgresql://fluentvoice_user:7UVKqYuE971VmMVsF0fMjcqY8FElYXQf@dpg-d8shicv7f7vs73cu7ql0-a.oregon-postgres.render.com/fluentvoice?ssl=true";

const pool = new pg.Pool({ connectionString: url });

async function ping() {
  console.log("Pinging Render DB...");
  try {
    const res = await pool.query("SELECT NOW()");
    console.log("Render DB is awake!", res.rows[0]);
  } catch (err) {
    console.error("Failed:", err.message);
  } finally {
    pool.end();
  }
}

ping();
