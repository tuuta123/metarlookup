document.addEventListener("DOMContentLoaded", () => {
    const dropdown = document.getElementById("airport-dropdown");
    const searchBox = document.getElementById("search-box");
    const findButton = document.getElementById("find-button");
    const airportTitle = document.getElementById("airport-title");
    const weatherBox = document.getElementById("weather");
    const toggleModeBtn = document.getElementById("toggle-mode");

    // Airport data with ICAO codes
    const airports = [
        "EFET", "EFHA", "EFHK", "EFIV", "EFJO", "EFJY", "EFKE", "EFKI",
        "EFKK", "EFKS", "EFKT", "EFKU", "EFLP", "EFMA", "EFMI", "EFOU",
        "EFPO", "EFRO", "EFSA", "EFSI", "EFTP", "EFTU", "EFUT", "EFVA"
    ].sort(); // Sort alphabetically

    let autoRefreshInterval;

    // Function to toggle dark/light mode globally
    function toggleMode() {
        const isDarkMode = document.body.classList.toggle("dark-mode");
        localStorage.setItem("theme", isDarkMode ? "dark" : "light");
        location.reload(); // Refresh the page to apply the theme
    }

    // Function to update the theme button text
    function updateThemeButton(isDarkMode) {
        if (toggleModeBtn) {
            toggleModeBtn.textContent = isDarkMode ? "☀️ Light Mode" : "🌙 Dark Mode";
        }
    }

    // Function to load dark mode preference
    function loadDarkModePreference() {
        const isDarkMode = localStorage.getItem("theme") === "dark";
        document.body.classList.toggle("dark-mode", isDarkMode);
        updateThemeButton(isDarkMode); // Update the button text immediately
    }

    // Function to create the dropdown options
    function createDropdown(filter = "") {
        const filteredAirports = airports.filter(icao =>
            icao.toLowerCase().includes(filter.toLowerCase())
        );
        dropdown.innerHTML = filteredAirports.map(icao => `<option value="${icao}">${icao}</option>`).join('');
        console.log("Dropdown options:", filteredAirports); // Debugging

        // Automatically select the first option in the dropdown
        if (filteredAirports.length > 0) {
            dropdown.value = filteredAirports[0];
            updateData(filteredAirports[0]); // Update weather data
        }
    }

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

    // Function to update data based on selected airport
    async function updateData(icao) {
        airportTitle.textContent = `Weather for ${icao}`;

        // Fetch METAR data
        const metar = await fetchMetar(icao);
        let weatherContent = `<h3>METAR for ${icao}</h3>`;
        if (metar) {
            weatherContent += `<pre>${metar}</pre>`;
        } else {
            weatherContent += `<p>No METAR data available.</p>`;
        }

        // Fetch TAF data if enabled
        const showTaf = localStorage.getItem("showTaf") === "true";
        if (showTaf) {
            const taf = await fetchTaf(icao);
            weatherContent += `<h3>TAF for ${icao}</h3>`;
            if (taf) {
                weatherContent += `<pre>${taf}</pre>`;
            } else {
                weatherContent += `<p>No TAF data available.</p>`;
            }
        }

        // Update the weather box
        weatherBox.innerHTML = weatherContent;
    }

    // Function to handle search box input
    function handleSearch() {
        const searchValue = searchBox.value.trim().toUpperCase();
        if (searchValue && /^[A-Z]{4}$/.test(searchValue)) {
            updateData(searchValue); // Fetch data for the entered ICAO
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
                const selectedIcao = dropdown.value || searchBox.value.trim().toUpperCase();
                if (selectedIcao && /^[A-Z]{4}$/.test(selectedIcao)) {
                    updateData(selectedIcao); // Refresh the METAR and TAF data
                }
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
    if (toggleModeBtn) {
        toggleModeBtn.addEventListener("click", toggleMode);
    }
    if (dropdown) {
        dropdown.addEventListener("change", (e) => {
            updateData(e.target.value); // Update data when dropdown selection changes
        });
    }
    if (searchBox) {
        searchBox.addEventListener("input", () => {
            const searchValue = searchBox.value.trim().toUpperCase();
            createDropdown(searchValue); // Filter dropdown options and update data
        });
        searchBox.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                handleSearch(); // Handle Enter key press
            }
        });
    }
    if (findButton) {
        findButton.addEventListener("click", handleSearch); // Handle Find button click
    }

    // Initialize
    if (dropdown) {
        createDropdown(); // Populate the dropdown with airports
        updateData(dropdown.value); // Load default selection (first airport in list)
    }
    loadDarkModePreference(); // Load dark mode preference
    startAutoRefresh(); // Start auto-refresh

    // Listen for changes to auto-refresh settings
    window.addEventListener("storage", (event) => {
        if (event.key === "autoRefresh" || event.key === "showTaf") {
            restartAutoRefresh(); // Restart auto-refresh with the new interval
        }
    });
});
