/*
 * R3TRO Lab — "back to the lab" button.
 * Included by every app page: <script src="../../shared/back.js" defer></script>
 */
(() => {
    const script = document.currentScript;
    const home = new URL("../index.html", script.src).href;

    const style = document.createElement("style");
    style.textContent = `
        .lab-back {
            position: fixed;
            left: 12px;
            bottom: 12px;
            z-index: 2147483000;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 7px 12px 7px 10px;
            border-radius: 999px;
            border: 1px solid rgba(58, 215, 255, 0.5);
            background: rgba(9, 13, 19, 0.82);
            color: #e6edf3;
            font: 600 12px/1 "Space Grotesk", system-ui, sans-serif;
            letter-spacing: 0.02em;
            text-decoration: none;
            backdrop-filter: blur(6px);
            opacity: 0.72;
            transition: opacity 0.15s ease, border-color 0.15s ease;
        }
        .lab-back:hover,
        .lab-back:focus-visible {
            opacity: 1;
            border-color: #3ad7ff;
            outline: none;
        }
        .lab-back svg { width: 14px; height: 14px; }
        @media print { .lab-back { display: none; } }
    `;
    document.head.appendChild(style);

    const link = document.createElement("a");
    link.className = "lab-back";
    link.href = home;
    link.setAttribute("aria-label", "Back to R3TRO Lab");
    link.innerHTML =
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>Lab';
    document.body.appendChild(link);
})();
