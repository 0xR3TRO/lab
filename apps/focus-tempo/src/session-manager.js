/**
 * SessionManager — handles Pomodoro cycles, settings persistence, and history.
 */

const SETTINGS_KEY = "focustempo_settings";
const SESSIONS_KEY = "focustempo_sessions";
const HISTORY_KEY = "focustempo_history";

const DEFAULT_SETTINGS = {
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    longBreakInterval: 4,
    autoStartNext: false,
    soundType: "bell",
};

export class SessionManager {
    constructor() {
        this.settings = this._loadSettings();
        this.sessionsCompleted = this._loadSessionCount();
        this.currentType = "work";
        this.cycleCount = 0;
    }

    /* ---------- Settings ---------- */

    _loadSettings() {
        try {
            const saved = localStorage.getItem(SETTINGS_KEY);
            return saved
                ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) }
                : { ...DEFAULT_SETTINGS };
        } catch {
            return { ...DEFAULT_SETTINGS };
        }
    }

    saveSettings() {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings));
    }

    updateSettings(partial) {
        Object.assign(this.settings, partial);
        this.saveSettings();
    }

    /* ---------- Session counter ---------- */

    _loadSessionCount() {
        try {
            const val = localStorage.getItem(SESSIONS_KEY);
            return val ? Number(JSON.parse(val)) : 0;
        } catch {
            return 0;
        }
    }

    _saveSessionCount() {
        localStorage.setItem(
            SESSIONS_KEY,
            JSON.stringify(this.sessionsCompleted),
        );
    }

    /* ---------- Durations ---------- */

    getCurrentDuration() {
        switch (this.currentType) {
            case "work":
                return this.settings.workDuration * 60;
            case "shortBreak":
                return this.settings.shortBreakDuration * 60;
            case "longBreak":
                return this.settings.longBreakDuration * 60;
            default:
                return this.settings.workDuration * 60;
        }
    }

    /* ---------- Cycle logic ---------- */

    completeSession() {
        this.addHistoryEntry(this.currentType, this.getCurrentDuration());

        if (this.currentType === "work") {
            this.sessionsCompleted++;
            this.cycleCount++;
            this._saveSessionCount();

            if (this.cycleCount >= this.settings.longBreakInterval) {
                this.currentType = "longBreak";
                this.cycleCount = 0;
            } else {
                this.currentType = "shortBreak";
            }
        } else {
            this.currentType = "work";
        }
        return this.currentType;
    }

    resetCycle() {
        this.currentType = "work";
        this.cycleCount = 0;
    }

    /* ---------- History ---------- */

    getHistory() {
        try {
            const data = localStorage.getItem(HISTORY_KEY);
            return data ? JSON.parse(data) : [];
        } catch {
            return [];
        }
    }

    addHistoryEntry(type, durationSeconds) {
        const history = this.getHistory();
        history.unshift({
            type,
            duration: durationSeconds,
            completedAt: new Date().toISOString(),
        });
        if (history.length > 50) history.length = 50;
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    }

    clearHistory() {
        localStorage.removeItem(HISTORY_KEY);
    }
}
