/* ============================================
   TimeSnap — script.js
   Modular stopwatch application
   Modules: TimerCore, LapsManager, Storage,
            UIController, KeyboardHandler
   ============================================ */

(() => {
    "use strict";

    // ─── Module 1: TimerCore ──────────────────────────────────────────
    // Accurate elapsed-time tracking using performance.now() to avoid drift.
    const TimerCore = (() => {
        let running = false;
        let startTimestamp = 0; // performance.now() when timer (re)started
        let accumulated = 0; // ms accumulated before latest pause
        let rafId = null;
        let onTick = null; // callback(elapsedMs)

        function elapsed() {
            if (running) {
                return accumulated + (performance.now() - startTimestamp);
            }
            return accumulated;
        }

        function tick() {
            if (!running) return;
            if (onTick) onTick(elapsed());
            rafId = requestAnimationFrame(tick);
        }

        function start(cb) {
            if (running) return;
            onTick = cb || onTick;
            running = true;
            startTimestamp = performance.now();
            rafId = requestAnimationFrame(tick);
        }

        function pause() {
            if (!running) return;
            running = false;
            accumulated += performance.now() - startTimestamp;
            cancelAnimationFrame(rafId);
            rafId = null;
        }

        function resume(cb) {
            start(cb);
        }

        function reset() {
            running = false;
            accumulated = 0;
            startTimestamp = 0;
            cancelAnimationFrame(rafId);
            rafId = null;
        }

        function isRunning() {
            return running;
        }
        function getAccumulated() {
            return accumulated;
        }

        // Restore from persisted state
        function restore(acc, wasRunning, savedPerfOrigin) {
            accumulated = acc;
            if (wasRunning) {
                // Compensate time elapsed since page was saved
                running = false; // will call start() explicitly
            }
        }

        return {
            start,
            pause,
            resume,
            reset,
            elapsed,
            isRunning,
            getAccumulated,
            restore,
        };
    })();

    // ─── Module 2: LapsManager ───────────────────────────────────────
    // Manages lap entries: add, remove, analyze best/worst.
    const LapsManager = (() => {
        let laps = []; // { id, lapTime, totalTime }
        let nextId = 1;

        function add(totalElapsed) {
            const prevTotal =
                laps.length > 0 ? laps[laps.length - 1].totalTime : 0;
            const lapTime = totalElapsed - prevTotal;
            const lap = { id: nextId++, lapTime, totalTime: totalElapsed };
            laps.push(lap);
            return lap;
        }

        function remove(id) {
            const idx = laps.findIndex((l) => l.id === id);
            if (idx === -1) return;
            // Recalculate subsequent lap times
            laps.splice(idx, 1);
            for (let i = idx; i < laps.length; i++) {
                const prevTotal = i > 0 ? laps[i - 1].totalTime : 0;
                laps[i].lapTime = laps[i].totalTime - prevTotal;
            }
        }

        function getAll() {
            return [...laps];
        }

        function clear() {
            laps = [];
            nextId = 1;
        }

        function analyze() {
            if (laps.length < 2) return { bestId: null, worstId: null };
            let bestId = laps[0].id,
                worstId = laps[0].id;
            let best = laps[0].lapTime,
                worst = laps[0].lapTime;
            for (const l of laps) {
                if (l.lapTime < best) {
                    best = l.lapTime;
                    bestId = l.id;
                }
                if (l.lapTime > worst) {
                    worst = l.lapTime;
                    worstId = l.id;
                }
            }
            return { bestId, worstId };
        }

        function restore(savedLaps) {
            laps = savedLaps || [];
            nextId =
                laps.length > 0 ? Math.max(...laps.map((l) => l.id)) + 1 : 1;
        }

        return { add, remove, getAll, clear, analyze, restore };
    })();

    // ─── Module 3: Storage ────────────────────────────────────────────
    // Persists stopwatch state to localStorage.
    const Storage = (() => {
        const KEY = "timesnap_state";

        function save(timerCore, lapsManager) {
            const state = {
                accumulated: timerCore.elapsed(),
                wasRunning: timerCore.isRunning(),
                laps: lapsManager.getAll(),
                savedAt: Date.now(),
            };
            try {
                localStorage.setItem(KEY, JSON.stringify(state));
            } catch {
                /* quota exceeded — silently fail */
            }
        }

        function load() {
            try {
                const raw = localStorage.getItem(KEY);
                if (!raw) return null;
                return JSON.parse(raw);
            } catch {
                return null;
            }
        }

        function clear() {
            try {
                localStorage.removeItem(KEY);
            } catch {
                /* ignore */
            }
        }

        // Theme
        const THEME_KEY = "timesnap_theme";

        function saveTheme(theme) {
            try {
                localStorage.setItem(THEME_KEY, theme);
            } catch {
                /* ignore */
            }
        }

        function loadTheme() {
            try {
                return localStorage.getItem(THEME_KEY);
            } catch {
                return null;
            }
        }

        return { save, load, clear, saveTheme, loadTheme };
    })();

    // ─── Module 4: UIController ───────────────────────────────────────
    // Manages DOM updates: display, buttons, laps list, theme.
    const UIController = (() => {
        // Cached DOM elements
        const $ = (sel) => document.querySelector(sel);
        const timeDisplay = $("#time-display");
        const btnStart = $("#btn-start");
        const btnPause = $("#btn-pause");
        const btnResume = $("#btn-resume");
        const btnLap = $("#btn-lap");
        const btnReset = $("#btn-reset");
        const lapsList = $("#laps-list");
        const lapsHeader = $("#laps-header");
        const themeToggle = $("#theme-toggle");

        function formatTime(ms) {
            const totalSec = Math.floor(ms / 1000);
            const hours = Math.floor(totalSec / 3600);
            const minutes = Math.floor((totalSec % 3600) / 60);
            const seconds = totalSec % 60;
            const centis = Math.floor((ms % 1000) / 10);

            const mm = String(minutes).padStart(2, "0");
            const ss = String(seconds).padStart(2, "0");
            const cs = String(centis).padStart(2, "0");

            if (hours > 0) {
                const hh = String(hours).padStart(2, "0");
                return `${hh}:${mm}:${ss}.${cs}`;
            }
            return `${mm}:${ss}.${cs}`;
        }

        function updateDisplay(ms) {
            timeDisplay.textContent = formatTime(ms);
        }

        function showState(state) {
            // state: "idle" | "running" | "paused"
            btnStart.classList.toggle("hidden", state !== "idle");
            btnPause.classList.toggle("hidden", state !== "running");
            btnResume.classList.toggle("hidden", state !== "paused");
            btnLap.disabled = state !== "running";
            btnReset.disabled = state === "idle";
        }

        function renderLaps(laps) {
            const { bestId, worstId } = LapsManager.analyze();
            const showHeader = laps.length > 0;
            lapsHeader.classList.toggle("visible", showHeader);

            lapsList.innerHTML = "";
            // Render in reverse order (newest first)
            for (let i = laps.length - 1; i >= 0; i--) {
                const l = laps[i];
                const li = document.createElement("li");
                li.className = "lap-item";
                if (laps.length >= 2) {
                    if (l.id === bestId) li.classList.add("lap-item--best");
                    if (l.id === worstId) li.classList.add("lap-item--worst");
                }
                li.dataset.id = l.id;
                li.innerHTML = `
          <span class="lap-item__num">${l.id}</span>
          <span class="lap-item__time">${formatTime(l.lapTime)}</span>
          <span class="lap-item__total">${formatTime(l.totalTime)}</span>
          <button class="lap-item__delete" type="button" aria-label="Delete lap ${l.id}" data-delete="${l.id}">&times;</button>
        `;
                lapsList.appendChild(li);
            }
        }

        function initTheme() {
            const saved = Storage.loadTheme();
            const prefersDark = window.matchMedia(
                "(prefers-color-scheme: dark)",
            ).matches;
            const theme = saved || (prefersDark ? "dark" : "light");
            document.documentElement.setAttribute("data-theme", theme);
        }

        function toggleTheme() {
            const current = document.documentElement.getAttribute("data-theme");
            const next = current === "dark" ? "light" : "dark";
            document.documentElement.setAttribute("data-theme", next);
            Storage.saveTheme(next);
        }

        function getElements() {
            return {
                btnStart,
                btnPause,
                btnResume,
                btnLap,
                btnReset,
                lapsList,
                themeToggle,
            };
        }

        return {
            updateDisplay,
            showState,
            renderLaps,
            initTheme,
            toggleTheme,
            getElements,
            formatTime,
        };
    })();

    // ─── Module 5: KeyboardHandler ────────────────────────────────────
    // Maps keyboard shortcuts to actions.
    const KeyboardHandler = (() => {
        let handlers = {};

        function bind(keyMap) {
            handlers = keyMap;
            document.addEventListener("keydown", onKeyDown);
        }

        function onKeyDown(e) {
            // Ignore if user is typing in an input field
            if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")
                return;

            const key = e.key.toLowerCase();
            if (key === " ") e.preventDefault(); // prevent page scroll on space

            if (handlers[key]) {
                handlers[key]();
            }
        }

        function unbind() {
            document.removeEventListener("keydown", onKeyDown);
        }

        return { bind, unbind };
    })();

    // ─── Application Init ─────────────────────────────────────────────
    let appState = "idle"; // "idle" | "running" | "paused"

    function setState(s) {
        appState = s;
        UIController.showState(s);
        persistState();
    }

    function persistState() {
        Storage.save(TimerCore, LapsManager);
    }

    function onTick(ms) {
        UIController.updateDisplay(ms);
    }

    // --- Actions ---
    function doStart() {
        if (appState !== "idle") return;
        TimerCore.start(onTick);
        setState("running");
    }

    function doPause() {
        if (appState !== "running") return;
        TimerCore.pause();
        UIController.updateDisplay(TimerCore.elapsed());
        setState("paused");
    }

    function doResume() {
        if (appState !== "paused") return;
        TimerCore.resume(onTick);
        setState("running");
    }

    function doToggle() {
        if (appState === "idle") doStart();
        else if (appState === "running") doPause();
        else if (appState === "paused") doResume();
    }

    function doLap() {
        if (appState !== "running") return;
        const totalMs = TimerCore.elapsed();
        LapsManager.add(totalMs);
        UIController.renderLaps(LapsManager.getAll());
        persistState();
    }

    function doReset() {
        if (appState === "idle") return;
        TimerCore.reset();
        LapsManager.clear();
        UIController.updateDisplay(0);
        UIController.renderLaps([]);
        setState("idle");
        Storage.clear();
    }

    function doDeleteLap(id) {
        LapsManager.remove(id);
        UIController.renderLaps(LapsManager.getAll());
        persistState();
    }

    // --- Wire up UI events ---
    const els = UIController.getElements();

    els.btnStart.addEventListener("click", doStart);
    els.btnPause.addEventListener("click", doPause);
    els.btnResume.addEventListener("click", doResume);
    els.btnLap.addEventListener("click", doLap);
    els.btnReset.addEventListener("click", doReset);
    els.themeToggle.addEventListener("click", UIController.toggleTheme);

    // Lap deletion via event delegation
    els.lapsList.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-delete]");
        if (!btn) return;
        const id = parseInt(btn.dataset.delete, 10);
        if (!isNaN(id)) doDeleteLap(id);
    });

    // --- Keyboard shortcuts ---
    KeyboardHandler.bind({
        " ": doToggle, // Space = start / pause / resume
        l: doLap, // L = lap
        r: doReset, // R = reset
    });

    // --- Theme ---
    UIController.initTheme();

    // --- Restore persisted state ---
    (function restoreState() {
        const saved = Storage.load();
        if (!saved) return;

        LapsManager.restore(saved.laps);

        if (saved.accumulated > 0) {
            const timeSinceSave = Date.now() - saved.savedAt;

            if (saved.wasRunning) {
                // Timer was running when page closed — add elapsed real time
                const totalAccumulated = saved.accumulated + timeSinceSave;
                TimerCore.restore(totalAccumulated, false);
                TimerCore.start(onTick);
                appState = "running";
            } else {
                TimerCore.restore(saved.accumulated, false);
                appState = "paused";
            }

            UIController.updateDisplay(TimerCore.elapsed());
            UIController.showState(appState);
            UIController.renderLaps(LapsManager.getAll());
        }
    })();

    // --- Persist before page unload ---
    window.addEventListener("beforeunload", persistState);

    // --- Periodical save (every 2 seconds as fallback) ---
    setInterval(persistState, 2000);
})();
