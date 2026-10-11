/**
 * script.js — Entry point: initializes theme and UI
 */
import { initTheme, toggleTheme } from "./src/theme.js";
import { init } from "./src/ui-controller.js";

document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    init();

    document
        .getElementById("theme-toggle")
        .addEventListener("click", toggleTheme);
});
