require("dotenv").config();
const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "robotdb",
  port: Number(process.env.DB_PORT || 3306),
  waitForConnections: true,
  connectionLimit: 10,
});

// Optional: test DB connection on startup
pool.getConnection()
  .then(conn => {
    console.log("✅ MySQL connected using ENV");
    conn.release();
  })
  .catch(err => {
    console.error("❌ MySQL connection failed:", err.message);
  });

/* =========================
   SAVE TELEMETRY
========================= */
async function saveTelemetry({ device_id, temp, speed, pm1, pm25, pm10 }) {
  await pool.execute(
    `INSERT INTO telemetry (device_id, temp, speed, pm1, pm25, pm10)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      device_id,
      temp ?? null,
      speed ?? null,
      pm1 ?? null,
      pm25 ?? null,
      pm10 ?? null,
    ]
  );
}

/* =========================
   GET LATEST
========================= */
async function getLatest(device_id) {
  const [rows] = await pool.execute(
    `SELECT device_id, temp, speed, pm1, pm25, pm10, created_at
     FROM telemetry
     WHERE device_id = ?
     ORDER BY created_at DESC
     LIMIT 1`,
    [device_id]
  );
  return rows[0] || {};
}

/* =========================
   GET HISTORY
========================= */
async function getHistory(device_id, limit = 50) {
  const lim = Math.min(Number(limit) || 50, 500);

  const [rows] = await pool.execute(
    `SELECT device_id, temp, speed, pm1, pm25, pm10, created_at
     FROM telemetry
     WHERE device_id = ?
     ORDER BY created_at DESC
     LIMIT ?`,
    [device_id, lim]
  );

  return rows;
}

module.exports = { saveTelemetry, getLatest, getHistory };