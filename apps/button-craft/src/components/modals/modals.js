/**
 * ============================================================
 *  ButtonCraft UI — Modals Logic
 *  Author: 0xR3TRO | License: MIT
 * ============================================================
 *  Otwieranie / zamykanie modali, zamykanie kliknięciem tła.
 * ============================================================
 */

(function () {
    "use strict";

    function init() {
        // Open buttons
        document.querySelectorAll("[data-modal-open]").forEach((btn) => {
            btn.addEventListener("click", () => {
                const target = document.getElementById(
                    btn.getAttribute("data-modal-open"),
                );
                if (target) target.classList.add("is-active");
            });
        });

        // Close buttons
        document
            .querySelectorAll(".bc-modal__close, [data-modal-close]")
            .forEach((btn) => {
                btn.addEventListener("click", () => {
                    const overlay = btn.closest(".bc-modal-overlay");
                    if (overlay) overlay.classList.remove("is-active");
                });
            });

        // Click overlay to close
        document.querySelectorAll(".bc-modal-overlay").forEach((overlay) => {
            overlay.addEventListener("click", (e) => {
                if (e.target === overlay) overlay.classList.remove("is-active");
            });
        });

        // ESC to close
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
                document
                    .querySelectorAll(".bc-modal-overlay.is-active")
                    .forEach((o) => {
                        o.classList.remove("is-active");
                    });
            }
        });
    }

    if (document.readyState === "loading")
        document.addEventListener("DOMContentLoaded", init);
    else init();
})();
