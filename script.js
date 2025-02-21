document.addEventListener("DOMContentLoaded", () => {
    const dropdown = document.getElementById("airport-dropdown");
    const searchBox = document.getElementById("search-box");
    const findButton = document.getElementById("find-button");
    const airportTitle = document.getElementById("airport-title");
    const airportInfoBox = document.getElementById("airport-info");
    const weatherBox = document.getElementById("weather");
    const toggleModeBtn = document.getElementById("toggle-mode");

    const airports = [
        "EFET", "EFHA", "EFHK", "EFIV", "EFJO", "EFJY", "EFKE", "EFKI",
        "EFKK", "EFKS", "EFKT", "EFKU", "EFLP", "EFMA", "EFMI", "EFOU",
        "EFPO", "EFRO", "EFSA", "EFSI", "EFTP", "EFTU", "EFUT", "EFVA"
    ].sort(); // Sort alphabetically

    let autoRefreshInterval;

    // Function to toggle dark/light mode
    function toggleMode() {
        document.body.classList.toggle("dark-mode");
        const isDarkMode = document.body.classList.contains("dark-mode");
        toggleModeBtn.textContent = isDarkMode ? "☀️ Light Mode" : "🌙 Dark Mode";
        localStorage.setItem("theme", isDarkMode ? "dark" : "light");
    }

    // Function to load dark mode preference
    function loadDarkModePreference() {
        const isDarkMode = localStorage.getItem("theme") === "dark";
        if (isDarkMode) {
            document.body.classList.add("dark-mode");
            toggleModeBtn.textContent = "☀️ Light Mode";
        } else {
            document.body.classList.remove("dark-mode");
            toggleModeBtn.textContent = "🌙 Dark Mode";
        }
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
            updateData(filteredAirports[0]); // Update weather and airport info
        }
    }

    // Function to fetch airport info
    async function fetchAirportInfo(icao) {
        const url = `/airport/${icao}`;
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error("Error fetching airport data");
            const data = await response.text();
            console.log("Airport Info:", data); // Debugging
            airportInfoBox.innerHTML = `<h3>Airport Info</h3><pre>${data}</pre>`;
        } catch (error) {
            console.error("Error loading airport info:", error);
            airportInfoBox.innerHTML = `<h3>Airport Info</h3><p>Error loading airport data.</p>`;
        }
    }

    // Function to fetch weather data
    async function fetchWeather(icao) {
        const url = `/weather/${icao}`;
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error("Error fetching weather data");
            const data = await response.text();
            console.log("METAR Data:", data); // Debugging
            weatherBox.innerHTML = `<h3>METAR (& TAF)</h3><pre>${data}</pre>`;
        } catch (error) {
            console.error("Error loading weather data:", error);
            weatherBox.innerHTML = `<h3>METAR (& TAF)</h3><p>Error loading weather data.</p>`;
        }
    }

    // Function to update data based on selected airport
    function updateData(icao) {
        airportTitle.textContent = `Weather for ${icao}`;
        fetchAirportInfo(icao);
        fetchWeather(icao);
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
                    updateData(selectedIcao); // Refresh the METAR data
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
        if (event.key === "autoRefresh") {
            restartAutoRefresh(); // Restart auto-refresh with the new interval
        }
    });
});