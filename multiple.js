document.addEventListener("DOMContentLoaded", () => {
    const metarInput = document.getElementById("metar-input");
    const addMetarButton = document.getElementById("add-metar");
    const clearAllButton = document.getElementById("clear-all");
    const metarList = document.getElementById("metar-list");

    let autoRefreshInterval;

    // Function to fetch and display METAR data
    async function fetchAndDisplayMetar(icao) {
        const url = `https://cors-anywhere.herokuapp.com/https://aviationweather.gov/api/data/metar?ids=${icao}`;
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const data = await response.text();

            // Check if a METAR box for this ICAO already exists
            let metarBox = Array.from(document.querySelectorAll(".metar-box h3"))
                .find(h3 => h3.textContent === icao)?.parentElement;

            if (!metarBox) {
                // Create a new METAR box if it doesn't exist
                metarBox = document.createElement("div");
                metarBox.className = "metar-box";
                metarBox.innerHTML = `
                    <h3>${icao}</h3>
                    <pre>${data}</pre>
                    <button class="remove-metar">Remove</button>
                `;
                metarList.appendChild(metarBox);

                // Add event listener to the remove button
                metarBox.querySelector(".remove-metar").addEventListener("click", () => {
                    metarBox.remove();
                });
            } else {
                // Update the existing METAR box
                metarBox.querySelector("pre").textContent = data;
            }
        } catch (error) {
            // Display a user-friendly error message
            const errorBox = document.createElement("div");
            errorBox.className = "error-box";
            errorBox.innerHTML = `<p>Error: Could not fetch METAR for ${icao}. Please check the ICAO code and try again.</p>`;
            metarList.appendChild(errorBox);
            setTimeout(() => errorBox.remove(), 5000); // Remove error message after 5 seconds
            console.error("Error loading METAR:", error);
        }
    }

    // Function to handle adding a METAR
    function addMetar() {
        const icao = metarInput.value.trim().toUpperCase();
        if (icao && /^[A-Z]{4}$/.test(icao)) {
            fetchAndDisplayMetar(icao);
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
                const metarBoxes = document.querySelectorAll(".metar-box");
                metarBoxes.forEach(box => {
                    const icao = box.querySelector("h3").textContent;
                    fetchAndDisplayMetar(icao); // Refresh the METAR data
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
        addMetarButton.addEventListener("click", addMetar);
    }
    if (metarInput) {
        metarInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                addMetar(); // Call the addMetar function
            }
        });
    }
    if (clearAllButton) {
        clearAllButton.addEventListener("click", () => {
            metarList.innerHTML = ""; // Clear all METAR boxes
        });
    }

    // Start auto-refresh when the page loads
    startAutoRefresh();

    // Listen for changes to auto-refresh settings
    window.addEventListener("storage", (event) => {
        if (event.key === "autoRefresh") {
            restartAutoRefresh(); // Restart auto-refresh with the new interval
        }
    });
});
