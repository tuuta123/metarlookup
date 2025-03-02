# EFIN METAR Site

This site is designed for EFIN sector operations on Vatsim but also lets you search METAR & TAF reports worldwide.
It features a map of Finnish airports with METAR stations. Additionally, a dedicated page helps EFIN controllers
by displaying METAR reports for all active airports in the sector.

## Features

- Map which includes every Finnish airport with a METAR station
- Search for METAR & TAF of an airport manually
- Search for multiple airport's METAR &/or TAF manually
- Search supports all airports in the world
- ATC mode, which displays METAR(s) of active airports in EFIN sector
- Auto-refresh every 30 seconds in ATC mode
- Dark mode

## APIs Used

### VATSIM Data API

- **Endpoint:** `https://data.vatsim.net/v3/vatsim-data.json`
- **Description:** This API provides flight plan data from VATSIM, which is used to identify active airports within the EFIN sector.

### VATSIM METAR API

- **Endpoint:** `https://metar.vatsim.net/metar.php?id={ICAO}`
- **Description:** This API provides METAR data for a specific airport based on its ICAO code.

### MET Norway TAF API

- **Endpoint:** `https://api.met.no/weatherapi/tafmetar/1.0/taf?icao={ICAO}`
- **Description:** This API provides TAF data for a specific airport based on its ICAO code.

## Usage

- **Map Page:** View a map with markers for various airports in Finland. Click on a marker to view METAR data for that airport.
- **Search Page:** Search for METAR & TAF data for a specific airport by entering its ICAO code.
- **Search Multiple Page:** Add multiple airports by their ICAO codes and view their METAR &/or TAF data.
- **EFIN Page:** View METAR data for airports within the EFIN sector. The data is auto-refreshed every 30 seconds.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgements

- [VATSIM](https://www.vatsim.net/) for providing flight plan and METAR data.
- [MET Norway](https://api.met.no/) for providing TAF data.
- [Leaflet](https://leafletjs.com/) for the interactive map library.
- [OpenStreetMap](https://www.openstreetmap.org/) for map tiles.
