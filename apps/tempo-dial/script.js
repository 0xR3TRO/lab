/* ============================================================
   TempoDial — script.js
   Modular analog clock logic
   ============================================================ */

(function TempoDial() {
    "use strict";

    // ── Theme Data (embedded for offline use) ──────────────────
    const THEMES = {
        classic: {
            background: "#f5f0e8",
            dialFace: "#fffef9",
            dialBorder: "#8b7355",
            hourHand: "#2c2c2c",
            minuteHand: "#2c2c2c",
            secondHand: "#c0392b",
            centerDot: "#2c2c2c",
            hourMarkers: "#2c2c2c",
            minuteMarkers: "#999999",
            numbers: "#333333",
            shadow: "rgba(0,0,0,0.15)",
            accent: "#c0392b",
            digitalText: "#333333",
        },
        neon: {
            background: "#0a0a1a",
            dialFace: "#111128",
            dialBorder: "#00ffff",
            hourHand: "#ff00ff",
            minuteHand: "#00ffff",
            secondHand: "#ffff00",
            centerDot: "#ffffff",
            hourMarkers: "#00ffff",
            minuteMarkers: "#333366",
            numbers: "#00ffff",
            shadow: "rgba(0,255,255,0.2)",
            accent: "#ff00ff",
            digitalText: "#00ffff",
        },
        pastel: {
            background: "#fef6fb",
            dialFace: "#fff5fa",
            dialBorder: "#e8b4cb",
            hourHand: "#7c6c8a",
            minuteHand: "#a38cb4",
            secondHand: "#f4a6c9",
            centerDot: "#7c6c8a",
            hourMarkers: "#b8a0c8",
            minuteMarkers: "#e0d0e8",
            numbers: "#7c6c8a",
            shadow: "rgba(124,108,138,0.1)",
            accent: "#f4a6c9",
            digitalText: "#7c6c8a",
        },
        dark: {
            background: "#1a1a2e",
            dialFace: "#16213e",
            dialBorder: "#0f3460",
            hourHand: "#e0e0e0",
            minuteHand: "#cccccc",
            secondHand: "#e94560",
            centerDot: "#e0e0e0",
            hourMarkers: "#e0e0e0",
            minuteMarkers: "#3a3a5e",
            numbers: "#c0c0c0",
            shadow: "rgba(0,0,0,0.4)",
            accent: "#e94560",
            digitalText: "#e0e0e0",
        },
        minimal: {
            background: "#ffffff",
            dialFace: "#ffffff",
            dialBorder: "#e8e8e8",
            hourHand: "#222222",
            minuteHand: "#444444",
            secondHand: "#ff4444",
            centerDot: "#222222",
            hourMarkers: "#222222",
            minuteMarkers: "#dddddd",
            numbers: "#222222",
            shadow: "rgba(0,0,0,0.06)",
            accent: "#ff4444",
            digitalText: "#222222",
        },
    };

    const ROMAN = [
        "XII",
        "I",
        "II",
        "III",
        "IV",
        "V",
        "VI",
        "VII",
        "VIII",
        "IX",
        "X",
        "XI",
    ];

    // ── Helpers ────────────────────────────────────────────────
    const $ = (sel) => document.querySelector(sel);
    const pad = (n) => String(n).padStart(2, "0");

    function polarToCartesian(cx, cy, r, angleDeg) {
        const rad = ((angleDeg - 90) * Math.PI) / 180;
        return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
    }

    // ── Settings Module ────────────────────────────────────────
    const Settings = {
        STORAGE_KEY: "tempodial_settings",

        defaults: {
            theme: "classic",
            mode: "light",
            dialStyle: "indices",
            handStyle: "classic",
            showDigital: false,
            showSecondHand: true,
        },

        load() {
            try {
                const raw = localStorage.getItem(this.STORAGE_KEY);
                return raw
                    ? { ...this.defaults, ...JSON.parse(raw) }
                    : { ...this.defaults };
            } catch {
                return { ...this.defaults };
            }
        },

        save(settings) {
            try {
                localStorage.setItem(
                    this.STORAGE_KEY,
                    JSON.stringify(settings),
                );
            } catch {
                /* localStorage unavailable */
            }
        },
    };

    // ── Theme Module ───────────────────────────────────────────
    const ThemeEngine = {
        apply(themeId, mode) {
            const colors = THEMES[themeId];
            if (!colors) return;

            const root = document.documentElement;
            root.style.setProperty("--td-bg", colors.background);
            root.style.setProperty("--td-dial-face", colors.dialFace);
            root.style.setProperty("--td-dial-border", colors.dialBorder);
            root.style.setProperty("--td-hour-hand", colors.hourHand);
            root.style.setProperty("--td-minute-hand", colors.minuteHand);
            root.style.setProperty("--td-second-hand", colors.secondHand);
            root.style.setProperty("--td-center-dot", colors.centerDot);
            root.style.setProperty("--td-hour-markers", colors.hourMarkers);
            root.style.setProperty("--td-minute-markers", colors.minuteMarkers);
            root.style.setProperty("--td-numbers", colors.numbers);
            root.style.setProperty("--td-shadow", colors.shadow);
            root.style.setProperty("--td-accent", colors.accent);
            root.style.setProperty("--td-digital-text", colors.digitalText);

            document.body.setAttribute("data-theme", themeId);
            document.body.setAttribute("data-mode", mode);
        },
    };

    // ── Dial Generator ─────────────────────────────────────────
    const DialGenerator = {
        CX: 200,
        CY: 200,

        generate(style) {
            const g = $("#markers");
            g.innerHTML = "";

            switch (style) {
                case "numbers":
                    this._drawNumbers(g);
                    break;
                case "roman":
                    this._drawRoman(g);
                    break;
                case "none":
                    break;
                case "indices":
                default:
                    this._drawIndices(g);
                    break;
            }
        },

        _drawIndices(g) {
            for (let i = 0; i < 60; i++) {
                const isHour = i % 5 === 0;
                const angle = i * 6;
                const r1 = isHour ? 165 : 175;
                const r2 = 185;
                const p1 = polarToCartesian(this.CX, this.CY, r1, angle);
                const p2 = polarToCartesian(this.CX, this.CY, r2, angle);

                const line = document.createElementNS(
                    "http://www.w3.org/2000/svg",
                    "line",
                );
                line.setAttribute("x1", p1.x);
                line.setAttribute("y1", p1.y);
                line.setAttribute("x2", p2.x);
                line.setAttribute("y2", p2.y);
                line.setAttribute(
                    "class",
                    isHour ? "marker-hour" : "marker-minute",
                );
                g.appendChild(line);
            }
        },

        _drawNumbers(g) {
            for (let i = 1; i <= 12; i++) {
                const angle = i * 30;
                const p = polarToCartesian(this.CX, this.CY, 155, angle);
                const text = document.createElementNS(
                    "http://www.w3.org/2000/svg",
                    "text",
                );
                text.setAttribute("x", p.x);
                text.setAttribute("y", p.y);
                text.setAttribute("class", "marker-number");
                text.textContent = i;
                g.appendChild(text);
            }
            // small minute dots
            this._drawMinuteDots(g);
        },

        _drawRoman(g) {
            for (let i = 0; i < 12; i++) {
                const angle = i * 30;
                const p = polarToCartesian(this.CX, this.CY, 155, angle);
                const text = document.createElementNS(
                    "http://www.w3.org/2000/svg",
                    "text",
                );
                text.setAttribute("x", p.x);
                text.setAttribute("y", p.y);
                text.setAttribute("class", "marker-roman");
                text.textContent = ROMAN[i];
                g.appendChild(text);
            }
            this._drawMinuteDots(g);
        },

        _drawMinuteDots(g) {
            for (let i = 0; i < 60; i++) {
                if (i % 5 === 0) continue;
                const angle = i * 6;
                const p = polarToCartesian(this.CX, this.CY, 180, angle);
                const circle = document.createElementNS(
                    "http://www.w3.org/2000/svg",
                    "circle",
                );
                circle.setAttribute("cx", p.x);
                circle.setAttribute("cy", p.y);
                circle.setAttribute("r", "1.5");
                circle.setAttribute("class", "marker-minute");
                circle.setAttribute("fill", "currentColor");
                circle.style.color = "var(--td-minute-markers)";
                g.appendChild(circle);
            }
        },
    };

    // ── Clock Engine (time update) ─────────────────────────────
    const ClockEngine = {
        animationId: null,

        start() {
            const tick = () => {
                this.update();
                this.animationId = requestAnimationFrame(tick);
            };
            tick();
        },

        stop() {
            if (this.animationId) cancelAnimationFrame(this.animationId);
        },

        update() {
            const now = new Date();
            const h = now.getHours() % 12;
            const m = now.getMinutes();
            const s = now.getSeconds();
            const ms = now.getMilliseconds();

            // Smooth angles
            const secondAngle = (s + ms / 1000) * 6;
            const minuteAngle = (m + s / 60) * 6;
            const hourAngle = (h + m / 60 + s / 3600) * 30;

            const hourHand = $("#hourHand");
            const minuteHand = $("#minuteHand");
            const secondHand = $("#secondHand");

            if (hourHand) hourHand.style.transform = `rotate(${hourAngle}deg)`;
            if (minuteHand)
                minuteHand.style.transform = `rotate(${minuteAngle}deg)`;
            if (secondHand)
                secondHand.style.transform = `rotate(${secondAngle}deg)`;

            // Update digital display
            const digitalTime = $("#digitalTime");
            const digitalDate = $("#digitalDate");
            if (digitalTime) {
                digitalTime.textContent = `${pad(now.getHours())}:${pad(m)}:${pad(s)}`;
            }
            if (digitalDate) {
                digitalDate.textContent = now.toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                });
            }

            // Update ARIA
            const clock = $("#clock");
            if (clock) {
                clock.setAttribute(
                    "aria-label",
                    `Current time: ${pad(now.getHours())}:${pad(m)}:${pad(s)}`,
                );
            }
        },
    };

    // ── UI Controller ──────────────────────────────────────────
    const UI = {
        state: null,

        init() {
            this.state = Settings.load();
            this.bindEvents();
            this.applyAll();
            ClockEngine.start();
        },

        bindEvents() {
            // Theme selector
            const themeSelect = $("#themeSelect");
            if (themeSelect) {
                themeSelect.value = this.state.theme;
                themeSelect.addEventListener("change", (e) => {
                    this.state.theme = e.target.value;
                    // Auto-set mode based on theme category
                    const darkThemes = ["neon", "dark"];
                    this.state.mode = darkThemes.includes(this.state.theme)
                        ? "dark"
                        : "light";
                    this.applyAll();
                    this.saveState();
                });
            }

            // Mode toggle
            const modeToggle = $("#modeToggle");
            if (modeToggle) {
                modeToggle.addEventListener("click", () => {
                    this.state.mode =
                        this.state.mode === "light" ? "dark" : "light";
                    this.applyAll();
                    this.saveState();
                });
            }

            // Dial style
            const dialStyle = $("#dialStyle");
            if (dialStyle) {
                dialStyle.value = this.state.dialStyle;
                dialStyle.addEventListener("change", (e) => {
                    this.state.dialStyle = e.target.value;
                    DialGenerator.generate(this.state.dialStyle);
                    this.saveState();
                });
            }

            // Hand style
            const handStyle = $("#handStyle");
            if (handStyle) {
                handStyle.value = this.state.handStyle;
                handStyle.addEventListener("change", (e) => {
                    this.state.handStyle = e.target.value;
                    this.applyHandStyle();
                    this.saveState();
                });
            }

            // Digital toggle
            const digitalToggle = $("#digitalToggle");
            if (digitalToggle) {
                digitalToggle.addEventListener("click", () => {
                    this.state.showDigital = !this.state.showDigital;
                    this.applyDigitalDisplay();
                    this.saveState();
                });
            }

            // Second hand toggle
            const secondHandToggle = $("#secondHandToggle");
            if (secondHandToggle) {
                secondHandToggle.addEventListener("click", () => {
                    this.state.showSecondHand = !this.state.showSecondHand;
                    this.applySecondHand();
                    this.saveState();
                });
            }

            // Controls panel toggle
            const controlsToggle = $("#controlsToggle");
            const controlsBody = $("#controlsBody");
            if (controlsToggle && controlsBody) {
                controlsToggle.addEventListener("click", () => {
                    const collapsed =
                        controlsBody.classList.toggle("collapsed");
                    controlsToggle.setAttribute(
                        "aria-expanded",
                        String(!collapsed),
                    );
                });
            }

            // Keyboard shortcut: Escape to toggle controls
            document.addEventListener("keydown", (e) => {
                if (e.key === "Escape" && controlsBody) {
                    controlsBody.classList.toggle("collapsed");
                }
            });
        },

        applyAll() {
            ThemeEngine.apply(this.state.theme, this.state.mode);
            DialGenerator.generate(this.state.dialStyle);
            this.applyHandStyle();
            this.applyDigitalDisplay();
            this.applySecondHand();
            this.applyModeUI();
        },

        applyHandStyle() {
            const face = $("#clockFace");
            if (!face) return;
            face.classList.remove(
                "hands-classic",
                "hands-modern",
                "hands-slim",
                "hands-bold",
            );
            if (this.state.handStyle !== "classic") {
                face.classList.add(`hands-${this.state.handStyle}`);
            }
        },

        applyDigitalDisplay() {
            const display = $("#digitalDisplay");
            const label = $("#digitalLabel");
            const toggle = $("#digitalToggle");
            if (display) {
                display.hidden = !this.state.showDigital;
            }
            if (label) {
                label.textContent = this.state.showDigital ? "Hide" : "Show";
            }
            if (toggle) {
                toggle.classList.toggle("active", this.state.showDigital);
            }
        },

        applySecondHand() {
            const hand = $("#secondHand");
            const label = $("#secondHandLabel");
            const toggle = $("#secondHandToggle");
            if (hand) {
                hand.classList.toggle("hidden", !this.state.showSecondHand);
            }
            if (label) {
                label.textContent = this.state.showSecondHand ? "On" : "Off";
            }
            if (toggle) {
                toggle.classList.toggle("active", this.state.showSecondHand);
            }
        },

        applyModeUI() {
            const icon = $("#modeIcon");
            const label = $("#modeLabel");
            const toggle = $("#modeToggle");
            if (icon)
                icon.textContent = this.state.mode === "dark" ? "☀️" : "🌙";
            if (label)
                label.textContent =
                    this.state.mode === "dark" ? "Light" : "Dark";
            if (toggle)
                toggle.classList.toggle("active", this.state.mode === "dark");
        },

        saveState() {
            Settings.save(this.state);
        },
    };

    // ── Init ───────────────────────────────────────────────────
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => UI.init());
    } else {
        UI.init();
    }
})();
