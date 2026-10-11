/**
 * AccessPoint - UI Controller
 * Manages views, forms, error/success messages, and transition animations.
 */

const UIController = (() => {
    // ── Selectors ────────────────────────────────────────

    const views = {
        login: () => document.getElementById("view-login"),
        register: () => document.getElementById("view-register"),
        recovery: () => document.getElementById("view-recovery"),
        reset: () => document.getElementById("view-reset"),
        dashboard: () => document.getElementById("view-dashboard"),
    };

    // ── View Navigation ──────────────────────────────────

    function showView(viewName) {
        document.querySelectorAll(".view").forEach((v) => {
            v.classList.remove("view--active");
        });

        const target = views[viewName]?.();
        if (target) {
            target.classList.add("view--active");
            // Clear all field errors when switching views
            target
                .querySelectorAll(".field__error")
                .forEach((el) => (el.textContent = ""));
            target
                .querySelectorAll(".field__input")
                .forEach((el) => el.classList.remove("field__input--error"));
            // Clear global messages
            clearMessages();
        }

        // Push a pseudo-state so the back button works between views
        if (history.state?.view !== viewName) {
            history.pushState({ view: viewName }, "");
        }
    }

    // ── Field Errors ─────────────────────────────────────

    function setFieldError(inputEl, message) {
        const group = inputEl.closest(".field");
        if (!group) return;
        const errorEl = group.querySelector(".field__error");
        if (errorEl) errorEl.textContent = message;
        inputEl.classList.toggle("field__input--error", !!message);
    }

    function clearFieldError(inputEl) {
        setFieldError(inputEl, "");
    }

    // ── Global Messages ──────────────────────────────────

    function showMessage(container, text, type = "error") {
        const el =
            typeof container === "string"
                ? document.getElementById(container)
                : container;
        if (!el) return;
        el.textContent = text;
        el.className = "message message--" + type;
        el.hidden = false;
    }

    function clearMessages() {
        document.querySelectorAll(".message").forEach((el) => {
            el.textContent = "";
            el.hidden = true;
        });
    }

    // ── Password Strength Meter ──────────────────────────

    function updateStrengthMeter(strength) {
        const meter = document.getElementById("password-strength");
        if (!meter) return;
        const segments = meter.querySelectorAll(".strength__segment");
        const label = meter.querySelector(".strength__label");

        const levels = ["", "Weak", "Fair", "Good", "Strong", "Excellent"];
        const colors = [
            "",
            "var(--c-error)",
            "var(--c-warning)",
            "var(--c-warning)",
            "var(--c-success)",
            "var(--c-success)",
        ];

        segments.forEach((seg, i) => {
            seg.style.background =
                i < strength ? colors[strength] : "var(--c-border)";
        });
        if (label) {
            label.textContent = levels[strength] || "";
            label.style.color = colors[strength] || "";
        }
    }

    // ── Dashboard ────────────────────────────────────────

    function renderDashboard(user) {
        const nameEl = document.getElementById("dashboard-name");
        const emailEl = document.getElementById("dashboard-email");
        const dateEl = document.getElementById("dashboard-date");

        if (nameEl) nameEl.textContent = Utils.sanitize(user.name);
        if (emailEl) emailEl.textContent = Utils.sanitize(user.email);
        if (dateEl) dateEl.textContent = Utils.formatDate(user.createdAt);
    }

    // ── Loading State ────────────────────────────────────

    function setLoading(button, loading) {
        if (!button) return;
        button.disabled = loading;
        button.classList.toggle("btn--loading", loading);
    }

    // ── Initialize ───────────────────────────────────────

    function init() {
        // Handle browser back/forward
        window.addEventListener("popstate", (e) => {
            if (e.state?.view) {
                showView(e.state.view);
            }
        });
    }

    return {
        showView,
        setFieldError,
        clearFieldError,
        showMessage,
        clearMessages,
        updateStrengthMeter,
        renderDashboard,
        setLoading,
        init,
    };
})();
