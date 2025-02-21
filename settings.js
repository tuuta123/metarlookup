document.addEventListener("DOMContentLoaded", () => {
    const autoRefreshSelect = document.getElementById("auto-refresh");
    const themeSelect = document.getElementById("theme");
    const saveSettingsButton = document.getElementById("save-settings");
    const toggleModeBtn = document.getElementById("toggle-mode");

    // Function to toggle dark/light mode
    function toggleMode() {
        document.body.classList.toggle("dark-mode");
        const isDarkMode = document.body.classList.contains("dark-mode");
        toggleModeBtn.textContent = isDarkMode ? "☀️ Light Mode" : "🌙 Dark Mode";
        themeSelect.value = isDarkMode ? "dark" : "light"; // Sync dropdown
        localStorage.setItem("theme", isDarkMode ? "dark" : "light");
    }

    // Load saved settings
    function loadSettings() {
        const autoRefresh = localStorage.getItem("autoRefresh") || "300000";
        const theme = localStorage.getItem("theme") || "light";

        autoRefreshSelect.value = autoRefresh;
        themeSelect.value = theme;

        // Apply theme
        if (theme === "dark") {
            document.body.classList.add("dark-mode");
            toggleModeBtn.textContent = "☀️ Light Mode";
        } else {
            document.body.classList.remove("dark-mode");
            toggleModeBtn.textContent = "🌙 Dark Mode";
        }
    }

    // Save settings
    function saveSettings() {
        localStorage.setItem("autoRefresh", autoRefreshSelect.value);
        localStorage.setItem("theme", themeSelect.value);
        alert("Settings saved!");
    }

    // Event listeners
    if (toggleModeBtn) {
        toggleModeBtn.addEventListener("click", toggleMode);
    }
    if (themeSelect) {
        themeSelect.addEventListener("change", (e) => {
            const isDarkMode = e.target.value === "dark";
            document.body.classList.toggle("dark-mode", isDarkMode);
            toggleModeBtn.textContent = isDarkMode ? "☀️ Light Mode" : "🌙 Dark Mode";
            localStorage.setItem("theme", isDarkMode ? "dark" : "light");
        });
    }
    if (saveSettingsButton) {
        saveSettingsButton.addEventListener("click", saveSettings);
    }

    // Load settings when the page loads
    loadSettings();
});