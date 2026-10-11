/**
 * AccessPoint - Utility Helpers
 * General-purpose helper functions used across the application.
 */

const Utils = (() => {
    /**
     * Generate a unique ID string.
     * @returns {string}
     */
    function generateId() {
        return (
            Date.now().toString(36) + Math.random().toString(36).slice(2, 10)
        );
    }

    /**
     * Mock password hashing using a simple Base64-based scheme.
     * In production, this MUST be replaced with bcrypt/argon2 on the server.
     * @param {string} password
     * @returns {string}
     */
    function hashPassword(password) {
        const salt = "ap_salt_";
        const salted = salt + password + salt;
        return btoa(
            salted
                .split("")
                .map((c, i) =>
                    String.fromCharCode(c.charCodeAt(0) ^ ((i * 7 + 3) % 256)),
                )
                .join(""),
        );
    }

    /**
     * Verify a password against a stored hash.
     * @param {string} password
     * @param {string} hash
     * @returns {boolean}
     */
    function verifyPassword(password, hash) {
        return hashPassword(password) === hash;
    }

    /**
     * Generate a random token string (for password reset etc.).
     * @param {number} length
     * @returns {string}
     */
    function generateToken(length = 32) {
        const chars =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let token = "";
        for (let i = 0; i < length; i++) {
            token += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return token;
    }

    /**
     * Format a timestamp to a human-readable date string.
     * @param {number} timestamp
     * @returns {string}
     */
    function formatDate(timestamp) {
        return new Date(timestamp).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    }

    /**
     * Simple debounce function.
     * @param {Function} fn
     * @param {number} delay
     * @returns {Function}
     */
    function debounce(fn, delay = 300) {
        let timer;
        return function (...args) {
            clearTimeout(timer);
            timer = setTimeout(() => fn.apply(this, args), delay);
        };
    }

    /**
     * Sanitize a string to prevent XSS when inserting into the DOM.
     * @param {string} str
     * @returns {string}
     */
    function sanitize(str) {
        const el = document.createElement("div");
        el.textContent = str;
        return el.innerHTML;
    }

    return {
        generateId,
        hashPassword,
        verifyPassword,
        generateToken,
        formatDate,
        debounce,
        sanitize,
    };
})();
