/**
 * FocusTempo — main entry point.
 * Wires together all modules and binds events.
 */

import { TimerCore } from "./src/timer-core.js";
import { SessionManager } from "./src/session-manager.js";
import { UIController } from "./src/ui-controller.js";
import { ThemeManager } from "./src/theme.js";
import { SoundManager } from "./src/sound.js";

/* ---------- Instances ---------- */

const timer = new TimerCore();
const session = new SessionManager();
const ui = new UIController();
const theme = new ThemeManager();
const sound = new SoundManager();

/* ---------- Initialise display ---------- */

function initDisplay() {
    const dur = session.getCurrentDuration();
    timer.setDuration(dur);
    ui.updateTimer(dur, dur);
    ui.setSessionLabel(session.currentType);
    ui.setSessionCount(session.sessionsCompleted);
    ui.populateSettings(session.settings);
    ui.updateThemeIcon(theme.isDark());
    ui.renderHistory(session.getHistory());
    ui.setIdleState();
    sound.setSoundType(session.settings.soundType);
}

/* ---------- Timer callbacks ---------- */

timer.onTick = (remaining, duration) => {
    ui.updateTimer(remaining, duration);
};

timer.onComplete = () => {
    sound.play();
    ui.setPausedState();

    const timerSection = document.querySelector(".timer-section");
    timerSection.classList.add("pulse");
    setTimeout(() => timerSection.classList.remove("pulse"), 600);

    session.completeSession();
    ui.setSessionCount(session.sessionsCompleted);
    ui.setSessionLabel(session.currentType);
    ui.renderHistory(session.getHistory());

    const dur = session.getCurrentDuration();
    timer.setDuration(dur);
    ui.updateTimer(dur, dur);
    ui.setIdleState();

    if (session.settings.autoStartNext) {
        setTimeout(() => {
            timer.start();
            ui.setRunningState();
        }, 800);
    }
};

/* ---------- Button handlers ---------- */

ui.startBtn.addEventListener("click", () => {
    if (!timer.isRunning && timer.remaining === 0) {
        const dur = session.getCurrentDuration();
        timer.setDuration(dur);
        ui.updateTimer(dur, dur);
    }
    timer.start();
    ui.setRunningState();
});

ui.pauseBtn.addEventListener("click", () => {
    timer.pause();
    ui.setPausedState();
});

ui.resetBtn.addEventListener("click", () => {
    timer.reset();
    session.resetCycle();
    ui.setSessionLabel(session.currentType);
    const dur = session.getCurrentDuration();
    timer.setDuration(dur);
    ui.updateTimer(dur, dur);
    ui.setIdleState();
});

/* ---------- Settings ---------- */

ui.settingsToggle.addEventListener("click", () => ui.openSettings());
ui.closeSettingsBtn.addEventListener("click", () => {
    const newSettings = ui.readSettings();
    session.updateSettings(newSettings);
    sound.setSoundType(newSettings.soundType);

    if (!timer.isRunning) {
        session.resetCycle();
        const dur = session.getCurrentDuration();
        timer.setDuration(dur);
        ui.updateTimer(dur, dur);
        ui.setSessionLabel(session.currentType);
    }

    ui.closeSettings();
});
ui.settingsOverlay.addEventListener("click", () => {
    ui.closeSettingsBtn.click();
});

ui.bindSliderPreview(ui.workDurationInput, ui.workDurationValue);
ui.bindSliderPreview(ui.shortBreakInput, ui.shortBreakValue);
ui.bindSliderPreview(ui.longBreakInput, ui.longBreakValue);
ui.bindSliderPreview(ui.longBreakIntervalInput, ui.longBreakIntervalValue);

ui.testSoundBtn.addEventListener("click", () => {
    sound.setSoundType(ui.soundSelect.value);
    sound.play();
});

/* ---------- Theme ---------- */

ui.themeToggle.addEventListener("click", () => {
    theme.toggle();
    ui.updateThemeIcon(theme.isDark());
});

/* ---------- Boot ---------- */

initDisplay();
