/**
 * ============================================================
 *  ButtonCraft UI — Parallax / Tilt Button Logic
 *  Author: 0xR3TRO | License: MIT
 * ============================================================
 *  Efekt 3D tilt — przycisk obraca się w kierunku kursora.
 * ============================================================
 */

(function () {
    "use strict";

    const MAX_ANGLE = 15; // stopnie

    function init() {
        document.querySelectorAll(".btn-parallax").forEach((btn) => {
            btn.addEventListener("mousemove", (e) => {
                const rect = btn.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width;
                const y = (e.clientY - rect.top) / rect.height;
                const rotateX = (0.5 - y) * MAX_ANGLE;
                const rotateY = (x - 0.5) * MAX_ANGLE;

                btn.style.transition = "none";
                btn.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`;

                // Aktualizuj pozycję wewnętrznego blasku
                btn.style.setProperty("--mouse-x", `${x * 100}%`);
                btn.style.setProperty("--mouse-y", `${y * 100}%`);
            });

            btn.addEventListener("mouseleave", () => {
                btn.style.transition =
                    "transform 0.5s ease, box-shadow 0.3s ease";
                btn.style.transform =
                    "perspective(600px) rotateX(0) rotateY(0) scale(1)";
            });
        });
    }

    if (document.readyState === "loading")
        document.addEventListener("DOMContentLoaded", init);
    else init();
})();
