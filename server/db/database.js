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

async function saveTelemetry({ device_id, temp, airpollution, speed }) {
  await pool.execute(
    `INSERT INTO telemetry (device_id, temp, airpollution, speed)
     VALUES (?, ?, ?, ?)`,
    [device_id, temp ?? null, airpollution ?? null, speed ?? null]
  );
}

async function getLatest(device_id) {
  const [rows] = await pool.execute(
    `SELECT device_id, temp, airpollution, speed, created_at
     FROM telemetry
     WHERE device_id = ?
     ORDER BY id DESC
     LIMIT 1`,
    [device_id]
  );
  return rows[0] || {};
}

async function getHistory(device_id, limit = 50) {
  const lim = Math.min(Number(limit) || 50, 500);
  const [rows] = await pool.execute(
    `SELECT device_id, temp, airpollution, speed, created_at
     FROM telemetry
     WHERE device_id = ?
     ORDER BY id DESC
     LIMIT ?`,
    [device_id, lim]
  );
  return rows;
}

module.exports = { saveTelemetry, getLatest, getHistory };