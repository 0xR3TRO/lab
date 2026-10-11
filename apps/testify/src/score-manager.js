/**
 * score-manager.js — Score tracking and high score persistence
 */
const HIGH_SCORE_KEY = "testify-highscores";

let currentScore = 0;

export function resetScore() {
    currentScore = 0;
}

export function addPoint() {
    currentScore++;
}

export function getScore() {
    return currentScore;
}

export function getHighScores() {
    try {
        const data = localStorage.getItem(HIGH_SCORE_KEY);
        return data ? JSON.parse(data) : {};
    } catch {
        return {};
    }
}

export function saveHighScore(category, score, total) {
    const scores = getHighScores();
    const key = category;
    const entry = {
        score,
        total,
        percentage: Math.round((score / total) * 100),
        date: new Date().toISOString(),
    };

    if (!scores[key] || entry.percentage > scores[key].percentage) {
        scores[key] = entry;
        localStorage.setItem(HIGH_SCORE_KEY, JSON.stringify(scores));
        return true; // new high score
    }
    return false;
}

export function getHighScore(category) {
    const scores = getHighScores();
    return scores[category] || null;
}
