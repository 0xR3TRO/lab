/**
 * ============================================================
 *  ButtonCraft UI — Glass Button Logic
 *  Author: 0xR3TRO | License: MIT
 * ============================================================
 */

(function () {
    "use strict";

    function init() {
        document.querySelectorAll(".btn-glass").forEach((btn) => {
            btn.addEventListener("click", createRipple);
        });
    }

    function createRipple(e) {
        const btn = e.currentTarget;
        const rect = btn.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height) * 2;
        const ripple = document.createElement("span");
        ripple.style.cssText = `
      position: absolute;
      width: ${size}px; height: ${size}px;
      left: ${e.clientX - rect.left - size / 2}px;
      top: ${e.clientY - rect.top - size / 2}px;
      background: rgba(255,255,255,0.25);
      border-radius: 50%;
      transform: scale(0);
      pointer-events: none;
      animation: glass-ripple 600ms ease-out forwards;
    `;
        btn.appendChild(ripple);
        ripple.addEventListener("animationend", () => ripple.remove());
    }

    const style = document.createElement("style");
    style.textContent = `@keyframes glass-ripple { to { transform: scale(1); opacity: 0; } }`;
    document.head.appendChild(style);

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
