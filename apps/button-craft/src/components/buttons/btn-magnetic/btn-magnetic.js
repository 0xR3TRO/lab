/**
 * ============================================================
 *  ButtonCraft UI — Magnetic Button Logic
 *  Author: 0xR3TRO | License: MIT
 * ============================================================
 *  Przycisk magnetyczny — podąża za kursorem w obrębie swego
 *  pola, wraca do pozycji po opuszczeniu.
 * ============================================================
 */

(function () {
    "use strict";

    const STRENGTH = 0.35; // Siła przyciągania (0–1)

    function init() {
        document.querySelectorAll(".btn-magnetic").forEach((btn) => {
            btn.addEventListener("mousemove", (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                btn.style.transition = "none";
                btn.style.transform = `translate(${x * STRENGTH}px, ${y * STRENGTH}px)`;
            });

            btn.addEventListener("mouseleave", () => {
                btn.style.transition =
                    "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)";
                btn.style.transform = "translate(0, 0)";
            });
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
