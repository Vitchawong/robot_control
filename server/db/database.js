const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "1234",
  database: "robotdb",
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
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
