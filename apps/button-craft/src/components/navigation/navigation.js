/**
 * ============================================================
 *  ButtonCraft UI — Navigation Logic
 *  Author: 0xR3TRO | License: MIT
 * ============================================================
 *  Hamburger toggle, dropdown open/close, active link.
 * ============================================================
 */

(function () {
    "use strict";

    function init() {
        // Hamburger toggle
        document.querySelectorAll(".bc-hamburger").forEach((btn) => {
            btn.addEventListener("click", () => {
                btn.classList.toggle("is-active");
                const nav = btn
                    .closest(".bc-nav")
                    .querySelector(".bc-nav__links");
                if (nav) nav.classList.toggle("is-open");
            });
        });

        // Dropdowns
        document
            .querySelectorAll(".bc-dropdown > .bc-nav__link")
            .forEach((trigger) => {
                trigger.addEventListener("click", (e) => {
                    e.preventDefault();
                    const dropdown = trigger.parentElement;
                    dropdown.classList.toggle("is-open");
                });
            });

        // Close dropdown on outside click
        document.addEventListener("click", (e) => {
            document.querySelectorAll(".bc-dropdown.is-open").forEach((dd) => {
                if (!dd.contains(e.target)) dd.classList.remove("is-open");
            });
        });
    }

    if (document.readyState === "loading")
        document.addEventListener("DOMContentLoaded", init);
    else init();
})();
