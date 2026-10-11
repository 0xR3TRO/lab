/**
 * ============================================================
 *  ButtonCraft UI — Interaction Helpers (JS)
 *  Author: 0xR3TRO | License: MIT
 * ============================================================
 *  Utility functions for handling cursor tracking, magnetic
 *  effects, ripple clicks, parallax tilt, and theme toggling.
 * ============================================================
 */

/**
 * Attach a magnetic (follow-cursor) effect to an element.
 * The element moves slightly toward the cursor when hovered.
 * @param {HTMLElement} el
 * @param {number} [strength=0.3] - Movement multiplier (0-1)
 */
export function magneticEffect(el, strength = 0.3) {
    const onMove = (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
    };
    const onLeave = () => {
        el.style.transform = "translate(0, 0)";
        el.style.transition = `transform var(--bc-transition-spring, 400ms cubic-bezier(0.34, 1.56, 0.64, 1))`;
    };
    const onEnter = () => {
        el.style.transition = "none";
    };

    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);

    // Return cleanup function
    return () => {
        el.removeEventListener("mouseenter", onEnter);
        el.removeEventListener("mousemove", onMove);
        el.removeEventListener("mouseleave", onLeave);
    };
}

/**
 * Attach a ripple effect to a clickable element.
 * Creates an expanding circle from the click point.
 * @param {HTMLElement} el
 * @param {string} [color='rgba(255,255,255,0.4)']
 */
export function rippleEffect(el, color = "rgba(255,255,255,0.4)") {
    el.style.position = "relative";
    el.style.overflow = "hidden";

    el.addEventListener("click", (e) => {
        const rect = el.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height) * 2;
        const ripple = document.createElement("span");
        ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      left: ${e.clientX - rect.left - size / 2}px;
      top: ${e.clientY - rect.top - size / 2}px;
      background: ${color};
      border-radius: 50%;
      transform: scale(0);
      opacity: 1;
      pointer-events: none;
      animation: bc-ripple-expand 600ms ease-out forwards;
    `;
        el.appendChild(ripple);
        ripple.addEventListener("animationend", () => ripple.remove());
    });
}

/**
 * Attach a 3D tilt / parallax effect to an element.
 * @param {HTMLElement} el
 * @param {number} [maxAngle=15] - Maximum tilt angle in degrees
 */
export function parallaxTilt(el, maxAngle = 15) {
    el.style.transformStyle = "preserve-3d";
    el.style.willChange = "transform";

    el.addEventListener("mousemove", (e) => {
        const rect = el.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        const rotateX = -y * maxAngle;
        const rotateY = x * maxAngle;
        el.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    el.addEventListener("mouseleave", () => {
        el.style.transition = "transform 0.5s ease";
        el.style.transform = "perspective(600px) rotateX(0) rotateY(0)";
    });

    el.addEventListener("mouseenter", () => {
        el.style.transition = "none";
    });
}

/**
 * Toggle light/dark theme on the document.
 * @returns {'light'|'dark'} The newly applied theme
 */
export function toggleTheme() {
    const root = document.documentElement;
    const current = root.getAttribute("data-theme") || "light";
    const next = current === "light" ? "dark" : "light";
    root.setAttribute("data-theme", next);
    localStorage.setItem("bc-theme", next);
    return next;
}

/**
 * Apply saved theme from localStorage on page load.
 */
export function applyStoredTheme() {
    const stored = localStorage.getItem("bc-theme");
    if (stored) {
        document.documentElement.setAttribute("data-theme", stored);
    }
}

/**
 * Debounce a function.
 * @param {Function} fn
 * @param {number} delay - ms
 * @returns {Function}
 */
export function debounce(fn, delay = 100) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}

/**
 * Throttle a function.
 * @param {Function} fn
 * @param {number} limit - ms
 * @returns {Function}
 */
export function throttle(fn, limit = 16) {
    let inThrottle = false;
    return (...args) => {
        if (!inThrottle) {
            fn(...args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
}

// Inject global ripple keyframes if not already present
if (typeof document !== "undefined") {
    const id = "bc-ripple-keyframes";
    if (!document.getElementById(id)) {
        const style = document.createElement("style");
        style.id = id;
        style.textContent = `
      @keyframes bc-ripple-expand {
        to { transform: scale(1); opacity: 0; }
      }
    `;
        document.head.appendChild(style);
    }
}
