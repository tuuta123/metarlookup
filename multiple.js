document.addEventListener("DOMContentLoaded", () => {
    const metarInput = document.getElementById("metar-input");
    const addMetarButton = document.getElementById("add-metar");
    const clearAllButton = document.getElementById("clear-all");
    const metarList = document.getElementById("metar-list");

    // Function to fetch and display weather data for a given ICAO code
    async function fetchAndDisplayWeather(icao) {
        // Example: Use Open-Meteo API for weather data
        const url = `https://api.open-meteo.com/v1/forecast?latitude=60.17&longitude=24.94&current_weather=true`;
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const data = await response.json();

            // Check if a weather box for this ICAO already exists
            let weatherBox = Array.from(document.querySelectorAll(".weather-box h3"))
                .find(h3 => h3.textContent === icao)?.parentElement;

            if (!weatherBox) {
                // Create a new weather box if it doesn't exist
                weatherBox = document.createElement("div");
                weatherBox.className = "weather-box";
                weatherBox.innerHTML = `
                    <h3>${icao}</h3>
                    <pre>${JSON.stringify(data, null, 2)}</pre>
                    <button class="remove-weather">Remove</button>
                `;
                metarList.appendChild(weatherBox);

                // Add event listener to the remove button
                weatherBox.querySelector(".remove-weather").addEventListener("click", () => {
                    weatherBox.remove();
                });
            } else {
                // Update the existing weather box
                weatherBox.querySelector("pre").textContent = JSON.stringify(data, null, 2);
            }
        } catch (error) {
            // Display a user-friendly error message
            const errorBox = document.createElement("div");
            errorBox.className = "error-box";
            errorBox.innerHTML = `<p>Error: Could not fetch weather data for ${icao}. Please check the ICAO code and try again.</p>`;
            metarList.appendChild(errorBox);
            setTimeout(() => errorBox.remove(), 5000); // Remove error message after 5 seconds
            console.error("Error loading weather data:", error);
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
});
