// Airports
const airports = [
    { name: 'Enontekio', code: 'EFET', coords: [68.3626, 23.4243] },
    { name: 'Halli', code: 'EFHA', coords: [61.8560, 24.7866] },
    { name: 'Helsinki-Vantaa', code: 'EFHK', coords: [60.3172, 24.9633] },
    { name: 'Ivalo', code: 'EFIV', coords: [68.6073, 27.4053] },
    { name: 'Joensuu', code: 'EFJO', coords: [62.6629, 29.6075] },
    { name: 'Jyvaskyla', code: 'EFJY', coords: [62.3994, 25.6783] },
    { name: 'Kemi-Tornio', code: 'EFKE', coords: [65.7787, 24.5821] },
    { name: 'Kajaani', code: 'EFKI', coords: [64.2855, 27.6924] },
    { name: 'Kokkola-Pietarsaari', code: 'EFKK', coords: [63.7212, 23.1431] },
    { name: 'Kuusamo', code: 'EFKS', coords: [66.0009, 29.2231] },
    { name: 'Kittila', code: 'EFKT', coords: [67.7010, 24.8468] },
    { name: 'Kuopio', code: 'EFKU', coords: [63.0071, 27.7978] },
    { name: 'Lappeenranta', code: 'EFLP', coords: [61.0446, 28.1444] },
    { name: 'Mariehamn', code: 'EFMA', coords: [60.1222, 19.8982] },
    { name: 'Mikkeli', code: 'EFMI', coords: [61.6866, 27.2016] },
    { name: 'Oulu', code: 'EFOU', coords: [64.9306, 25.3542] },
    { name: 'Pori', code: 'EFPO', coords: [61.4617, 21.7992] },
    { name: 'Rovaniemi', code: 'EFRO', coords: [66.5638, 25.8482] },
    { name: 'Savonlinna', code: 'EFSA', coords: [61.9431, 28.9458] },
    { name: 'Seinajoki', code: 'EFSI', coords: [62.6921, 22.8323] },
    { name: 'Tampere-Pirkkala', code: 'EFTP', coords: [61.4144, 23.8328] },
    { name: 'Turku', code: 'EFTU', coords: [60.4511, 22.2624] },
    { name: 'Utti', code: 'EFUT', coords: [60.8964, 26.9383] },
    { name: 'Vaasa', code: 'EFVA', coords: [63.0500, 21.7667] }
];

// Fetch Metar Data
async function fetchMetarData(airportCode) {
    try {
        const response = await fetch(`https://metar.vatsim.net/metar.php?id=${airportCode}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.text();
        return data;
    } catch (error) {
        console.error('Error fetching METAR data:', error);
        return null;
    }
}

// Parse METAR data
function parseMetarData(metar) {
    const ceilingMatch = metar.match(/BKN(\d{3})|OVC(\d{3})/);
    const visibilityMatch = metar.match(/(\d{4})\s?SM/);

    const ceiling = ceilingMatch ? parseInt(ceilingMatch[1] || ceilingMatch[2]) * 100 : Infinity;
    const visibility = visibilityMatch ? parseInt(visibilityMatch[1]) : Infinity;

    return { ceiling, visibility };
}

// Flight Rules
function flightRules(ceiling, visibility) {
    if (ceiling < 500 || visibility < 1500) {
        return { color: 'purple', label: 'LIFR' };
    } else if (ceiling < 1000 || visibility < 5000) {
        return { color: 'red', label: 'IFR' };
    } else if (ceiling < 3000 || visibility < 8000) {
        return { color: 'blue', label: 'MVFR' };
    } else {
        return { color: 'green', label: 'VFR' };
    }
}

// Markers
async function addMarkers(map) {
    for (const airport of airports) {
        const metarData = await fetchMetarData(airport.code);
        const { ceiling, visibility } = parseMetarData(metarData);
        const { color, label } = flightRules(ceiling, visibility);

        const marker = L.circleMarker(airport.coords, {
            radius: 10,
            color: color,
            fillColor: color,
            fillOpacity: 0.5
        }).addTo(map);

        marker.bindTooltip(`${airport.name} (${label})`, { permanent: false, direction: 'top', offset: [0, -10] });

        marker.on('click', () => {
            window.location.href = `single.html?icao=${airport.code}`;
        });
    }
}

// Maps
function initializeMap() {
    const isDarkMode = localStorage.getItem("theme") === "dark";
    const tileLayerUrl = isDarkMode
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    const tileLayer = L.tileLayer(tileLayerUrl, {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    const map = L.map('map', {
        zoomControl: false
    }).setView([64.2855, 27.6924], 5);
    tileLayer.addTo(map);

    // Zoom Control
    L.control.zoom({
        position: 'bottomleft'
    }).addTo(map);

    addMarkers(map);
}

initializeMap();