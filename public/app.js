const statusEl = document.getElementById("status");
const infoBody = document.getElementById("infoBody");
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const icaoEl = document.getElementById("icao24");
const callEl = document.getElementById("callsign");

let map, marker, pathLine;
let timer = null;
let pathCoords = [];

function setStatus(msg) {
  statusEl.textContent = msg;
}

function formatInfo(d) {
  const knots = d.velocity ? (d.velocity * 1.94384).toFixed(0) : "—";
  const kmh = d.velocity ? (d.velocity * 3.6).toFixed(0) : "—";
  const altM = d.baro_altitude != null ? d.baro_altitude.toFixed(0) : "—";
  const altFt = d.baro_altitude != null ? (d.baro_altitude * 3.28084).toFixed(0) : "—";
  const track = d.true_track != null ? d.true_track.toFixed(0) + "°" : "—";

  return [
    `Callsign: ${d.callsign || "—"}`,
    `ICAO24:  ${d.icao24}`,
    `Lat/Lon: ${d.lat.toFixed(4)}, ${d.lon.toFixed(4)}`,
    `Altitude: ${altM} m (${altFt} ft)`,
    `Speed:   ${kmh} km/h (${knots} kt)`,
    `Heading: ${track}`,
    `On ground: ${d.on_ground ? "yes" : "no"}`,
    `Last contact (epoch): ${d.last_contact}`
  ].join("\n");
}

function initMap() {
  map = L.map("map", { worldCopyJump: true }).setView([20, 0], 2);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 8,
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(map);

  pathLine = L.polyline([], { weight: 3 }).addTo(map);
}

async function fetchTrack() {
  const icao24 = icaoEl.value.trim();
  const callsign = callEl.value.trim();

  const params = new URLSearchParams();
  if (icao24) params.set("icao24", icao24);
  else params.set("callsign", callsign);

  const r = await fetch(`/api/track?${params.toString()}`);
  const d = await r.json();

  if (!d.found) {
    setStatus("Flight not found right now. Retrying…");
    return;
  }

  setStatus(`Tracking ${d.callsign || d.icao24} — updated ${new Date().toLocaleTimeString()}`);
  infoBody.textContent = formatInfo(d);

  const latlng = [d.lat, d.lon];
  pathCoords.push(latlng);
  pathLine.setLatLngs(pathCoords);

  if (!marker) {
    marker = L.marker(latlng).addTo(map);
    map.setView(latlng, 5);
  } else {
    marker.setLatLng(latlng);
  }
}

function startTracking() {
  if (timer) return;

  pathCoords = [];
  pathLine.setLatLngs([]);

  setStatus("Starting…");

  fetchTrack();
  timer = setInterval(fetchTrack, 10000); // 10s polling

  startBtn.disabled = true;
  stopBtn.disabled = false;
}

function stopTracking() {
  if (timer) clearInterval(timer);
  timer = null;

  setStatus("Stopped.");
  startBtn.disabled = false;
  stopBtn.disabled = true;
}

startBtn.addEventListener("click", startTracking);
stopBtn.addEventListener("click", stopTracking);

initMap();
