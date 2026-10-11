/**
 * WindowSync - State Manager
 * Stores the shared application state, applies incoming updates,
 * resolves conflicts using last-write-wins with timestamps, and
 * triggers UI refresh callbacks.
 */

import { deepMerge, timestamp, safeJsonParse } from "./utils.js";

const STATE_LS_KEY = "windowsync_state";

/**
 * Default application state shared across all windows.
 */
const DEFAULT_STATE = {
    activePanel: "home",
    sharedText: "",
    counter: 0,
    theme: "light",
    layout: "default",
    _meta: {}, // per-field timestamps for conflict resolution
};

export class StateManager {
    /**
     * @param {Object} options
     * @param {Function} options.broadcast - Send state update to other windows.
     * @param {Function} options.onStateChange - Called after state changes with (newState, changedFields).
     */
    constructor({ broadcast, onStateChange }) {
        this._broadcast = broadcast;
        this._onStateChange = onStateChange || (() => {});
        this._state = Object.assign({}, DEFAULT_STATE);
        this._locks = new Map(); // field -> { windowId, until }

        // Attempt to recover persisted state
        this._loadPersistedState();
    }

    /* ------------------------------------------------------------------ */
    /*  Persistence                                                        */
    /* ------------------------------------------------------------------ */

    _loadPersistedState() {
        const raw = safeJsonParse(localStorage.getItem(STATE_LS_KEY));
        if (raw && typeof raw === "object") {
            this._state = Object.assign({}, DEFAULT_STATE, raw);
        }
    }

    _persist() {
        try {
            localStorage.setItem(STATE_LS_KEY, JSON.stringify(this._state));
        } catch {
            // Quota / private mode
        }
    }

    /* ------------------------------------------------------------------ */
    /*  Local updates (from this window's UI)                              */
    /* ------------------------------------------------------------------ */

    /**
     * Update one or more fields locally and broadcast the change.
     * @param {Object} fields - Key/value pairs to update.
     * @param {string} windowId - This window's ID.
     */
    update(fields, windowId) {
        const now = timestamp();
        const changedFields = [];
        const meta = Object.assign({}, this._state._meta);

        for (const key of Object.keys(fields)) {
            if (key === "_meta") continue;
            this._state[key] = fields[key];
            meta[key] = now;
            changedFields.push(key);
        }

        this._state._meta = meta;
        this._persist();

        // Broadcast to other windows
        this._broadcast({
            type: "state:update",
            fields,
            meta,
            windowId,
            timestamp: now,
        });

        this._onStateChange(this._state, changedFields, windowId);
    }

    /* ------------------------------------------------------------------ */
    /*  Remote updates (from other windows)                                */
    /* ------------------------------------------------------------------ */

    /**
     * Process an incoming state update message.
     * Uses last-write-wins per field.
     * @param {Object} msg
     */
    handleMessage(msg) {
        if (!msg || msg.type !== "state:update") return;

        const { fields, meta, windowId } = msg;
        const localMeta = this._state._meta || {};
        const changedFields = [];

        for (const key of Object.keys(fields)) {
            if (key === "_meta") continue;
            const remoteTsForField = (meta && meta[key]) || 0;
            const localTsForField = localMeta[key] || 0;

            // Check field-level lock
            if (this._isLocked(key, windowId)) continue;

            // Last-write-wins
            if (remoteTsForField >= localTsForField) {
                this._state[key] = fields[key];
                localMeta[key] = remoteTsForField;
                changedFields.push(key);
            }
        }

        if (changedFields.length > 0) {
            this._state._meta = localMeta;
            this._persist();
            this._onStateChange(this._state, changedFields, windowId);
        }
    }

    /* ------------------------------------------------------------------ */
    /*  Per-field locking (optional)                                       */
    /* ------------------------------------------------------------------ */

    /**
     * Lock a field so only the specified window can write to it.
     * @param {string} field
     * @param {string} windowId
     * @param {number} durationMs - How long the lock lasts.
     */
    lockField(field, windowId, durationMs = 5000) {
        this._locks.set(field, { windowId, until: Date.now() + durationMs });
    }

    /**
     * Unlock a field.
     * @param {string} field
     */
    unlockField(field) {
        this._locks.delete(field);
    }

    /**
     * Check if a field is locked by another window.
     * @param {string} field
     * @param {string} writerId - The window attempting the write.
     * @returns {boolean}
     */
    _isLocked(field, writerId) {
        const lock = this._locks.get(field);
        if (!lock) return false;
        if (Date.now() > lock.until) {
            this._locks.delete(field);
            return false;
        }
        return lock.windowId !== writerId;
    }

    /* ------------------------------------------------------------------ */
    /*  Public queries                                                     */
    /* ------------------------------------------------------------------ */

    /**
     * Get a snapshot of the current state (without _meta).
     * @returns {Object}
     */
    getState() {
        const { _meta, ...rest } = this._state;
        return rest;
    }

    /**
     * Get the full state including metadata.
     * @returns {Object}
     */
    getFullState() {
        return Object.assign({}, this._state);
    }

    /**
     * Get a single field value.
     * @param {string} key
     * @returns {*}
     */
    get(key) {
        return this._state[key];
    }

    /**
     * Provide the full current state to a newly joined window.
     * @param {string} windowId - This window's ID.
     */
    broadcastFullState(windowId) {
        this._broadcast({
            type: "state:update",
            fields: this.getState(),
            meta: this._state._meta,
            windowId,
            timestamp: timestamp(),
        });
    }
}
