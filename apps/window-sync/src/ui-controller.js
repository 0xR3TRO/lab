/**
 * WindowSync - UI Controller
 * Binds DOM elements to the SyncEngine, listens for user actions,
 * and updates the interface when shared state changes.
 */

import { shortId, throttle } from "./utils.js";

const PANELS = ["home", "settings", "data", "about"];

export class UIController {
    /**
     * @param {import('./sync-engine.js').SyncEngine} engine
     */
    constructor(engine) {
        this.engine = engine;
        this._flashTimeout = null;
    }

    /* ------------------------------------------------------------------ */
    /*  Initialization                                                     */
    /* ------------------------------------------------------------------ */

    /**
     * Bind all UI elements and set up event listeners.
     */
    init() {
        // Cache DOM references
        this.$sharedText = document.getElementById("shared-text");
        this.$counter = document.getElementById("counter-value");
        this.$counterInc = document.getElementById("counter-inc");
        this.$counterDec = document.getElementById("counter-dec");
        this.$themeToggle = document.getElementById("theme-toggle");
        this.$panelBtns = document.querySelectorAll("[data-panel]");
        this.$panels = document.querySelectorAll(".panel-content");
        this.$windowList = document.getElementById("window-list");
        this.$openWindow = document.getElementById("open-window");
        this.$windowId = document.getElementById("window-id");
        this.$windowCount = document.getElementById("window-count");
        this.$channelType = document.getElementById("channel-type");
        this.$lastUpdate = document.getElementById("last-update");
        this.$layoutBtns = document.querySelectorAll("[data-layout]");

        this._bindEvents();
        this._renderWindowInfo();
        this._applyState(this.engine.getState());
        this._renderWindowList();
    }

    /* ------------------------------------------------------------------ */
    /*  Event binding                                                      */
    /* ------------------------------------------------------------------ */

    _bindEvents() {
        // Shared text field
        this.$sharedText.addEventListener(
            "input",
            throttle(() => {
                this.engine.updateState({ sharedText: this.$sharedText.value });
            }, 80),
        );

        // Counter
        this.$counterInc.addEventListener("click", () => {
            const s = this.engine.getState();
            this.engine.updateState({ counter: s.counter + 1 });
        });
        this.$counterDec.addEventListener("click", () => {
            const s = this.engine.getState();
            this.engine.updateState({ counter: s.counter - 1 });
        });

        // Theme toggle
        this.$themeToggle.addEventListener("click", () => {
            const s = this.engine.getState();
            const next = s.theme === "light" ? "dark" : "light";
            this.engine.updateState({ theme: next });
        });

        // Panel switcher
        this.$panelBtns.forEach((btn) => {
            btn.addEventListener("click", () => {
                this.engine.updateState({ activePanel: btn.dataset.panel });
            });
        });

        // Layout switcher
        this.$layoutBtns.forEach((btn) => {
            btn.addEventListener("click", () => {
                this.engine.updateState({ layout: btn.dataset.layout });
            });
        });

        // Open new window
        this.$openWindow.addEventListener("click", () => {
            window.open(
                window.location.href,
                "_blank",
                "width=900,height=650,left=100,top=100",
            );
        });
    }

    /* ------------------------------------------------------------------ */
    /*  State -> UI                                                        */
    /* ------------------------------------------------------------------ */

    /**
     * Called by the SyncEngine whenever state changes.
     * @param {Object} state
     * @param {string[]} changedFields
     * @param {string} sourceWindowId
     */
    onStateChange(state, changedFields, sourceWindowId) {
        this._applyState(state, changedFields);
        this._flashSource(sourceWindowId);
    }

    /**
     * Called when the window list changes (join or leave).
     */
    onWindowListChange() {
        this._renderWindowList();
    }

    _applyState(state, changedFields = null) {
        // Shared text
        if (!changedFields || changedFields.includes("sharedText")) {
            if (document.activeElement !== this.$sharedText) {
                this.$sharedText.value = state.sharedText || "";
            }
        }

        // Counter
        if (!changedFields || changedFields.includes("counter")) {
            this.$counter.textContent = state.counter;
        }

        // Theme
        if (!changedFields || changedFields.includes("theme")) {
            document.documentElement.setAttribute("data-theme", state.theme);
            this.$themeToggle.textContent =
                state.theme === "light" ? "Dark Mode" : "Light Mode";
        }

        // Active panel
        if (!changedFields || changedFields.includes("activePanel")) {
            this._activatePanel(state.activePanel);
        }

        // Layout
        if (!changedFields || changedFields.includes("layout")) {
            document.documentElement.setAttribute(
                "data-layout",
                state.layout || "default",
            );
            this.$layoutBtns.forEach((btn) => {
                btn.classList.toggle(
                    "active",
                    btn.dataset.layout === state.layout,
                );
            });
        }
    }

    _activatePanel(panelId) {
        this.$panelBtns.forEach((btn) => {
            btn.classList.toggle("active", btn.dataset.panel === panelId);
        });
        this.$panels.forEach((panel) => {
            panel.classList.toggle("active", panel.id === "panel-" + panelId);
        });
    }

    /* ------------------------------------------------------------------ */
    /*  Window list                                                        */
    /* ------------------------------------------------------------------ */

    _renderWindowInfo() {
        this.$windowId.textContent = shortId(this.engine.windowId);
        this.$channelType.textContent = this.engine.usingBroadcastChannel
            ? "BroadcastChannel"
            : "localStorage";
    }

    _renderWindowList() {
        const wins = this.engine.getWindows();
        this.$windowCount.textContent = wins.length;

        this.$windowList.innerHTML = "";
        for (const win of wins) {
            const li = document.createElement("li");
            const isSelf = win.id === this.engine.windowId;
            li.className = "window-entry" + (isSelf ? " self" : "");
            li.setAttribute("data-window-id", win.id);
            li.innerHTML =
                `<span class="window-dot"></span>` +
                `<span class="window-label">${shortId(win.id)}${isSelf ? " (you)" : ""}</span>`;
            this.$windowList.appendChild(li);
        }
    }

    /* ------------------------------------------------------------------ */
    /*  Visual feedback                                                    */
    /* ------------------------------------------------------------------ */

    _flashSource(sourceWindowId) {
        // Highlight the source window in the list
        const entries = this.$windowList.querySelectorAll(".window-entry");
        entries.forEach((el) => el.classList.remove("flash"));

        if (sourceWindowId && sourceWindowId !== this.engine.windowId) {
            const target = this.$windowList.querySelector(
                `[data-window-id="${sourceWindowId}"]`,
            );
            if (target) {
                target.classList.add("flash");
                clearTimeout(this._flashTimeout);
                this._flashTimeout = setTimeout(() => {
                    target.classList.remove("flash");
                }, 600);
            }
        }

        // Update the "last update" badge
        if (sourceWindowId && sourceWindowId !== this.engine.windowId) {
            this.$lastUpdate.textContent = `Last update from: ${shortId(sourceWindowId)}`;
            this.$lastUpdate.classList.add("visible");
            clearTimeout(this._updateBadgeTimeout);
            this._updateBadgeTimeout = setTimeout(() => {
                this.$lastUpdate.classList.remove("visible");
            }, 2500);
        }
    }
}
