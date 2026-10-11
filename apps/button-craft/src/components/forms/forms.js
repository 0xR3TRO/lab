/**
 * ============================================================
 *  ButtonCraft UI — Forms Logic
 *  Author: 0xR3TRO | License: MIT
 * ============================================================
 *  Floating label support i walidacja inline.
 * ============================================================
 */

(function () {
    "use strict";

    function init() {
        // Auto-apply floating label behaviour
        document.querySelectorAll(".bc-field .bc-input").forEach((input) => {
            // Ensure placeholder exists for :not(:placeholder-shown) selector
            if (!input.getAttribute("placeholder")) {
                input.setAttribute("placeholder", " ");
            }
        });
    }

    if (document.readyState === "loading")
        document.addEventListener("DOMContentLoaded", init);
    else init();
})();
