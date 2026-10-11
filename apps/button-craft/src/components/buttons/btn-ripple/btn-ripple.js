/**
 * ============================================================
 *  ButtonCraft UI — Ripple Button Logic
 *  Author: 0xR3TRO | License: MIT
 * ============================================================
 */

(function () {
    "use strict";

    function init() {
        document.querySelectorAll(".btn-ripple").forEach((btn) => {
            btn.addEventListener("click", (e) => {
                const rect = btn.getBoundingClientRect();
                const diameter = Math.max(rect.width, rect.height);
                const circle = document.createElement("span");
                circle.className = "ripple-circle";
                circle.style.width = circle.style.height = `${diameter}px`;
                circle.style.left = `${e.clientX - rect.left - diameter / 2}px`;
                circle.style.top = `${e.clientY - rect.top - diameter / 2}px`;
                btn.appendChild(circle);
                circle.addEventListener("animationend", () => circle.remove());
            });
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
