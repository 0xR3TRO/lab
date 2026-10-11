/**
 * ============================================================
 *  ButtonCraft UI — Animation Helpers (JS)
 *  Author: 0xR3TRO | License: MIT
 * ============================================================
 *  Utility functions for triggering and managing CSS / JS
 *  animations programmatically.
 * ============================================================
 */

/**
 * Animate an element by adding a CSS class, then remove it when done.
 * @param {HTMLElement} el - Target element
 * @param {string} animationClass - CSS class that contains the animation
 * @returns {Promise<void>}
 */
export function animateCSS(el, animationClass) {
    return new Promise((resolve) => {
        el.classList.add(animationClass);
        const handler = () => {
            el.classList.remove(animationClass);
            el.removeEventListener("animationend", handler);
            resolve();
        };
        el.addEventListener("animationend", handler);
    });
}

/**
 * Smoothly interpolate a numeric CSS property.
 * @param {HTMLElement} el
 * @param {string} property - CSS property name (e.g. 'opacity')
 * @param {number} from
 * @param {number} to
 * @param {number} duration - ms
 * @param {string} [unit=''] - e.g. 'px', '%'
 */
export function tweenProperty(el, property, from, to, duration, unit = "") {
    const start = performance.now();
    const tick = (now) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // ease-out quad
        const eased = 1 - (1 - progress) * (1 - progress);
        const value = from + (to - from) * eased;
        el.style[property] = `${value}${unit}`;
        if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
}

/**
 * Chain multiple animations sequentially.
 * @param {Array<() => Promise<void>>} fns - Array of async animation functions
 */
export async function chainAnimations(fns) {
    for (const fn of fns) {
        await fn();
    }
}

/**
 * Run animations in parallel and wait for all to finish.
 * @param {Array<() => Promise<void>>} fns
 */
export function parallelAnimations(fns) {
    return Promise.all(fns.map((fn) => fn()));
}

/**
 * Apply a spring-physics-based animation to translateY.
 * @param {HTMLElement} el
 * @param {number} targetY - Target Y translation in px
 * @param {object} [opts]
 * @param {number} [opts.stiffness=180]
 * @param {number} [opts.damping=12]
 * @param {number} [opts.mass=1]
 */
export function springY(el, targetY, opts = {}) {
    const { stiffness = 180, damping = 12, mass = 1 } = opts;
    let velocity = 0;
    let position = 0;
    const step = 1 / 60;

    const tick = () => {
        const force = -stiffness * (position - targetY);
        const dampingForce = -damping * velocity;
        const acceleration = (force + dampingForce) / mass;
        velocity += acceleration * step;
        position += velocity * step;
        el.style.transform = `translateY(${position}px)`;

        if (Math.abs(velocity) > 0.01 || Math.abs(position - targetY) > 0.01) {
            requestAnimationFrame(tick);
        } else {
            el.style.transform = `translateY(${targetY}px)`;
        }
    };
    requestAnimationFrame(tick);
}

/**
 * Create a typewriter effect on an element.
 * @param {HTMLElement} el
 * @param {string} text
 * @param {number} [speed=50] - ms per character
 * @returns {Promise<void>}
 */
export function typewriter(el, text, speed = 50) {
    return new Promise((resolve) => {
        el.textContent = "";
        let i = 0;
        const interval = setInterval(() => {
            el.textContent += text[i];
            i++;
            if (i >= text.length) {
                clearInterval(interval);
                resolve();
            }
        }, speed);
    });
}

/**
 * Stagger animation across a list of elements.
 * @param {NodeList|Array<HTMLElement>} elements
 * @param {string} animationClass
 * @param {number} [delay=80] - ms between each element
 */
export function stagger(elements, animationClass, delay = 80) {
    elements.forEach((el, i) => {
        setTimeout(() => el.classList.add(animationClass), i * delay);
    });
}
