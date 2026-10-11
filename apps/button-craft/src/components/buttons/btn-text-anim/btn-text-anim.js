/**
 * ============================================================
 *  ButtonCraft UI — Text Animation Button Logic
 *  Author: 0xR3TRO | License: MIT
 * ============================================================
 *  Obsługa efektu typewriter i glitch data-text.
 * ============================================================
 */

(function () {
    "use strict";

    function init() {
        // Glitch — ustaw data-text z textContent
        document.querySelectorAll(".btn-text-anim--glitch").forEach((btn) => {
            if (!btn.getAttribute("data-text")) {
                btn.setAttribute("data-text", btn.textContent.trim());
            }
        });

        // Typewriter — animacja wpisywania na hover
        document
            .querySelectorAll(".btn-text-anim--typewriter")
            .forEach((btn) => {
                const span = btn.querySelector(".btn-text");
                if (!span) return;
                const fullText = span.textContent;
                let typing = false;

                btn.addEventListener("mouseenter", () => {
                    if (typing) return;
                    typing = true;
                    span.textContent = "";
                    let i = 0;
                    const interval = setInterval(() => {
                        span.textContent += fullText[i];
                        i++;
                        if (i >= fullText.length) {
                            clearInterval(interval);
                            typing = false;
                        }
                    }, 60);
                });
            });
    }

    if (document.readyState === "loading")
        document.addEventListener("DOMContentLoaded", init);
    else init();
})();
