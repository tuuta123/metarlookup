document.addEventListener("DOMContentLoaded", () => {
    const dropdown = document.getElementById("airport-dropdown");
    const searchBox = document.getElementById("search-box");
    const findButton = document.getElementById("find-button");
    const airportTitle = document.getElementById("airport-title");
    const weatherBox = document.getElementById("weather");
    const toggleModeBtn = document.getElementById("toggle-mode");

    // Dropdown List
    const airports = [
        "EFET", "EFHA", "EFHK", "EFIV", "EFJO", "EFJY", "EFKE", "EFKI",
        "EFKK", "EFKS", "EFKT", "EFKU", "EFLP", "EFMA", "EFMI", "EFOU",
        "EFPO", "EFRO", "EFSA", "EFSI", "EFTP", "EFTU", "EFUT", "EFVA"
    ].sort();

    let autoRefreshInterval;

    // Toggle Dark Mode
    function toggleMode() {
        const isDarkMode = document.body.classList.toggle("dark-mode");
        localStorage.setItem("theme", isDarkMode ? "dark" : "light");
        location.reload(); // Refresh the page to apply the theme
    }

    // Dark/Light Mode Button
    function updateThemeButton(isDarkMode) {
        if (toggleModeBtn) {
            toggleModeBtn.textContent = isDarkMode ? "☀️ Light Mode" : "🌙 Dark Mode";
        }
    }

    // Load Dark Mode Preference
    function loadDarkModePreference() {
        const isDarkMode = localStorage.getItem("theme") === "dark";
        document.body.classList.toggle("dark-mode", isDarkMode);
        updateThemeButton(isDarkMode);
    }

    // Dropdown
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

    async function updateData(icao) {
        airportTitle.textContent = `Weather for ${icao}`;

        // Fetch METAR
        const metar = await fetchMetar(icao);
        let weatherContent = `<h3>METAR for ${icao}</h3>`;
        if (metar) {
            weatherContent += `<pre>${metar}</pre>`;
        } else {
            weatherContent += `<p>No METAR data available.</p>`;
        }

        // Fetch TAF if able
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

        weatherBox.innerHTML = weatherContent;
    }

    // Handle Search
    function handleSearch() {
        const searchValue = searchBox.value.trim().toUpperCase();
        if (searchValue && /^[A-Z]{4}$/.test(searchValue)) {
            updateData(searchValue); // Fetch data for the entered ICAO
        } else {
            alert("Please enter a valid ICAO code (4 letters).");
        }
    }
    
    // Get URL query parameter
    function getQueryParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }

    // Event Listeners
    if (toggleModeBtn) {
        toggleModeBtn.addEventListener("click", toggleMode);
    }
    if (dropdown) {
        dropdown.addEventListener("change", (e) => {
            updateData(e.target.value);
        });
    }
    if (searchBox) {
        searchBox.addEventListener("input", () => {
            const searchValue = searchBox.value.trim().toUpperCase();
            createDropdown(searchValue);
        });
        searchBox.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                handleSearch();
            }
        });
    }
    if (findButton) {
        findButton.addEventListener("click", handleSearch);
    }

    // Initialize
    if (dropdown) {
        createDropdown();
        const selectedIcao = getQueryParam("icao");
        if (selectedIcao) {
            dropdown.value = selectedIcao;
            updateData(selectedIcao);
        } else {
            updateData(dropdown.value);
        }
    }
    loadDarkModePreference();
});