# flight-tracker
Free flight tracker

What the app does

You enter a flight identifier:
* ICAO24 hex (best/most reliable), or
* Callsign (sometimes padded with spaces in OpenSky).

The server queries OpenSky every ~10 seconds.

The client updates a marker + draws the path.

It uses:

1. OpenSky Network API for live aircraft positions derived from ADS-B data (free for non-commercial/research use). 
2. Leaflet + OpenStreetMap tiles for a lightweight world map. 
3. A tiny Node/Express proxy to avoid CORS issues and keep your OpenSky login off the client. (OpenSky authenticated access also raises rate limits.)
