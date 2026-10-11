/**
 * Utility helpers for FocusTempo.
 */

export function formatTime(totalSeconds) {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

export function formatDate(isoString) {
    const d = new Date(isoString);
    return d.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export function getSessionLabel(type) {
    switch (type) {
        case "work":
            return "Work";
        case "shortBreak":
            return "Short Break";
        case "longBreak":
            return "Long Break";
        default:
            return "Work";
    }
}
