/**
 * ThemeManager — light/dark mode toggle persisted in localStorage.
 */

const THEME_KEY = "focustempo_theme";

export class ThemeManager {
    constructor() {
        this.current = this._load();
        this._apply();
    }

    _load() {
        try {
            return localStorage.getItem(THEME_KEY) || "light";
        } catch {
            return "light";
        }
    }

    _save() {
        localStorage.setItem(THEME_KEY, this.current);
    }

    _apply() {
        document.documentElement.setAttribute("data-theme", this.current);
    }

    toggle() {
        this.current = this.current === "light" ? "dark" : "light";
        this._apply();
        this._save();
    }

    isDark() {
        return this.current === "dark";
    }
}
