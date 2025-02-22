document.addEventListener("DOMContentLoaded", () => {
    const metarInput = document.getElementById("metar-input");
    const addMetarButton = document.getElementById("add-metar");
    const clearAllButton = document.getElementById("clear-all");
    const metarList = document.getElementById("metar-list");

    let autoRefreshInterval;

    // Function to fetch METAR data using VATSIM METAR API
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

    // Function to fetch TAF data using MET Norway API
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

    // Function to fetch and display METAR and TAF data
    async function fetchAndDisplayWeather(icao) {
        const showTaf = localStorage.getItem("showTaf") === "true";

        // Fetch METAR data
        const metar = await fetchMetar(icao);
        let weatherContent = `<h3>METAR for ${icao}</h3>`;
        if (metar) {
            weatherContent += `<pre>${metar}</pre>`;
        } else {
            weatherContent += `<p>No METAR data available.</p>`;
        }

        // Fetch TAF data if enabled
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
            .find(h3 => h3.textContent === icao)?.parentElement;

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

    // Function to handle adding a weather box
    function addWeather() {
        const icao = metarInput.value.trim().toUpperCase();
        if (icao && /^[A-Z]{4}$/.test(icao)) {
            fetchAndDisplayWeather(icao);
            metarInput.value = ""; // Clear the input
        } else {
            alert("Please enter a valid ICAO code (4 letters).");
        }
    }

    // Function to start auto-refresh
    function startAutoRefresh() {
        const autoRefresh = localStorage.getItem("autoRefresh") || "300000"; // Default to 5 minutes
        const interval = parseInt(autoRefresh, 10);

        if (interval > 0) {
            autoRefreshInterval = setInterval(() => {
                const weatherBoxes = document.querySelectorAll(".metar-box");
                weatherBoxes.forEach(box => {
                    const icao = box.querySelector("h3").textContent;
                    fetchAndDisplayWeather(icao); // Refresh the weather data
                });
            }, interval);
        }
    }

    // Function to stop auto-refresh
    function stopAutoRefresh() {
        if (autoRefreshInterval) {
            clearInterval(autoRefreshInterval);
        }
    }

    // Function to restart auto-refresh with new interval
    function restartAutoRefresh() {
        stopAutoRefresh();
        startAutoRefresh();
    }

    // Event listeners
    if (addMetarButton) {
        addMetarButton.addEventListener("click", addWeather);
    }
    if (metarInput) {
        metarInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                addWeather(); // Call the addWeather function
            }
        });
    }
    if (clearAllButton) {
        clearAllButton.addEventListener("click", () => {
            metarList.innerHTML = ""; // Clear all weather boxes
        });
    }

    // Start auto-refresh when the page loads
    startAutoRefresh();

    // Listen for changes to auto-refresh settings
    window.addEventListener("storage", (event) => {
        if (event.key === "autoRefresh" || event.key === "showTaf") {
            restartAutoRefresh(); // Restart auto-refresh with the new interval
        }
    });
});
