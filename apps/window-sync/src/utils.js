/**
 * WindowSync - Utility Functions
 * Provides shared helpers used across all modules.
 */

/**
 * Generate a unique window identifier.
 * Combines a timestamp with a random suffix to avoid collisions.
 * @returns {string} A unique ID string.
 */
export function generateId() {
    return (
        Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 9)
    );
}

/**
 * Get a high-resolution timestamp in milliseconds.
 * Uses performance.now() offset by timeOrigin when available.
 * @returns {number} Current timestamp in ms.
 */
export function timestamp() {
    return performance.timeOrigin + performance.now();
}

/**
 * Deep-merge two objects. Source values overwrite target values.
 * Arrays are replaced, not concatenated.
 * @param {Object} target - The base object.
 * @param {Object} source - The object to merge in.
 * @returns {Object} A new merged object.
 */
export function deepMerge(target, source) {
    const output = Object.assign({}, target);
    if (isObject(target) && isObject(source)) {
        for (const key of Object.keys(source)) {
            if (isObject(source[key])) {
                if (!(key in target)) {
                    Object.assign(output, { [key]: source[key] });
                } else {
                    output[key] = deepMerge(target[key], source[key]);
                }
            } else {
                Object.assign(output, { [key]: source[key] });
            }
        }
    }
    return output;
}

/**
 * Check if a value is a plain object.
 * @param {*} item
 * @returns {boolean}
 */
export function isObject(item) {
    return item !== null && typeof item === "object" && !Array.isArray(item);
}

/**
 * Safely parse a JSON string. Returns the fallback on failure.
 * @param {string} str - The JSON string.
 * @param {*} [fallback=null] - Value to return on parse error.
 * @returns {*} Parsed value or fallback.
 */
export function safeJsonParse(str, fallback = null) {
    try {
        return JSON.parse(str);
    } catch {
        return fallback;
    }
}

/**
 * Throttle a function so it fires at most once every `delay` ms.
 * @param {Function} fn
 * @param {number} delay - Minimum interval in ms.
 * @returns {Function}
 */
export function throttle(fn, delay) {
    let lastCall = 0;
    let timer = null;
    return function (...args) {
        const now = Date.now();
        const remaining = delay - (now - lastCall);
        if (remaining <= 0) {
            clearTimeout(timer);
            lastCall = now;
            fn.apply(this, args);
        } else if (!timer) {
            timer = setTimeout(() => {
                lastCall = Date.now();
                timer = null;
                fn.apply(this, args);
            }, remaining);
        }
    };
}

/**
 * Create a short display label from a window ID.
 * @param {string} id
 * @returns {string}
 */
export function shortId(id) {
    return id.slice(-5).toUpperCase();
}
