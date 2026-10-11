/**
 * Storage Module
 * Persists user preferences (e.g., last tip percentage) in localStorage.
 */

const Storage = (() => {
    const PREFIX = "tipease_";

    function _key(name) {
        return PREFIX + name;
    }

    function get(name, fallback = null) {
        try {
            const raw = localStorage.getItem(_key(name));
            return raw === null ? fallback : JSON.parse(raw);
        } catch {
            return fallback;
        }
    }

    function set(name, value) {
        try {
            localStorage.setItem(_key(name), JSON.stringify(value));
        } catch {
            // Storage full or unavailable — silently ignore.
        }
    }

    function remove(name) {
        try {
            localStorage.removeItem(_key(name));
        } catch {
            // Silently ignore.
        }
    }

    /** Convenience getters/setters for common preferences. */
    function getDefaultTip() {
        return get("defaultTip", null);
    }

    function setDefaultTip(percent) {
        set("defaultTip", percent);
    }

    function getLastSplit() {
        return get("lastSplit", 1);
    }

    function setLastSplit(count) {
        set("lastSplit", count);
    }

    function clear() {
        try {
            Object.keys(localStorage)
                .filter((k) => k.startsWith(PREFIX))
                .forEach((k) => localStorage.removeItem(k));
        } catch {
            // Silently ignore.
        }
    }

    return {
        get,
        set,
        remove,
        getDefaultTip,
        setDefaultTip,
        getLastSplit,
        setLastSplit,
        clear,
    };
})();

export default Storage;
