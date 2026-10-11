/* ========================================================
   Chromify PRO — script.js
   Full-featured color palette generator (no backend)
   ======================================================== */

(function () {
    "use strict";

    // ─── Constants ──────────────────────────────────────────
    const PALETTE_SIZE = 5;
    const LS_KEY_PALETTES = "chromify_palettes";
    const LS_KEY_HISTORY = "chromify_history";
    const LS_KEY_THEME = "chromify_theme";
    const MAX_HISTORY = 50;

    // ─── DOM References ─────────────────────────────────────
    const $ = (sel, ctx = document) => ctx.querySelector(sel);
    const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
    const paletteContainer = $("#palette-container");
    const toastEl = $("#toast");

    // ─── State ──────────────────────────────────────────────
    let palette = []; // [{hex, locked}]
    let history = loadJSON(LS_KEY_HISTORY) || [];
    let gradientStops = [
        { color: "#6366f1", position: 0 },
        { color: "#a78bfa", position: 100 },
    ];

    // ════════════════════════════════════════════════════════
    //  UTILITIES
    // ════════════════════════════════════════════════════════

    function randomHex() {
        return (
            "#" +
            Array.from(
                { length: 6 },
                () => "0123456789abcdef"[Math.floor(Math.random() * 16)],
            ).join("")
        );
    }

    function hexToRgb(hex) {
        const h = hex.replace("#", "");
        return {
            r: parseInt(h.substring(0, 2), 16),
            g: parseInt(h.substring(2, 4), 16),
            b: parseInt(h.substring(4, 6), 16),
        };
    }

    function rgbToHex(r, g, b) {
        return (
            "#" +
            [r, g, b]
                .map((v) =>
                    Math.max(0, Math.min(255, Math.round(v)))
                        .toString(16)
                        .padStart(2, "0"),
                )
                .join("")
        );
    }

    function hexToHsl(hex) {
        const { r, g, b } = hexToRgb(hex);
        const rr = r / 255,
            gg = g / 255,
            bb = b / 255;
        const max = Math.max(rr, gg, bb),
            min = Math.min(rr, gg, bb);
        let h = 0,
            s = 0,
            l = (max + min) / 2;
        if (max !== min) {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case rr:
                    h = ((gg - bb) / d + (gg < bb ? 6 : 0)) / 6;
                    break;
                case gg:
                    h = ((bb - rr) / d + 2) / 6;
                    break;
                case bb:
                    h = ((rr - gg) / d + 4) / 6;
                    break;
            }
        }
        return {
            h: Math.round(h * 360),
            s: Math.round(s * 100),
            l: Math.round(l * 100),
        };
    }

    function hslToHex(h, s, l) {
        h = ((h % 360) + 360) % 360;
        s = Math.max(0, Math.min(100, s)) / 100;
        l = Math.max(0, Math.min(100, l)) / 100;
        const a = s * Math.min(l, 1 - l);
        const f = (n) => {
            const k = (n + h / 30) % 12;
            return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        };
        return rgbToHex(
            Math.round(f(0) * 255),
            Math.round(f(8) * 255),
            Math.round(f(4) * 255),
        );
    }

    function formatRgb({ r, g, b }) {
        return `rgb(${r}, ${g}, ${b})`;
    }
    function formatHsl({ h, s, l }) {
        return `hsl(${h}, ${s}%, ${l}%)`;
    }

    function relativeLuminance(hex) {
        const { r, g, b } = hexToRgb(hex);
        const [rs, gs, bs] = [r, g, b].map((c) => {
            c /= 255;
            return c <= 0.03928
                ? c / 12.92
                : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    }

    function contrastRatio(hex1, hex2) {
        const l1 = relativeLuminance(hex1);
        const l2 = relativeLuminance(hex2);
        const lighter = Math.max(l1, l2);
        const darker = Math.min(l1, l2);
        return (lighter + 0.05) / (darker + 0.05);
    }

    function textColorForBg(hex) {
        return relativeLuminance(hex) > 0.179 ? "#1a1a1f" : "#f4f4f5";
    }

    function saveJSON(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (_) {
            /* quota */
        }
    }

    function loadJSON(key) {
        try {
            return JSON.parse(localStorage.getItem(key));
        } catch (_) {
            return null;
        }
    }

    function showToast(msg) {
        toastEl.textContent = msg;
        toastEl.classList.add("show");
        clearTimeout(toastEl._t);
        toastEl._t = setTimeout(() => toastEl.classList.remove("show"), 2000);
    }

    // ════════════════════════════════════════════════════════
    //  PALETTE GENERATION
    // ════════════════════════════════════════════════════════

    function generatePalette() {
        palette = palette.length
            ? palette.map((c) =>
                  c.locked ? c : { hex: randomHex(), locked: false },
              )
            : Array.from({ length: PALETTE_SIZE }, () => ({
                  hex: randomHex(),
                  locked: false,
              }));
        pushHistory();
        renderPalette();
    }

    function renderPalette() {
        paletteContainer.innerHTML = "";
        palette.forEach((c, i) => {
            const col = document.createElement("div");
            col.className = "color-col" + (c.locked ? " locked" : "");
            col.style.background = c.hex;
            const txtColor = textColorForBg(c.hex);
            col.style.color = txtColor;

            const rgb = hexToRgb(c.hex);
            const hsl = hexToHsl(c.hex);

            col.innerHTML = `
        <span class="color-col__hex">${c.hex}</span>
        <div class="color-col__formats">
          <button class="color-col__format-btn" data-copy="${formatRgb(rgb)}">${formatRgb(rgb)}</button>
          <button class="color-col__format-btn" data-copy="${formatHsl(hsl)}">${formatHsl(hsl)}</button>
        </div>
        <div class="color-col__actions">
          <button class="color-col__action ${c.locked ? "active" : ""}" data-action="lock" data-index="${i}" title="${c.locked ? "Unlock" : "Lock"}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              ${
                  c.locked
                      ? '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>'
                      : '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/>'
              }
            </svg>
          </button>
          <button class="color-col__action" data-action="copy" data-hex="${c.hex}" title="Copy HEX">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
          </button>
        </div>
      `;

            // Click column to copy hex
            col.addEventListener("click", (e) => {
                if (
                    e.target.closest(".color-col__action") ||
                    e.target.closest(".color-col__format-btn")
                )
                    return;
                copyText(c.hex);
            });

            paletteContainer.appendChild(col);
        });

        // Delegate actions
        paletteContainer
            .querySelectorAll('[data-action="lock"]')
            .forEach((btn) =>
                btn.addEventListener("click", () => {
                    const idx = +btn.dataset.index;
                    palette[idx].locked = !palette[idx].locked;
                    renderPalette();
                }),
            );
        paletteContainer
            .querySelectorAll('[data-action="copy"]')
            .forEach((btn) =>
                btn.addEventListener("click", () => copyText(btn.dataset.hex)),
            );
        paletteContainer
            .querySelectorAll(".color-col__format-btn")
            .forEach((btn) =>
                btn.addEventListener("click", () => copyText(btn.dataset.copy)),
            );
    }

    async function copyText(text) {
        try {
            await navigator.clipboard.writeText(text);
            showToast(`Copied: ${text}`);
        } catch {
            showToast("Copy failed – try again");
        }
    }

    // ════════════════════════════════════════════════════════
    //  HISTORY
    // ════════════════════════════════════════════════════════

    function pushHistory() {
        const hexes = palette.map((c) => c.hex);
        history.unshift(hexes);
        if (history.length > MAX_HISTORY) history.pop();
        saveJSON(LS_KEY_HISTORY, history);
    }

    function renderHistory() {
        const list = $("#history-list");
        list.innerHTML = "";
        if (!history.length) {
            list.innerHTML =
                '<p style="color:var(--text-muted);font-size:.85rem;">No history yet.</p>';
            return;
        }
        history.forEach((hexes, i) => {
            const card = document.createElement("div");
            card.className = "history-card";
            card.title = "Click to load palette";
            hexes.forEach((h) => {
                const sw = document.createElement("div");
                sw.className = "history-card__swatch";
                sw.style.background = h;
                card.appendChild(sw);
            });
            card.addEventListener("click", () => {
                palette = hexes.map((h) => ({ hex: h, locked: false }));
                renderPalette();
                toggleSidebar("sidebar-history", false);
                showToast("Palette loaded from history");
            });
            list.appendChild(card);
        });
    }

    // ════════════════════════════════════════════════════════
    //  SAVE / IMPORT / EXPORT
    // ════════════════════════════════════════════════════════

    function savePalette() {
        const saved = loadJSON(LS_KEY_PALETTES) || [];
        saved.push(palette.map((c) => c.hex));
        saveJSON(LS_KEY_PALETTES, saved);
        showToast("Palette saved!");
    }

    function exportPalette() {
        const data = {
            palette: palette.map((c) => c.hex),
            savedPalettes: loadJSON(LS_KEY_PALETTES) || [],
            exportedAt: new Date().toISOString(),
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "chromify-palette.json";
        a.click();
        URL.revokeObjectURL(url);
        showToast("Palette exported as JSON");
    }

    function importPalette(file) {
        const reader = new FileReader();
        reader.onload = () => {
            try {
                const data = JSON.parse(reader.result);
                if (Array.isArray(data.palette) && data.palette.length) {
                    const hexRegex = /^#[0-9a-fA-F]{6}$/;
                    const validHexes = data.palette.filter((h) =>
                        hexRegex.test(h),
                    );
                    if (validHexes.length === 0) {
                        showToast("No valid colors found");
                        return;
                    }
                    palette = validHexes.map((h) => ({
                        hex: h,
                        locked: false,
                    }));
                    renderPalette();
                    showToast("Palette imported!");
                } else {
                    showToast("Invalid palette file");
                }
            } catch {
                showToast("Invalid JSON file");
            }
        };
        reader.readAsText(file);
    }

    // ════════════════════════════════════════════════════════
    //  THEME TOGGLE
    // ════════════════════════════════════════════════════════

    function initTheme() {
        const saved = localStorage.getItem(LS_KEY_THEME);
        if (saved) document.documentElement.dataset.theme = saved;
    }

    function toggleTheme() {
        const current = document.documentElement.dataset.theme;
        const next = current === "dark" ? "light" : "dark";
        document.documentElement.dataset.theme = next;
        localStorage.setItem(LS_KEY_THEME, next);
    }

    // ════════════════════════════════════════════════════════
    //  SIDEBAR / MODAL HELPERS
    // ════════════════════════════════════════════════════════

    function toggleSidebar(id, force) {
        const el = document.getElementById(id);
        if (!el) return;
        const open =
            force !== undefined ? force : !el.classList.contains("open");
        el.classList.toggle("open", open);
    }

    function toggleModal(id, force) {
        const el = document.getElementById(id);
        if (!el) return;
        const open =
            force !== undefined ? force : !el.classList.contains("open");
        el.classList.toggle("open", open);
    }

    // Close buttons
    document.addEventListener("click", (e) => {
        const closeBtn = e.target.closest("[data-close]");
        if (closeBtn) {
            const target = closeBtn.dataset.close;
            toggleSidebar(target, false);
            toggleModal(target, false);
        }
    });

    // ════════════════════════════════════════════════════════
    //  AI HARMONY SUGGESTIONS
    // ════════════════════════════════════════════════════════

    function generateHarmony(baseHex, type) {
        const { h, s, l } = hexToHsl(baseHex);
        const colors = [];
        switch (type) {
            case "analogous":
                [-30, -15, 0, 15, 30].forEach((offset) =>
                    colors.push(hslToHex(h + offset, s, l)),
                );
                break;
            case "complementary":
                colors.push(hslToHex(h, s, l));
                colors.push(
                    hslToHex(h, Math.max(s - 15, 20), Math.min(l + 15, 85)),
                );
                colors.push(hslToHex(h + 180, s, l));
                colors.push(
                    hslToHex(
                        h + 180,
                        Math.max(s - 15, 20),
                        Math.min(l + 15, 85),
                    ),
                );
                colors.push(hslToHex(h + 180, s, Math.max(l - 15, 15)));
                break;
            case "split-complementary":
                colors.push(hslToHex(h, s, l));
                colors.push(hslToHex(h + 150, s, l));
                colors.push(hslToHex(h + 210, s, l));
                colors.push(hslToHex(h, s, Math.min(l + 20, 90)));
                colors.push(hslToHex(h + 180, s, Math.max(l - 20, 10)));
                break;
            case "triadic":
                [0, 120, 240].forEach((offset) =>
                    colors.push(hslToHex(h + offset, s, l)),
                );
                colors.push(hslToHex(h + 60, s, Math.min(l + 20, 90)));
                colors.push(hslToHex(h + 300, s, Math.max(l - 20, 10)));
                break;
            case "tetradic":
                [0, 90, 180, 270].forEach((offset) =>
                    colors.push(hslToHex(h + offset, s, l)),
                );
                colors.push(hslToHex(h + 45, s, l));
                break;
            case "monochromatic":
                [20, 35, 50, 65, 80].forEach((lightness) =>
                    colors.push(hslToHex(h, s, lightness)),
                );
                break;
        }
        return colors.slice(0, PALETTE_SIZE);
    }

    function renderHarmonyPreview(colors) {
        const preview = $("#harmony-preview");
        preview.innerHTML = "";
        colors.forEach((hex) => {
            const sw = document.createElement("div");
            sw.className = "harmony-preview__swatch";
            sw.style.background = hex;
            sw.style.color = textColorForBg(hex);
            sw.textContent = hex;
            preview.appendChild(sw);
        });
    }

    // ════════════════════════════════════════════════════════
    //  GRADIENT GENERATOR
    // ════════════════════════════════════════════════════════

    function renderGradientEditor() {
        const stopsContainer = $("#gradient-stops");
        stopsContainer.innerHTML = "";
        gradientStops.forEach((stop, i) => {
            const row = document.createElement("div");
            row.className = "gradient-stop";
            row.innerHTML = `
        <input type="color" value="${stop.color}" data-stop-idx="${i}" data-field="color" />
        <input type="range" min="0" max="100" value="${stop.position}" data-stop-idx="${i}" data-field="position" />
        <span class="stop-pct">${stop.position}%</span>
        ${gradientStops.length > 2 ? `<button data-remove-stop="${i}" title="Remove">&times;</button>` : ""}
      `;
            stopsContainer.appendChild(row);
        });
        updateGradientPreview();
    }

    function updateGradientPreview() {
        const type = $("#gradient-type").value;
        const angle = $("#gradient-angle").value;
        $("#gradient-angle-val").textContent = angle + "°";
        const sorted = [...gradientStops].sort(
            (a, b) => a.position - b.position,
        );
        const stopsCSS = sorted
            .map((s) => `${s.color} ${s.position}%`)
            .join(", ");
        let css;
        if (type === "linear") {
            css = `linear-gradient(${angle}deg, ${stopsCSS})`;
        } else {
            css = `radial-gradient(circle, ${stopsCSS})`;
        }
        $("#gradient-preview").style.background = css;
        $("#gradient-css").textContent = `background: ${css};`;
    }

    // ════════════════════════════════════════════════════════
    //  WCAG CONTRAST CHECKER
    // ════════════════════════════════════════════════════════

    function updateContrastChecker() {
        const fg = $("#contrast-fg").value;
        const bg = $("#contrast-bg").value;
        const ratio = contrastRatio(fg, bg);
        const ratioFixed = ratio.toFixed(2);

        const aaLarge = ratio >= 3;
        const aaNormal = ratio >= 4.5;
        const aaaLarge = ratio >= 4.5;
        const aaaNormal = ratio >= 7;

        const badge = (pass) =>
            `<span class="badge ${pass ? "badge--pass" : "badge--fail"}">${pass ? "PASS" : "FAIL"}</span>`;

        $("#contrast-result").innerHTML = `
      <div class="ratio">${ratioFixed}:1</div>
      <div style="margin-top:.75rem;display:grid;grid-template-columns:1fr 1fr;gap:.5rem;font-size:.85rem;">
        <div>AA Normal ${badge(aaNormal)}</div>
        <div>AA Large ${badge(aaLarge)}</div>
        <div>AAA Normal ${badge(aaaNormal)}</div>
        <div>AAA Large ${badge(aaaLarge)}</div>
      </div>
    `;

        const box = $("#contrast-preview-box");
        box.style.background = bg;
        box.style.color = fg;
    }

    // ════════════════════════════════════════════════════════
    //  IMPROVE PALETTE
    // ════════════════════════════════════════════════════════

    function improvePalette() {
        // Heuristic: adjust colors so adjacent colors have better contrast
        // and overall palette has better distribution
        let improved = palette.map((c) => ({ ...c }));

        // Step 1: Maximize hue distribution
        const hues = improved.map((c) => hexToHsl(c.hex));
        const avgSat = hues.reduce((sum, h) => sum + h.s, 0) / hues.length;
        const avgLight = hues.reduce((sum, h) => sum + h.l, 0) / hues.length;

        improved.forEach((c, i) => {
            if (c.locked) return;
            const hsl = hexToHsl(c.hex);

            // Spread lightness more evenly
            const targetL = 20 + (60 / (PALETTE_SIZE - 1)) * i;
            const newL = Math.round(hsl.l * 0.6 + targetL * 0.4);

            // Boost saturation if too low
            const newS = Math.max(hsl.s, Math.min(avgSat + 10, 85));

            c.hex = hslToHex(hsl.h, newS, newL);
        });

        // Step 2: Check adjacent contrast and adjust
        for (let i = 0; i < improved.length - 1; i++) {
            const ratio = contrastRatio(improved[i].hex, improved[i + 1].hex);
            if (ratio < 1.5 && !improved[i + 1].locked) {
                const hsl = hexToHsl(improved[i + 1].hex);
                improved[i + 1].hex = hslToHex(
                    hsl.h,
                    hsl.s,
                    hsl.l > 50 ? hsl.l + 15 : hsl.l - 15,
                );
            }
        }

        palette = improved;
        pushHistory();
        renderPalette();
        showToast("Palette improved!");
    }

    // ════════════════════════════════════════════════════════
    //  EVENT BINDINGS
    // ════════════════════════════════════════════════════════

    function init() {
        initTheme();
        generatePalette();

        // Toolbar buttons
        $("#btn-generate").addEventListener("click", generatePalette);
        $("#btn-theme").addEventListener("click", toggleTheme);
        $("#btn-save").addEventListener("click", savePalette);
        $("#btn-export").addEventListener("click", exportPalette);
        $("#btn-import").addEventListener("click", () =>
            $("#import-input").click(),
        );
        $("#import-input").addEventListener("change", (e) => {
            if (e.target.files[0]) importPalette(e.target.files[0]);
            e.target.value = "";
        });

        // History sidebar
        $("#btn-history").addEventListener("click", () => {
            renderHistory();
            toggleSidebar("sidebar-history");
        });
        $("#btn-clear-history").addEventListener("click", () => {
            history = [];
            saveJSON(LS_KEY_HISTORY, history);
            renderHistory();
            showToast("History cleared");
        });

        // AI Harmony modal
        $("#btn-harmony").addEventListener("click", () => {
            toggleModal("modal-harmony", true);
            const colors = generateHarmony(
                $("#harmony-base").value,
                $("#harmony-type").value,
            );
            renderHarmonyPreview(colors);
        });
        $("#harmony-base").addEventListener("input", () => {
            renderHarmonyPreview(
                generateHarmony(
                    $("#harmony-base").value,
                    $("#harmony-type").value,
                ),
            );
        });
        $("#harmony-type").addEventListener("change", () => {
            renderHarmonyPreview(
                generateHarmony(
                    $("#harmony-base").value,
                    $("#harmony-type").value,
                ),
            );
        });
        $("#btn-apply-harmony").addEventListener("click", () => {
            const colors = generateHarmony(
                $("#harmony-base").value,
                $("#harmony-type").value,
            );
            palette = colors.map((hex, i) => ({
                hex,
                locked: palette[i] ? palette[i].locked : false,
            }));
            pushHistory();
            renderPalette();
            toggleModal("modal-harmony", false);
            showToast("Harmony palette applied!");
        });

        // Gradient modal
        $("#btn-gradient").addEventListener("click", () => {
            // Seed stops from current palette
            if (palette.length >= 2) {
                gradientStops = [
                    { color: palette[0].hex, position: 0 },
                    { color: palette[palette.length - 1].hex, position: 100 },
                ];
            }
            toggleModal("modal-gradient", true);
            renderGradientEditor();
        });
        $("#gradient-type").addEventListener("change", updateGradientPreview);
        $("#gradient-angle").addEventListener("input", updateGradientPreview);
        $("#btn-add-stop").addEventListener("click", () => {
            const nextColor =
                palette[Math.min(gradientStops.length, palette.length - 1)]
                    ?.hex || randomHex();
            gradientStops.push({ color: nextColor, position: 50 });
            renderGradientEditor();
        });
        // Delegate stop inputs
        $("#gradient-stops").addEventListener("input", (e) => {
            const idx = +e.target.dataset.stopIdx;
            const field = e.target.dataset.field;
            if (field === "color") gradientStops[idx].color = e.target.value;
            if (field === "position") {
                gradientStops[idx].position = +e.target.value;
                e.target.nextElementSibling.textContent = e.target.value + "%";
            }
            updateGradientPreview();
        });
        $("#gradient-stops").addEventListener("click", (e) => {
            const removeBtn = e.target.closest("[data-remove-stop]");
            if (removeBtn) {
                gradientStops.splice(+removeBtn.dataset.removeStop, 1);
                renderGradientEditor();
            }
        });
        $("#btn-copy-gradient").addEventListener("click", () => {
            copyText($("#gradient-css").textContent);
        });

        // Contrast modal
        $("#btn-contrast").addEventListener("click", () => {
            // Pre-fill with first two palette colors
            if (palette.length >= 2) {
                $("#contrast-fg").value = palette[0].hex;
                $("#contrast-bg").value = palette[1].hex;
            }
            toggleModal("modal-contrast", true);
            updateContrastChecker();
        });
        $("#contrast-fg").addEventListener("input", updateContrastChecker);
        $("#contrast-bg").addEventListener("input", updateContrastChecker);

        // Improve palette
        $("#btn-improve-palette").addEventListener("click", () => {
            improvePalette();
            toggleModal("modal-contrast", false);
        });

        // Keyboard shortcuts
        document.addEventListener("keydown", (e) => {
            if (
                e.target.tagName === "INPUT" ||
                e.target.tagName === "SELECT" ||
                e.target.tagName === "TEXTAREA"
            )
                return;
            if (e.code === "Space") {
                e.preventDefault();
                generatePalette();
            }
        });
    }

    // ─── Boot ───────────────────────────────────────────────
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
