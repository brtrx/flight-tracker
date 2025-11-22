import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve frontend
app.use(express.static(path.join(__dirname, "public")));

// Helper: build Basic Auth header if creds exist
function authHeader() {
  const u = process.env.OPENSKY_USER;
  const p = process.env.OPENSKY_PASS;
  if (!u || !p) return {};
  const token = Buffer.from(`${u}:${p}`).toString("base64");
  return { Authorization: `Basic ${token}` };
}

/**
 * GET /api/track?icao24=3c4b26
 * GET /api/track?callsign=DLH2AB
 *
 * Returns a normalized object:
 * { found, icao24, callsign, lat, lon, baro_altitude, velocity, true_track, time_position }
 */
app.get("/api/track", async (req, res) => {
  try {
    const { icao24, callsign } = req.query;
    if (!icao24 && !callsign) {
      return res.status(400).json({ error: "Provide icao24 or callsign" });
    }

    // OpenSky "states/all" endpoint gives current observations
    const url = "https://opensky-network.org/api/states/all";
    const r = await fetch(url, { headers: { ...authHeader() } });
    if (!r.ok) {
      return res.status(r.status).json({ error: "OpenSky request failed" });
    }

    const data = await r.json();
    const states = data.states || [];

    let match = null;

    if (icao24) {
      const target = icao24.toLowerCase();
      match = states.find(s => (s[0] || "").toLowerCase() === target);
    } else if (callsign) {
      const target = callsign.toUpperCase().trim();
      match = states.find(s => ((s[1] || "").toUpperCase().trim()) === target);
    }

    if (!match) {
      return res.json({ found: false });
    }

    const [
      mIcao24, mCallsign, originCountry, timePosition, lastContact,
      lon, lat, baroAltitude, onGround, velocity, trueTrack,
      verticalRate, sensors, geoAltitude, squawk, spi, positionSource
    ] = match;

    res.json({
      found: true,
      icao24: mIcao24,
      callsign: (mCallsign || "").trim(),
      lat,
      lon,
      baro_altitude: baroAltitude,
      velocity,
      true_track: trueTrack,
      time_position: timePosition,
      last_contact: lastContact,
      on_ground: onGround
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Flight tracker running on http://localhost:${PORT}`);
});
