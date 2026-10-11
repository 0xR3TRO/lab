/* ============================================================
   ChronoPeek — Script
   Modular calendar widget: pure vanilla JS, zero dependencies
   ============================================================ */

"use strict";

const ChronoPeek = (() => {
    // ── Constants ──────────────────────────────────────────────
    const MONTHS = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];
    const WEEKDAYS_FULL = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
    ];
    const STORAGE_KEY_EVENTS = "chronopeek_events";
    const STORAGE_KEY_THEME = "chronopeek_theme";

    // ── State ──────────────────────────────────────────────────
    let currentYear;
    let currentMonth; // 0-indexed
    let selectedDate = null; // "YYYY-MM-DD"
    let editingEventId = null;

    // ── DOM Cache ──────────────────────────────────────────────
    const $ = (sel) => document.querySelector(sel);
    const dom = {};

    function cacheDom() {
        dom.grid = $("#calendar-grid");
        dom.month = $("#display-month");
        dom.year = $("#display-year");
        dom.btnPrev = $("#btn-prev");
        dom.btnNext = $("#btn-next");
        dom.btnToday = $("#btn-today");
        dom.btnAddEvent = $("#btn-add-event");
        dom.themeToggle = $("#theme-toggle");
        // Day panel
        dom.panel = $("#day-panel");
        dom.panelDate = $("#panel-date");
        dom.panelEvents = $("#panel-events");
        dom.panelClose = $("#panel-close");
        dom.panelAddEvent = $("#panel-add-event");
        // Modal
        dom.modalOverlay = $("#event-modal");
        dom.modalTitle = $("#modal-title");
        dom.modalClose = $("#modal-close");
        dom.modalCancel = $("#modal-cancel");
        dom.modalDelete = $("#modal-delete");
        dom.form = $("#event-form");
        dom.inputTitle = $("#event-title");
        dom.inputDate = $("#event-date");
        dom.inputTime = $("#event-time");
        dom.inputColor = $("#event-color");
        dom.inputNote = $("#event-note");
        dom.toasts = $("#toast-container");
    }

    // ══════════════════════════════════════════════════════════
    //  Module: Settings (theme persistence)
    // ══════════════════════════════════════════════════════════
    const Settings = {
        getTheme() {
            try {
                return localStorage.getItem(STORAGE_KEY_THEME);
            } catch {
                return null;
            }
        },
        setTheme(theme) {
            try {
                localStorage.setItem(STORAGE_KEY_THEME, theme);
            } catch {
                /* noop */
            }
        },
        applyTheme(theme) {
            document.documentElement.setAttribute("data-theme", theme);
            Settings.setTheme(theme);
        },
        currentTheme() {
            return (
                document.documentElement.getAttribute("data-theme") || "light"
            );
        },
        toggle() {
            const next = Settings.currentTheme() === "light" ? "dark" : "light";
            Settings.applyTheme(next);
            Toast.show(
                next === "dark" ? "Dark mode enabled" : "Light mode enabled",
                "info",
            );
        },
        init() {
            const saved = Settings.getTheme();
            if (saved) {
                Settings.applyTheme(saved);
            } else if (
                window.matchMedia?.("(prefers-color-scheme: dark)").matches
            ) {
                Settings.applyTheme("dark");
            }
        },
    };

    // ══════════════════════════════════════════════════════════
    //  Module: Events (CRUD for calendar events)
    // ══════════════════════════════════════════════════════════
    const Events = {
        _cache: null,

        _loadAll() {
            if (Events._cache) return Events._cache;
            try {
                const raw = localStorage.getItem(STORAGE_KEY_EVENTS);
                Events._cache = raw ? JSON.parse(raw) : [];
            } catch {
                Events._cache = [];
            }
            return Events._cache;
        },

        _saveAll(list) {
            Events._cache = list;
            try {
                localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(list));
            } catch {
                /* noop */
            }
        },

        getByDate(dateStr) {
            return Events._loadAll()
                .filter((e) => e.date === dateStr)
                .sort((a, b) => (a.time || "").localeCompare(b.time || ""));
        },

        getById(id) {
            return Events._loadAll().find((e) => e.id === id) || null;
        },

        /** Returns Set of date strings that have events for given month */
        getDatesWithEvents(year, month) {
            const prefix = `${year}-${String(month + 1).padStart(2, "0")}`;
            const set = new Set();
            for (const e of Events._loadAll()) {
                if (e.date.startsWith(prefix)) set.add(e.date);
            }
            return set;
        },

        add(event) {
            const list = Events._loadAll();
            event.id = crypto.randomUUID
                ? crypto.randomUUID()
                : Date.now().toString(36) + Math.random().toString(36).slice(2);
            list.push(event);
            Events._saveAll(list);
            return event;
        },

        update(id, data) {
            const list = Events._loadAll();
            const idx = list.findIndex((e) => e.id === id);
            if (idx === -1) return null;
            Object.assign(list[idx], data);
            Events._saveAll(list);
            return list[idx];
        },

        remove(id) {
            const list = Events._loadAll().filter((e) => e.id !== id);
            Events._saveAll(list);
        },

        /** Get event colors for a given date (max 3 for dots) */
        getColorsForDate(dateStr) {
            return Events.getByDate(dateStr)
                .slice(0, 3)
                .map((e) => e.color || "#6366f1");
        },
    };

    // ══════════════════════════════════════════════════════════
    //  Module: Calendar (grid generation)
    // ══════════════════════════════════════════════════════════
    const Calendar = {
        /** Generate day cells for given year & month */
        build(year, month) {
            const firstDay = new Date(year, month, 1);
            const lastDay = new Date(year, month + 1, 0);
            const daysInMonth = lastDay.getDate();

            // Week starts Monday (0=Mon … 6=Sun)
            let startWeekday = firstDay.getDay() - 1;
            if (startWeekday < 0) startWeekday = 6;

            const today = new Date();
            const todayStr = Calendar.dateStr(
                today.getFullYear(),
                today.getMonth(),
                today.getDate(),
            );

            const cells = [];

            // Previous month fill
            const prevMonth = month === 0 ? 11 : month - 1;
            const prevYear = month === 0 ? year - 1 : year;
            const daysInPrev = new Date(prevYear, prevMonth + 1, 0).getDate();
            for (let i = startWeekday - 1; i >= 0; i--) {
                const d = daysInPrev - i;
                cells.push({
                    day: d,
                    month: prevMonth,
                    year: prevYear,
                    muted: true,
                });
            }

            // Current month
            for (let d = 1; d <= daysInMonth; d++) {
                cells.push({ day: d, month, year, muted: false });
            }

            // Next month fill
            const nextMonth = month === 11 ? 0 : month + 1;
            const nextYear = month === 11 ? year + 1 : year;
            const remaining = (7 - (cells.length % 7)) % 7;
            for (let d = 1; d <= remaining; d++) {
                cells.push({
                    day: d,
                    month: nextMonth,
                    year: nextYear,
                    muted: true,
                });
            }

            return { cells, todayStr };
        },

        dateStr(y, m, d) {
            return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
        },

        formatDisplay(dateStr) {
            const [y, m, d] = dateStr.split("-").map(Number);
            const date = new Date(y, m - 1, d);
            const weekday = WEEKDAYS_FULL[date.getDay()];
            return `${weekday}, ${MONTHS[m - 1]} ${d}, ${y}`;
        },
    };

    // ══════════════════════════════════════════════════════════
    //  Module: UI Helpers (Toast, Tooltip)
    // ══════════════════════════════════════════════════════════
    const Toast = {
        show(message, type = "info", duration = 2800) {
            const iconPaths = {
                success:
                    '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
                error: '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>',
                info: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>',
            };

            const toast = document.createElement("div");
            toast.className = `toast toast--${type}`;
            toast.setAttribute("role", "status");
            toast.innerHTML = `
        <svg class="toast__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${iconPaths[type] || iconPaths.info}</svg>
        <span>${_escapeHtml(message)}</span>
      `;

            dom.toasts.appendChild(toast);

            const timer = setTimeout(() => _removeToast(toast), duration);
            toast.addEventListener("click", () => {
                clearTimeout(timer);
                _removeToast(toast);
            });
        },
    };

    function _removeToast(el) {
        el.classList.add("toast--exit");
        el.addEventListener("animationend", () => el.remove(), { once: true });
    }

    function _escapeHtml(str) {
        const d = document.createElement("div");
        d.textContent = str;
        return d.innerHTML;
    }

    // ══════════════════════════════════════════════════════════
    //  Module: Animations
    // ══════════════════════════════════════════════════════════
    const Animate = {
        slideGrid(direction) {
            dom.grid.classList.remove("slide-left", "slide-right");
            // Force reflow
            void dom.grid.offsetWidth;
            dom.grid.classList.add(
                direction === "next" ? "slide-left" : "slide-right",
            );
        },

        openPanel() {
            dom.panel.hidden = false;
            dom.panel.classList.remove("panel-enter");
            void dom.panel.offsetWidth;
            dom.panel.classList.add("panel-enter");
        },
    };

    // ══════════════════════════════════════════════════════════
    //  Module: Navigation
    // ══════════════════════════════════════════════════════════
    const Nav = {
        prev() {
            currentMonth--;
            if (currentMonth < 0) {
                currentMonth = 11;
                currentYear--;
            }
            Animate.slideGrid("prev");
            render();
        },

        next() {
            currentMonth++;
            if (currentMonth > 11) {
                currentMonth = 0;
                currentYear++;
            }
            Animate.slideGrid("next");
            render();
        },

        goToday() {
            const today = new Date();
            currentYear = today.getFullYear();
            currentMonth = today.getMonth();
            selectedDate = Calendar.dateStr(
                today.getFullYear(),
                today.getMonth(),
                today.getDate(),
            );
            render();
            openDayPanel(selectedDate);
            Toast.show("Jumped to today", "info");
        },
    };

    // ══════════════════════════════════════════════════════════
    //  Module: Modal (event form)
    // ══════════════════════════════════════════════════════════
    const Modal = {
        open(dateStr, eventId) {
            editingEventId = eventId || null;
            dom.modalDelete.hidden = !eventId;
            dom.modalTitle.textContent = eventId ? "Edit Event" : "New Event";

            if (eventId) {
                const ev = Events.getById(eventId);
                if (ev) {
                    dom.inputTitle.value = ev.title;
                    dom.inputDate.value = ev.date;
                    dom.inputTime.value = ev.time || "";
                    dom.inputColor.value = ev.color || "#6366f1";
                    dom.inputNote.value = ev.note || "";
                }
            } else {
                dom.form.reset();
                dom.inputDate.value =
                    dateStr ||
                    Calendar.dateStr(
                        currentYear,
                        currentMonth,
                        new Date().getDate(),
                    );
                dom.inputColor.value = "#6366f1";
            }

            dom.modalOverlay.hidden = false;
            requestAnimationFrame(() => {
                dom.modalOverlay.classList.add("modal--visible");
                dom.inputTitle.focus();
            });
        },

        close() {
            dom.modalOverlay.classList.remove("modal--visible");
            setTimeout(() => {
                dom.modalOverlay.hidden = true;
                editingEventId = null;
            }, 300);
        },

        save() {
            const title = dom.inputTitle.value.trim();
            const date = dom.inputDate.value;
            if (!title || !date) {
                Toast.show("Title and date are required", "error");
                return;
            }

            const data = {
                title,
                date,
                time: dom.inputTime.value || "",
                color: dom.inputColor.value,
                note: dom.inputNote.value.trim(),
            };

            if (editingEventId) {
                Events.update(editingEventId, data);
                Toast.show("Event updated", "success");
            } else {
                Events.add(data);
                Toast.show("Event added", "success");
            }

            Modal.close();
            render();

            if (selectedDate === date) openDayPanel(date);
        },

        delete() {
            if (editingEventId) {
                Events.remove(editingEventId);
                Toast.show("Event deleted", "success");
                Modal.close();
                render();
                if (selectedDate) openDayPanel(selectedDate);
            }
        },
    };

    // ══════════════════════════════════════════════════════════
    //  Rendering
    // ══════════════════════════════════════════════════════════
    function render() {
        dom.month.textContent = MONTHS[currentMonth];
        dom.year.textContent = currentYear;

        const { cells, todayStr } = Calendar.build(currentYear, currentMonth);

        // Collect all unique months visible to preload event dates
        const visibleMonths = new Set();
        cells.forEach((c) => visibleMonths.add(`${c.year}-${c.month}`));

        const eventDates = new Set();
        visibleMonths.forEach((key) => {
            const [y, m] = key.split("-").map(Number);
            Events.getDatesWithEvents(y, m).forEach((d) => eventDates.add(d));
        });

        const fragment = document.createDocumentFragment();

        cells.forEach((cell) => {
            const dateStr = Calendar.dateStr(cell.year, cell.month, cell.day);
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "calendar__day";
            btn.setAttribute("role", "gridcell");
            btn.setAttribute("aria-label", Calendar.formatDisplay(dateStr));
            btn.tabIndex = -1;

            if (cell.muted) btn.classList.add("calendar__day--muted");
            if (dateStr === todayStr) btn.classList.add("calendar__day--today");
            if (dateStr === selectedDate) {
                btn.classList.add("calendar__day--selected");
                btn.tabIndex = 0;
            }

            // Day number
            const num = document.createElement("span");
            num.textContent = cell.day;
            btn.appendChild(num);

            // Event dots
            if (eventDates.has(dateStr)) {
                const colors = Events.getColorsForDate(dateStr);
                if (colors.length === 1) {
                    const dot = document.createElement("span");
                    dot.className = "calendar__day-dot";
                    dot.style.background = colors[0];
                    btn.appendChild(dot);
                } else if (colors.length > 1) {
                    const dots = document.createElement("span");
                    dots.className = "calendar__day-dots";
                    colors.forEach((c) => {
                        const d = document.createElement("span");
                        d.style.background = c;
                        dots.appendChild(d);
                    });
                    btn.appendChild(dots);
                }
            }

            btn.addEventListener("click", () => selectDay(dateStr));
            fragment.appendChild(btn);
        });

        dom.grid.innerHTML = "";
        dom.grid.appendChild(fragment);
    }

    function selectDay(dateStr) {
        selectedDate = dateStr;

        // Navigate to that month if needed
        const [y, m] = dateStr.split("-").map(Number);
        if (y !== currentYear || m - 1 !== currentMonth) {
            const direction =
                y > currentYear || (y === currentYear && m - 1 > currentMonth)
                    ? "next"
                    : "prev";
            currentYear = y;
            currentMonth = m - 1;
            Animate.slideGrid(direction);
        }

        render();
        openDayPanel(dateStr);
    }

    // ══════════════════════════════════════════════════════════
    //  Day Panel
    // ══════════════════════════════════════════════════════════
    function openDayPanel(dateStr) {
        dom.panelDate.textContent = Calendar.formatDisplay(dateStr);

        const events = Events.getByDate(dateStr);
        dom.panelEvents.innerHTML = "";

        if (events.length === 0) {
            dom.panelEvents.innerHTML =
                '<div class="day-panel__empty">No events for this day</div>';
        } else {
            events.forEach((ev) => {
                const card = document.createElement("div");
                card.className = "event-card";
                card.setAttribute("role", "button");
                card.setAttribute("tabindex", "0");
                card.setAttribute("aria-label", `Edit: ${ev.title}`);
                card.innerHTML = `
          <div class="event-card__color" style="background:${_escapeHtml(ev.color || "#6366f1")}"></div>
          <div class="event-card__info">
            <div class="event-card__title">${_escapeHtml(ev.title)}</div>
            ${ev.time ? `<div class="event-card__time">${_escapeHtml(ev.time)}</div>` : ""}
            ${ev.note ? `<div class="event-card__note">${_escapeHtml(ev.note)}</div>` : ""}
          </div>
        `;
                card.addEventListener("click", () =>
                    Modal.open(dateStr, ev.id),
                );
                card.addEventListener("keydown", (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        Modal.open(dateStr, ev.id);
                    }
                });
                dom.panelEvents.appendChild(card);
            });
        }

        Animate.openPanel();
    }

    function closeDayPanel() {
        dom.panel.hidden = true;
        selectedDate = null;
        render();
    }

    // ══════════════════════════════════════════════════════════
    //  Module: Keyboard Shortcuts
    // ══════════════════════════════════════════════════════════
    const Keyboard = {
        init() {
            document.addEventListener("keydown", (e) => {
                // Don't capture when typing in inputs
                if (e.target.matches("input, textarea, select")) return;

                // If modal is open, handle escape
                if (!dom.modalOverlay.hidden) {
                    if (e.key === "Escape") {
                        e.preventDefault();
                        Modal.close();
                    }
                    return;
                }

                switch (e.key) {
                    case "ArrowLeft":
                        e.preventDefault();
                        Nav.prev();
                        break;
                    case "ArrowRight":
                        e.preventDefault();
                        Nav.next();
                        break;
                    case "Home":
                        e.preventDefault();
                        Nav.goToday();
                        break;
                    case "Escape":
                        e.preventDefault();
                        closeDayPanel();
                        break;
                    case "t":
                    case "T":
                        e.preventDefault();
                        Settings.toggle();
                        break;
                    case "n":
                    case "N":
                        e.preventDefault();
                        Modal.open(selectedDate);
                        break;
                }
            });
        },
    };

    // ══════════════════════════════════════════════════════════
    //  Event Binding
    // ══════════════════════════════════════════════════════════
    function bindEvents() {
        dom.btnPrev.addEventListener("click", Nav.prev);
        dom.btnNext.addEventListener("click", Nav.next);
        dom.btnToday.addEventListener("click", Nav.goToday);
        dom.themeToggle.addEventListener("click", Settings.toggle);

        dom.btnAddEvent.addEventListener("click", () =>
            Modal.open(selectedDate),
        );
        dom.panelAddEvent.addEventListener("click", () =>
            Modal.open(selectedDate),
        );
        dom.panelClose.addEventListener("click", closeDayPanel);

        dom.modalClose.addEventListener("click", Modal.close);
        dom.modalCancel.addEventListener("click", Modal.close);
        dom.modalDelete.addEventListener("click", Modal.delete);

        dom.form.addEventListener("submit", (e) => {
            e.preventDefault();
            Modal.save();
        });

        // Close modal on backdrop click
        dom.modalOverlay.addEventListener("click", (e) => {
            if (e.target === dom.modalOverlay) Modal.close();
        });
    }

    // ══════════════════════════════════════════════════════════
    //  Init
    // ══════════════════════════════════════════════════════════
    function init() {
        cacheDom();
        Settings.init();

        const today = new Date();
        currentYear = today.getFullYear();
        currentMonth = today.getMonth();

        render();
        bindEvents();
        Keyboard.init();
    }

    // Boot
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }

    // Public API (for landing page mini-preview or testing)
    return { Nav, Settings, Events, Calendar, Toast, Modal };
})();
