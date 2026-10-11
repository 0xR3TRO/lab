/**
 * ============================================================
 *  ButtonCraft UI — 3D Button Logic
 *  Author: 0xR3TRO | License: MIT
 * ============================================================
 *  Automatycznie inicjalizuje przyciski .btn-3d na stronie,
 *  dodając efekt ripple przy kliknięciu.
 * ============================================================
 */

(function () {
    "use strict";

    /**
     * Inicjalizacja przycisków 3D — dodanie efektu ripple.
     */
    function init() {
        document.querySelectorAll(".btn-3d").forEach((btn) => {
            btn.addEventListener("click", createRipple);
        });
    }

    /**
     * Tworzy element ripple w przycisku.
     * @param {MouseEvent} e
     */
    function createRipple(e) {
        const btn = e.currentTarget;
        const rect = btn.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const ripple = document.createElement("span");

        ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      left: ${e.clientX - rect.left - size / 2}px;
      top: ${e.clientY - rect.top - size / 2}px;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      transform: scale(0);
      pointer-events: none;
      animation: btn3d-ripple 500ms ease-out forwards;
    `;

        btn.style.position = "relative";
        btn.style.overflow = "hidden";
        btn.appendChild(ripple);
        ripple.addEventListener("animationend", () => ripple.remove());
    }

    // Inject keyframes
    const style = document.createElement("style");
    style.textContent = `
    @keyframes btn3d-ripple {
      to { transform: scale(2.5); opacity: 0; }
    }
  `;
    document.head.appendChild(style);

    // Init on DOM ready
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
