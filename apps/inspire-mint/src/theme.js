/**
 * theme.js — Light/dark theme toggle with localStorage persistence
 */

const STORAGE_KEY = "inspiremint-theme";

export function initTheme() {
    const saved = localStorage.getItem(STORAGE_KEY);
    const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
    ).matches;
    const theme = saved || (prefersDark ? "dark" : "light");
    applyTheme(theme);
}

export function toggleTheme() {
    const current = document.documentElement.getAttribute("data-theme");
    const next = current === "dark" ? "light" : "dark";
    applyTheme(next);
    return next;
}

function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_KEY, theme);

    const icon = document.querySelector("#theme-toggle .theme-icon");
    if (icon) {
        icon.textContent = theme === "dark" ? "☀️" : "🌙";
    }
}
