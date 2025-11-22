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

Notes / upgrades you might want

* ICAO24 is king. Callsigns can change or be missing in ADS-B feeds. OpenSky provides both. 
* Polling rate: 10–15 seconds is a good balance. Faster polling may hit limits; authenticated users get far more headroom. 

Easy enhancements:
* add a search box that resolves flight number → ICAO24 using another provider
* show ETA / route / airports (needs a commercial schedule API like AirLabs, Amadeus, etc.) 
* rotate the marker by heading, show a plane icon, cluster path points, etc.
