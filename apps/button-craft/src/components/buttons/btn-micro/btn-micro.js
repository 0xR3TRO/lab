/**
 * ============================================================
 *  ButtonCraft UI — Micro-Interaction Button Logic
 *  Author: 0xR3TRO | License: MIT
 * ============================================================
 *  Symulacja stanów: klik -> loading -> success.
 * ============================================================
 */

(function () {
    "use strict";

    function init() {
        document
            .querySelectorAll(".btn-micro[data-loading-demo]")
            .forEach((btn) => {
                btn.addEventListener("click", () => {
                    if (
                        btn.classList.contains("btn-micro--loading") ||
                        btn.classList.contains("btn-micro--success")
                    )
                        return;

                    const originalText = btn.textContent;
                    btn.classList.add("btn-micro--loading");

                    setTimeout(() => {
                        btn.classList.remove("btn-micro--loading");
                        btn.classList.add("btn-micro--success");
                        btn.textContent = "Done";

                        setTimeout(() => {
                            btn.classList.remove("btn-micro--success");
                            btn.textContent = originalText;
                        }, 1500);
                    }, 2000);
                });
            });
    }

    if (document.readyState === "loading")
        document.addEventListener("DOMContentLoaded", init);
    else init();
})();
