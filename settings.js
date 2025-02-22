document.addEventListener("DOMContentLoaded", () => {
    const autoRefreshSelect = document.getElementById("auto-refresh");
    const themeSelect = document.getElementById("theme");
    const showTafSelect = document.getElementById("show-taf");
    const saveSettingsButton = document.getElementById("save-settings");
    const toggleModeBtn = document.getElementById("toggle-mode");

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

    // Load saved settings
    function loadSettings() {
        const autoRefresh = localStorage.getItem("autoRefresh") || "300000";
        const theme = localStorage.getItem("theme") || "light";
        const showTaf = localStorage.getItem("showTaf") || "false";

        autoRefreshSelect.value = autoRefresh;
        themeSelect.value = theme;
        showTafSelect.value = showTaf;

        // Apply theme
        if (theme === "dark") {
            document.body.classList.add("dark-mode");
            updateThemeButton(true); // Update the button text immediately
        } else {
            document.body.classList.remove("dark-mode");
            updateThemeButton(false); // Update the button text immediately
        }
    }

    // Save settings
    function saveSettings() {
        localStorage.setItem("autoRefresh", autoRefreshSelect.value);
        localStorage.setItem("theme", themeSelect.value);
        localStorage.setItem("showTaf", showTafSelect.value);
        alert("Settings saved!");
        location.reload(); // Refresh the page to apply the settings
    }

    // Event listeners
    if (toggleModeBtn) {
        toggleModeBtn.addEventListener("click", toggleMode);
    }
    if (themeSelect) {
        themeSelect.addEventListener("change", (e) => {
            const isDarkMode = e.target.value === "dark";
            document.body.classList.toggle("dark-mode", isDarkMode);
            updateThemeButton(isDarkMode);
            localStorage.setItem("theme", isDarkMode ? "dark" : "light");
        });
    }
    if (saveSettingsButton) {
        saveSettingsButton.addEventListener("click", saveSettings);
    }

    // Load settings when the page loads
    loadSettings();
});
