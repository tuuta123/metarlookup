document.addEventListener("DOMContentLoaded", () => {
    const efinList = document.getElementById("efin-list");
    const refreshButton = document.getElementById("refresh-efin");

    // Function to fetch flight plans from VATSIM API with retry mechanism
    async function fetchFlightPlans(retryCount = 0) {
        const url = "https://data.vatsim.net/v3/vatsim-data.json";
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error("Error fetching flight plans");
            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Error loading flight plans:", error);
            if (retryCount < 3) {
                console.log(`Retrying in 5 seconds... (Attempt ${retryCount + 1})`);
                await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
                return fetchFlightPlans(retryCount + 1); // Retry
            } else {
                console.error("Max retries reached. Unable to fetch flight plans.");
                return null;
            }
        }
    }

    // Function to fetch METAR data for a specific airport
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

    // Function to display METARs for airports with flight plans in the EFIN sector
    async function displayEfinMetars() {
        // Clear the list before fetching new data
        efinList.innerHTML = "<p>Loading METARs...</p>";

        const data = await fetchFlightPlans();
        if (!data) {
            efinList.innerHTML = "<p>Error loading flight plans. Please try again later.</p>";
            return;
        }

        // Extract unique departure and arrival airports in the EFIN sector
        const airports = new Set();
        data.pilots.forEach(pilot => {
            const departure = pilot.flight_plan?.departure;
            const arrival = pilot.flight_plan?.arrival;

            // Check if the flight plan is within the EFIN sector
            if (departure && departure.startsWith("EF")) {
                airports.add(departure);
            }
            if (arrival && arrival.startsWith("EF")) {
                airports.add(arrival);
            }
        });

        // Clear the list again before appending new METARs
        efinList.innerHTML = "";

        // Fetch and display METARs for each airport
        const metarPromises = Array.from(airports).map(async (icao) => {
            const metar = await fetchMetar(icao);
            if (metar) {
                const metarBox = document.createElement("div");
                metarBox.className = "metar-box compact";
                metarBox.innerHTML = `
                    <h3>${icao}</h3>
                    <pre>${metar}</pre>
                    <button class="pop-out-button" data-icao="${icao}" data-metar="${metar}">Pop Out</button>
                `;
                return metarBox;
            }
            return null;
        });

        // Wait for all METARs to be fetched and append them to the list
        const metarBoxes = await Promise.all(metarPromises);
        metarBoxes.forEach(box => {
            if (box) efinList.appendChild(box);
        });

        // Add event listeners to "Pop Out" buttons
        document.querySelectorAll(".pop-out-button").forEach(button => {
            button.addEventListener("click", () => {
                const icao = button.getAttribute("data-icao");
                const metar = button.getAttribute("data-metar");
                openMetarWindow(icao, metar);
            });
        });

        // If no METARs are found, display a message
        if (efinList.children.length === 0) {
            efinList.innerHTML = "<p>No METARs found for EFIN sector airports.</p>";
        }
    }

    // Function to open a METAR in a new window
    function openMetarWindow(icao, metar) {
        const width = 400;
        const height = 300;
        const left = (window.innerWidth - width) / 2;
        const top = (window.innerHeight - height) / 2;

        const popupWindow = window.open(
            "",
            `${icao} METAR`,
            `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=no`
        );

        if (popupWindow) {
            const isDarkMode = document.body.classList.contains("dark-mode");
            popupWindow.document.write(`
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>${icao} METAR</title>
                    <style>
                        body, html {
                            margin: 0;
                            padding: 0;
                            height: 100%;
                            overflow: hidden;
                            font-family: Arial, sans-serif;
                            background-color: ${isDarkMode ? "#121212" : "#f4f4f4"};
                            color: ${isDarkMode ? "#e0e0e0" : "#333"};
                        }
                        .container {
                            display: flex;
                            flex-direction: column;
                            justify-content: center;
                            align-items: center;
                            height: 100%;
                            padding: 20px;
                            box-sizing: border-box;
                        }
                        h2 {
                            margin: 0 0 10px 0;
                            font-size: 24px;
                        }
                        pre {
                            white-space: pre-wrap;
                            font-family: monospace;
                            text-align: center;
                            margin: 0;
                            padding: 10px;
                            background-color: ${isDarkMode ? "#1e1e1e" : "#fff"};
                            border-radius: 5px;
                            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                            max-width: 100%;
                            overflow: hidden;
                        }
                        .power-toys-info {
                            margin-top: 10px;
                            font-size: 12px;
                            color: ${isDarkMode ? "#8c9eff" : "#009ffd"};
                        }
                        .hide-button {
                            margin-top: 10px;
                            background: ${isDarkMode ? "#8c9eff" : "#009ffd"};
                            border: none;
                            padding: 5px 10px;
                            border-radius: 5px;
                            color: white;
                            cursor: pointer;
                            font-weight: bold;
                            font-size: 12px;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h2>${icao} METAR</h2>
                        <pre>${metar}</pre>
                        <div class="power-toys-info" id="power-toys-info">
                            If you have Microsoft PowerToys installed, you can keep this window on top by pressing <strong>Win+Ctrl+T</strong>.
                        </div>
                        <button class="hide-button" id="hide-button">Hide</button>
                    </div>
                    <script>
                        // Hide the PowerToys info and button when clicked
                        document.getElementById("hide-button").addEventListener("click", () => {
                            document.getElementById("power-toys-info").style.display = "none";
                            document.getElementById("hide-button").style.display = "none";
                        });

                        // Auto-refresh the METAR every 90 seconds
                        setInterval(async () => {
                            const response = await fetch(\`https://metar.vatsim.net/metar.php?id=${icao}\`);
                            if (response.ok) {
                                const metar = await response.text();
                                document.querySelector("pre").textContent = metar;
                            }
                        }, 90000);
                    </script>
                </body>
                </html>
            `);
            popupWindow.document.close();
        } else {
            alert("Popup blocked. Please allow popups for this site.");
        }
    }

    // Event listeners
    if (refreshButton) {
        refreshButton.addEventListener("click", displayEfinMetars);
    }

    // Initialize
    displayEfinMetars(); // Load METARs on page load

    // Automatically refresh every 30 seconds
    setInterval(displayEfinMetars, 30000);
});