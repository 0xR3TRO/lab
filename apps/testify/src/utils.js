/**
 * utils.js — Helper functions: shuffle, format, random
 */
export function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

export function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
}

export function getPercentage(score, total) {
    if (total === 0) return 0;
    return Math.round((score / total) * 100);
}

export function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}
