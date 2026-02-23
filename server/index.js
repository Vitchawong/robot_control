const express = require("express");
const cors = require("cors");
const { saveTelemetry, getLatest, getHistory } = require("./db/database");

const app = express();
app.use(cors());
app.use(express.json());
require("./mqtt/collector");

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

app.listen(3000);
