const mqtt = require("mqtt");
const mysql = require("mysql2/promise");

const MQTT_URL = "mqtt://localhost:1883"; // if broker is on this PC
const TOPIC = "robot/telemetry";

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "1234",
  database: "robotdb",
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
});

async function insertTelemetry({ device_id, temp, airpollution, speed }) {
  await pool.execute(
    `INSERT INTO telemetry (device_id, temp, airpollution, speed)
     VALUES (?, ?, ?, ?)`,
    [device_id, temp ?? null, airpollution ?? null, speed ?? null]
  );
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
    let text = message.toString("utf8");
    // convert {temp:23,...,device_id:robot01} -> {"temp":23,...,"device_id":"robot01"}
    console.log('fuck')
    text = text
    .replace(/([{,])\s*([a-zA-Z_]\w*)\s*:/g, '$1"$2":')           // quote keys
    .replace(/"device_id"\s*:\s*([a-zA-Z_]\w*)/g, '"device_id":"$1"'); // quote device_id value

    console.log("RAW MQTT:", text); // <--- add this line
    const data = JSON.parse(text);

    const payload = {
      device_id: (data.device_id || "robot01").toString(),
      temp: data.temp,
      airpollution: data.airpollution,
      speed: data.speed,
    };
    console.log(payload)

    await insertTelemetry(payload);
    console.log("Inserted:", payload);
  } catch (e) {
    console.error("Bad message / DB error:", e.message);
  }
});
