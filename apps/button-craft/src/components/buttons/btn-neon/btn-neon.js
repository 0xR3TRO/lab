/**
 * ============================================================
 *  ButtonCraft UI — Neon Button Logic
 *  Author: 0xR3TRO | License: MIT
 * ============================================================
 *  Dodaje subtelne efekty interakcji do przycisków neonowych.
 * ============================================================
 */

(function () {
    "use strict";

    function init() {
        document.querySelectorAll(".btn-neon").forEach((btn) => {
            // Efekt flicker (mruganie) na mouseenter
            btn.addEventListener("mouseenter", () => {
                btn.classList.add("btn-neon--flicker");
                setTimeout(
                    () => btn.classList.remove("btn-neon--flicker"),
                    300,
                );
            });
        });
    }

    // Inject flicker keyframes
    const style = document.createElement("style");
    style.textContent = `
    .btn-neon--flicker {
      animation: neon-flicker 0.3s steps(3, end);
    }
    @keyframes neon-flicker {
      0%   { opacity: 1; }
      25%  { opacity: 0.6; }
      50%  { opacity: 1; }
      75%  { opacity: 0.7; }
      100% { opacity: 1; }
    }
  `;
    document.head.appendChild(style);

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
