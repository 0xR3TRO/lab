/* R3TRO Lab — gallery. */
(() => {
    const svg = (body) =>
        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;

    const GROUPS = [
        {
            title: "Tools",
            note: "everyday utilities",
            apps: [
                ["calcify", "Calcify", "#0a84ff", "Lightweight calculator with keyboard support and light/dark themes.", '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 12h.01M12 12h.01M16 12h.01M8 16h.01M12 16h.01M16 16h.01"/>'],
                ["tip-ease", "TipEase", "#12a150", "Tip calculator that splits the bill between people.", '<path d="M12 3v18M16 7H10a3 3 0 0 0 0 6h4a3 3 0 0 1 0 6H8"/>'],
                ["any2any", "Any2Any", "#b783ff", "Convert between data formats, encodings and image types.", '<path d="M4 7h13l-3-3M20 17H7l3 3"/>'],
                ["date-span", "DateSpan", "#ff9a3c", "Time between dates, exact age and date arithmetic.", '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4M8 15h3"/>'],
                ["qryptix", "Qryptix", "#0a84ff", "QR codes, TOTP authenticator, password vault and generator.", '<path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h2v2h-2zM18 18h2v2h-2zM14 18h2"/>'],
                ["chromify", "Chromify", "#ff4fd8", "Colour palette generator with harmony rules and export.", '<circle cx="12" cy="12" r="9"/><circle cx="8.5" cy="10" r="1.3"/><circle cx="12" cy="7.5" r="1.3"/><circle cx="15.5" cy="10" r="1.3"/><path d="M12 21a3 3 0 0 1 0-6h2"/>'],
                ["coin-pulse", "CoinPulse", "#f2a900", "Live crypto prices and 24-hour change in USD, EUR, PLN or GBP.", '<path d="M3 17l5-5 4 3 8-8"/><path d="M15 7h5v5"/>'],
                ["sky-pulse", "SkyPulse", "#3ad7ff", "Weather dashboard with forecast, charts and air quality.", '<path d="M7 18a4 4 0 0 1-.6-8 5.5 5.5 0 0 1 10.6 1.5A3.5 3.5 0 0 1 17 18z"/>'],
                ["battery", "Battery Detector", "#12a150", "Live battery level and charging state from your browser.", '<rect x="2" y="7" width="17" height="10" rx="2"/><path d="M22 11v2M6 10v4M9.5 10v4"/>'],
            ],
        },
        {
            title: "Time & productivity",
            note: "focus, plan, learn",
            apps: [
                ["time-snap", "TimeSnap", "#0a84ff", "Precise stopwatch with laps.", '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5M10 2h4"/>'],
                ["tempo-dial", "TempoDial", "#b783ff", "Analog clock widget with themes and settings.", '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'],
                ["focus-tempo", "FocusTempo", "#d93850", "Pomodoro timer for focused work sessions.", '<circle cx="12" cy="14" r="7"/><path d="M12 7c0-2 1.5-4 4-4M12 11v3"/>'],
                ["chrono-peek", "ChronoPeek", "#ff9a3c", "Compact calendar widget with events.", '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/><circle cx="15" cy="15" r="1.5"/>'],
                ["task-flow", "TaskFlow", "#12a150", "To-do list with filters, saved in your browser.", '<path d="M9 6h11M9 12h11M9 18h11"/><path d="M4 6l1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2"/>'],
                ["testify", "Testify", "#0a84ff", "Interactive quiz with scoring and modules.", '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14M12 17h.01"/>'],
                ["inspire-mint", "InspireMint", "#12a150", "Motivational quote generator with categories.", '<path d="M7 7h4v4c0 3-1.5 5-4 6M15 7h4v4c0 3-1.5 5-4 6"/>'],
            ],
        },
        {
            title: "UI & components",
            note: "interface experiments",
            apps: [
                ["button-craft", "ButtonCraft", "#ff4fd8", "A library of animated buttons, effects and UI modules.", '<rect x="3" y="8" width="18" height="8" rx="4"/><path d="M8 12h8"/>'],
                ["card-motion", "CardMotion", "#b783ff", "Interactive payment-card preview with flip animation.", '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M6 15h4"/>'],
                ["showcase-grid", "ShowcaseGrid", "#0a84ff", "Reusable, responsive grid for showcasing projects.", '<rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="8" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/><rect x="13" y="13" width="8" height="8" rx="1.5"/>'],
                ["access-point", "AccessPoint", "#12a150", "Login, registration and recovery screens (front-end demo).", '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>'],
                ["window-sync", "WindowSync", "#3ad7ff", "Several browser windows that share one synchronised scene.", '<rect x="2" y="4" width="12" height="10" rx="1.5"/><rect x="10" y="10" width="12" height="10" rx="1.5"/>'],
            ],
        },
        {
            title: "Builders & dashboards",
            note: "bigger apps",
            apps: [
                ["cardify", "Cardify", "#ff9a3c", "Design and export digital profile cards (PNG, PDF, SVG).", '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="11" r="2.5"/><path d="M5.5 17a3.5 3.5 0 0 1 7 0M14 9h4M14 13h4"/>'],
                ["pagemint-business", "PageMint Business", "#12a150", "Generate one-page business profiles and export them.", '<path d="M4 3h11l5 5v13H4z"/><path d="M15 3v5h5M8 13h8M8 17h5"/>'],
                ["prod-flow", "ProdFlow", "#0a84ff", "Production management dashboard with orders, stock and forecasts.", '<path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 5-6"/>'],
            ],
        },
    ];

    const gallery = document.getElementById("gallery");
    const search = document.getElementById("search");

    function render(query = "") {
        const q = query.trim().toLowerCase();
        const html = GROUPS.map((g) => {
            const apps = g.apps.filter(([, name, , text]) => !q || name.toLowerCase().includes(q) || text.toLowerCase().includes(q));
            if (!apps.length) return "";
            return `
            <section class="group">
                <h2>${g.title}<small>${g.note}</small></h2>
                <ul>
                    ${apps
                        .map(
                            ([slug, name, tint, text, icon]) => `
                    <li>
                        <a class="app" href="apps/${slug}/" style="--tint:${tint}">
                            <span class="icon">${svg(icon)}</span>
                            <span><h3>${name}</h3><p>${text}</p></span>
                        </a>
                    </li>`,
                        )
                        .join("")}
                </ul>
            </section>`;
        }).join("");
        gallery.innerHTML = html || '<p class="empty">No app matches your search.</p>';
    }

    search.addEventListener("input", () => render(search.value));
    render();
})();
