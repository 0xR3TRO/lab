/**
 * UIController — manages all DOM updates, animations, and event binding.
 */

import { formatTime, formatDate, getSessionLabel } from "./utils.js";

const CIRCUMFERENCE = 2 * Math.PI * 90; // r=90 in the SVG

export class UIController {
    constructor() {
        /* Timer display */
        this.timerDisplay = document.getElementById("timerDisplay");
        this.sessionLabel = document.getElementById("sessionLabel");
        this.progressRing = document.getElementById("progressRing");
        this.sessionCount = document.getElementById("sessionCount");

        /* Buttons */
        this.startBtn = document.getElementById("startBtn");
        this.pauseBtn = document.getElementById("pauseBtn");
        this.resetBtn = document.getElementById("resetBtn");

        /* Settings */
        this.settingsToggle = document.getElementById("settingsToggle");
        this.settingsPanel = document.getElementById("settingsPanel");
        this.settingsOverlay = document.getElementById("settingsOverlay");
        this.closeSettingsBtn = document.getElementById("closeSettings");

        this.workDurationInput = document.getElementById("workDuration");
        this.shortBreakInput = document.getElementById("shortBreak");
        this.longBreakInput = document.getElementById("longBreak");
        this.longBreakIntervalInput =
            document.getElementById("longBreakInterval");
        this.autoStartInput = document.getElementById("autoStart");
        this.soundSelect = document.getElementById("soundSelect");
        this.testSoundBtn = document.getElementById("testSound");

        this.workDurationValue = document.getElementById("workDurationValue");
        this.shortBreakValue = document.getElementById("shortBreakValue");
        this.longBreakValue = document.getElementById("longBreakValue");
        this.longBreakIntervalValue = document.getElementById(
            "longBreakIntervalValue",
        );

        /* Theme */
        this.themeToggle = document.getElementById("themeToggle");

        /* History */
        this.historyList = document.getElementById("historyList");

        /* Init progress ring */
        this.progressRing.style.strokeDasharray = CIRCUMFERENCE;
        this.progressRing.style.strokeDashoffset = "0";
    }

    /* ---------- Timer display ---------- */

    updateTimer(remaining, duration) {
        this.timerDisplay.textContent = formatTime(remaining);
        const progress = duration > 0 ? (duration - remaining) / duration : 0;
        this.progressRing.style.strokeDashoffset = (
            progress * CIRCUMFERENCE
        ).toString();
    }

    setSessionLabel(type) {
        this.sessionLabel.textContent = getSessionLabel(type);
        this.sessionLabel.className = "session-label session-label--" + type;
    }

    setSessionCount(count) {
        this.sessionCount.textContent = count;
    }

    /* ---------- Button states ---------- */

    setRunningState() {
        this.startBtn.disabled = true;
        this.pauseBtn.disabled = false;
        this.startBtn.classList.add("hidden");
        this.pauseBtn.classList.remove("hidden");
    }

    setPausedState() {
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        this.startBtn.classList.remove("hidden");
        this.pauseBtn.classList.add("hidden");
    }

    setIdleState() {
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        this.startBtn.classList.remove("hidden");
        this.pauseBtn.classList.add("hidden");
    }

    /* ---------- Settings panel ---------- */

    openSettings() {
        this.settingsPanel.classList.add("open");
    }

    closeSettings() {
        this.settingsPanel.classList.remove("open");
    }

    populateSettings(settings) {
        this.workDurationInput.value = settings.workDuration;
        this.shortBreakInput.value = settings.shortBreakDuration;
        this.longBreakInput.value = settings.longBreakDuration;
        this.longBreakIntervalInput.value = settings.longBreakInterval;
        this.autoStartInput.checked = settings.autoStartNext;
        this.soundSelect.value = settings.soundType;

        this.workDurationValue.textContent = settings.workDuration;
        this.shortBreakValue.textContent = settings.shortBreakDuration;
        this.longBreakValue.textContent = settings.longBreakDuration;
        this.longBreakIntervalValue.textContent = settings.longBreakInterval;
    }

    readSettings() {
        return {
            workDuration: Number(this.workDurationInput.value),
            shortBreakDuration: Number(this.shortBreakInput.value),
            longBreakDuration: Number(this.longBreakInput.value),
            longBreakInterval: Number(this.longBreakIntervalInput.value),
            autoStartNext: this.autoStartInput.checked,
            soundType: this.soundSelect.value,
        };
    }

    /* ---------- Theme ---------- */

    updateThemeIcon(isDark) {
        this.themeToggle.textContent = isDark ? "☀️" : "🌙";
    }

    /* ---------- History ---------- */

    renderHistory(entries) {
        if (!entries.length) {
            this.historyList.innerHTML =
                '<p class="history-empty">No sessions completed yet.</p>';
            return;
        }
        this.historyList.innerHTML = entries
            .map(
                (e) =>
                    `<div class="history-item">
            <span class="history-type history-type--${e.type}">${getSessionLabel(e.type)}</span>
            <span class="history-duration">${Math.round(e.duration / 60)} min</span>
            <span class="history-date">${formatDate(e.completedAt)}</span>
          </div>`,
            )
            .join("");
    }

    /* ---------- Event binding ---------- */

    bindSliderPreview(input, display) {
        input.addEventListener("input", () => {
            display.textContent = input.value;
        });
    }
}
