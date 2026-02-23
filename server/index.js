const express = require("express");
const cors = require("cors");
const { saveTelemetry, getLatest, getHistory } = require("./db/database");

const app = express();
app.use(cors());
app.use(express.json());
require("./mqtt/collector");

// ===== MQTT CONTROL SETUP =====
require("dotenv").config();
const mqtt = require("mqtt");

const MQTT_URL = `mqtt://${process.env.MQTT_HOST || "localhost"}:${process.env.MQTT_PORT || 1883}`;
const CONTROL_TOPIC = process.env.MQTT_CONTROL_TOPIC || "robot/control";

const mqttClient = mqtt.connect(MQTT_URL);

mqttClient.on("connect", () => {
  console.log("MQTT control connected:", MQTT_URL);
});

mqttClient.on("error", (err) => {
  console.log("MQTT control error:", err.message);
});

app.post("/telemetry", async (req, res) => {
    try {
      const { device_id = "robot01", temp, airpollution, speed } = req.body || {};
      await saveTelemetry({ device_id, temp, airpollution, speed });
      res.json({ ok: true });
    } catch (e) {
      console.error("DB insert failed:", e); // <-- add this
      res.status(500).json({ error: "DB insert failed", details: e.message });
    }
  });
  

app.get("/latest", async (req, res) => {
  try {
    const device_id = (req.query.device_id || "robot01").toString();
    res.json(await getLatest(device_id));
  } catch (e) {
    res.status(500).json({ error: "DB read failed" });
  }
});

app.get("/history", async (req, res) => {
  try {
    const device_id = (req.query.device_id || "robot01").toString();
    const limit = req.query.limit || 50;
    res.json(await getHistory(device_id, limit));
  } catch (e) {
    res.status(500).json({ error: "DB read failed" });
  }
});
app.post("/control", (req, res) => {
  const { cmd, device_id = "robot01" } = req.body || {};

  if (!cmd) {
    return res.status(400).json({ error: "Missing cmd" });
  }

  const payload = JSON.stringify({
    device_id,
    cmd,
    ts: Date.now()
  });

  mqttClient.publish(CONTROL_TOPIC, payload, (err) => {
    if (err) {
      return res.status(500).json({ error: "MQTT publish failed" });
    }
    res.json({ ok: true, topic: CONTROL_TOPIC, payload });
  });
});

app.listen(3000);
