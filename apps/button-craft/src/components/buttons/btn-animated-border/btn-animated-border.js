/**
 * ============================================================
 *  ButtonCraft UI — Animated Border Button Logic
 *  Author: 0xR3TRO | License: MIT
 * ============================================================
 */

(function () {
    "use strict";
    // Animated border is purely CSS-driven.
    // This file adds optional hover sound or haptic feedback if needed.

    function init() {
        document.querySelectorAll(".btn-border-anim").forEach((btn) => {
            btn.addEventListener("click", (e) => {
                btn.style.transform = "scale(0.96)";
                setTimeout(() => {
                    btn.style.transform = "";
                }, 150);
            });
        });
    }

    if (document.readyState === "loading")
        document.addEventListener("DOMContentLoaded", init);
    else init();
})();
