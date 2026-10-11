/**
 * ============================================================
 *  ButtonCraft UI — Scroll Reveal Logic
 *  Author: 0xR3TRO | License: MIT
 * ============================================================
 *  IntersectionObserver-based scroll reveal. Dodaj atrybut
 *  data-reveal="up|down|left|right|zoom|fade" do elementu.
 *  Opcjonalnie data-reveal-delay="200" (ms).
 * ============================================================
 */

(function () {
    "use strict";

    function init() {
        const elements = document.querySelectorAll("[data-reveal]");
        if (!elements.length) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const delay = parseInt(
                            entry.target.getAttribute("data-reveal-delay") ||
                                "0",
                            10,
                        );
                        setTimeout(
                            () => entry.target.classList.add("is-visible"),
                            delay,
                        );
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.15 },
        );

        elements.forEach((el) => observer.observe(el));
    }

    if (document.readyState === "loading")
        document.addEventListener("DOMContentLoaded", init);
    else init();
})();
