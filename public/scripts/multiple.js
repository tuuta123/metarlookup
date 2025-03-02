document.addEventListener("DOMContentLoaded", () => {
    const metarInput = document.getElementById("metar-input");
    const addMetarButton = document.getElementById("add-metar");
    const clearAllButton = document.getElementById("clear-all");
    const metarList = document.getElementById("metar-list");
    const toggleTafCheckbox = document.getElementById("toggle-taf");

    let autoRefreshInterval;

    // Fetch METAR using VATSIM API
    async function fetchMetar(icao) {
        const url = `https://metar.vatsim.net/metar.php?id=${icao}`;
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error("Error fetching METAR data");
            const data = await response.text();
            return data;
        } catch (error) {
            console.error("Error loading METAR data:", error);
            return null;
        }
    }

    // Fetch TAF using MET Norway API
    async function fetchTaf(icao) {
        const url = `https://api.met.no/weatherapi/tafmetar/1.0/taf?icao=${icao}`;
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error("Error fetching TAF data");
            const data = await response.text(); // Fetch as plain text
            return data;
        } catch (error) {
            console.error("Error loading TAF data:", error);
            return null;
        }
    }

    // Fetch and display weather data
    async function fetchAndDisplayWeather(icao) {
        const showTaf = toggleTafCheckbox.checked;

        // Fetch METAR data
        const metar = await fetchMetar(icao);
        let weatherContent = `<h3>METAR for ${icao}</h3>`;
        if (metar) {
            weatherContent += `<pre>${metar}</pre>`;
        } else {
            weatherContent += `<p>No METAR data available.</p>`;
        }

        // Fetch TAF data (if enabled)
        if (showTaf) {
            const taf = await fetchTaf(icao);
            weatherContent += `<div class="taf-container"><h3>TAF for ${icao}</h3>`;
            if (taf) {
                weatherContent += `<pre>${taf}</pre>`;
            } else {
                weatherContent += `<p>No TAF data available.</p>`;
            }
            weatherContent += `</div>`;
        }

        // Check if a weather box for this ICAO already exists
        let weatherBox = Array.from(document.querySelectorAll(".metar-box h3"))
            .find(h3 => h3.textContent === `METAR for ${icao}`)?.parentElement;

        if (!weatherBox) {
            // Create a new weather box if it doesn't exist
            weatherBox = document.createElement("div");
            weatherBox.className = "metar-box";
            weatherBox.innerHTML = weatherContent + `<button class="remove-metar">Remove</button>`;
            metarList.appendChild(weatherBox);

            // Add event listener to the remove button
            weatherBox.querySelector(".remove-metar").addEventListener("click", () => {
                weatherBox.remove();
            });
        } else {
            // Update the existing weather box
            weatherBox.innerHTML = weatherContent + `<button class="remove-metar">Remove</button>`;
        }
    }

    // Handle adding a weather box
    function addWeather() {
        const icao = metarInput.value.trim().toUpperCase();
        if (icao) {
            fetchAndDisplayWeather(icao);
            metarInput.value = "";
        }
    }

    // Event listeners
    addMetarButton.addEventListener("click", addWeather);

    clearAllButton.addEventListener("click", () => {
        metarList.innerHTML = "";
    });

    metarInput.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            addWeather();
        }
    });
});