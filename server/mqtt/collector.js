require("dotenv").config();

const mqtt = require("mqtt");
const mysql = require("mysql2/promise");

const MQTT_URL = `mqtt://${process.env.MQTT_HOST || "localhost"}:${process.env.MQTT_PORT || 1883}`;
const TOPIC = process.env.MQTT_TOPIC || "robot/telemetry/ohm123";

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "robotdb",
  port: Number(process.env.DB_PORT || 3306),
  waitForConnections: true,
  connectionLimit: 10,
});

// Insert into DB
async function insertTelemetry({ device_id, temp, airpollution, speed }) {
  await pool.execute(
    `INSERT INTO telemetry (device_id, temp, airpollution, speed)
     VALUES (?, ?, ?, ?)`,
    [device_id, temp ?? null, airpollution ?? null, speed ?? null]
  );
}

// Parse MQTT message safely
function parseMessage(messageBuf) {
  const raw = messageBuf.toString("utf8").trim();
  console.log("RAW MQTT:", raw);

  // 1) Normal JSON (best)
  try {
    return JSON.parse(raw);
  } catch (_) {}

  // 2) Common “almost JSON” fixes:
  // - single quotes -> double quotes
  // - unquoted keys -> quoted keys
  let fixed = raw
    .replace(/'/g, '"')
    .replace(/([{,]\s*)([a-zA-Z_]\w*)(\s*:)/g, '$1"$2"$3');

  return JSON.parse(fixed);
}

const client = mqtt.connect(MQTT_URL);

client.on("connect", () => {
  console.log("MQTT connected:", MQTT_URL);
  client.subscribe(TOPIC, (err) => {
    if (err) console.error("Subscribe error:", err);
    else console.log("Subscribed to:", TOPIC);
  });
});

client.on("message", async (topic, message) => {
  try {
    const data = parseMessage(message);

    const payload = {
      device_id: String(data.device_id || "robot01"),
      temp: data.temp ?? null,
      airpollution: data.airpollution ?? null,
      speed: data.speed ?? null,
    };

    console.log("Parsed payload:", payload);

    await insertTelemetry(payload);
    console.log("Inserted:", payload);
  } catch (e) {
    console.error("Bad message / DB error:", e.message);
  }
});