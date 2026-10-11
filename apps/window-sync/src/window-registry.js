/**
 * WindowSync - Window Registry
 * Tracks all active WindowSync windows, assigns unique IDs,
 * and handles join / leave lifecycle events.
 */

import { generateId, timestamp, safeJsonParse } from "./utils.js";

const REGISTRY_LS_KEY = "windowsync_registry";
const HEARTBEAT_INTERVAL = 2000; // ms between heartbeats
const STALE_THRESHOLD = 5000; // ms before a window is considered dead

export class WindowRegistry {
    /**
     * @param {Object} options
     * @param {Function} options.broadcast  - Send a message to other windows.
     * @param {Function} options.onJoin     - Called when a new window joins.
     * @param {Function} options.onLeave    - Called when a window leaves.
     */
    constructor({ broadcast, onJoin, onLeave }) {
        this._broadcast = broadcast;
        this._onJoin = onJoin || (() => {});
        this._onLeave = onLeave || (() => {});

        this.id = generateId();
        this._windows = new Map(); // id -> { id, joinedAt, lastSeen }
        this._heartbeatTimer = null;
        this._pruneTimer = null;
    }

    /* ------------------------------------------------------------------ */
    /*  Lifecycle                                                          */
    /* ------------------------------------------------------------------ */

    /**
     * Register this window and start heartbeating.
     */
    init() {
        const entry = {
            id: this.id,
            joinedAt: timestamp(),
            lastSeen: timestamp(),
        };
        this._windows.set(this.id, entry);
        this._persistRegistry();

        // Announce ourselves
        this._broadcast({
            type: "registry:join",
            windowId: this.id,
            timestamp: timestamp(),
        });

        // Request existing windows to announce themselves
        this._broadcast({
            type: "registry:roll-call",
            windowId: this.id,
            timestamp: timestamp(),
        });

        // Periodic heartbeat
        this._heartbeatTimer = setInterval(
            () => this._heartbeat(),
            HEARTBEAT_INTERVAL,
        );
        // Periodic pruning of stale windows
        this._pruneTimer = setInterval(() => this._prune(), HEARTBEAT_INTERVAL);

        // Clean up on page unload
        window.addEventListener("beforeunload", () => this.destroy());
    }

    /**
     * Unregister this window and notify others.
     */
    destroy() {
        clearInterval(this._heartbeatTimer);
        clearInterval(this._pruneTimer);

        this._windows.delete(this.id);
        this._persistRegistry();

        this._broadcast({
            type: "registry:leave",
            windowId: this.id,
            timestamp: timestamp(),
        });
    }

    /* ------------------------------------------------------------------ */
    /*  Message handling                                                   */
    /* ------------------------------------------------------------------ */

    /**
     * Process an incoming registry-related message.
     * @param {Object} msg
     */
    handleMessage(msg) {
        if (!msg || !msg.type) return;

        switch (msg.type) {
            case "registry:join":
                this._registerWindow(msg.windowId, msg.timestamp);
                // Reply so the newcomer learns about us
                this._broadcast({
                    type: "registry:present",
                    windowId: this.id,
                    timestamp: timestamp(),
                });
                break;

            case "registry:present":
                this._registerWindow(msg.windowId, msg.timestamp);
                break;

            case "registry:heartbeat":
                this._touchWindow(msg.windowId, msg.timestamp);
                break;

            case "registry:leave":
                this._unregisterWindow(msg.windowId);
                break;

            case "registry:roll-call":
                // Someone new is asking who's here
                this._broadcast({
                    type: "registry:present",
                    windowId: this.id,
                    timestamp: timestamp(),
                });
                break;

            default:
                break;
        }
    }

    /* ------------------------------------------------------------------ */
    /*  Internal helpers                                                   */
    /* ------------------------------------------------------------------ */

    _heartbeat() {
        const now = timestamp();
        const self = this._windows.get(this.id);
        if (self) self.lastSeen = now;
        this._persistRegistry();

        this._broadcast({
            type: "registry:heartbeat",
            windowId: this.id,
            timestamp: now,
        });
    }

    _prune() {
        const now = timestamp();
        for (const [id, entry] of this._windows) {
            if (id !== this.id && now - entry.lastSeen > STALE_THRESHOLD) {
                this._windows.delete(id);
                this._onLeave(id);
            }
        }
        this._persistRegistry();
    }

    _registerWindow(id, ts) {
        if (id === this.id) return;
        if (!this._windows.has(id)) {
            this._windows.set(id, { id, joinedAt: ts, lastSeen: ts });
            this._persistRegistry();
            this._onJoin(id);
        }
    }

    _touchWindow(id, ts) {
        const entry = this._windows.get(id);
        if (entry) {
            entry.lastSeen = ts;
        } else if (id !== this.id) {
            this._registerWindow(id, ts);
        }
    }

    _unregisterWindow(id) {
        if (this._windows.has(id)) {
            this._windows.delete(id);
            this._persistRegistry();
            this._onLeave(id);
        }
    }

    _persistRegistry() {
        try {
            const list = Array.from(this._windows.values());
            localStorage.setItem(REGISTRY_LS_KEY, JSON.stringify(list));
        } catch {
            // Silently degrade
        }
    }

    /* ------------------------------------------------------------------ */
    /*  Public queries                                                     */
    /* ------------------------------------------------------------------ */

    /**
     * Get the list of all currently-known windows (including self).
     * @returns {Array<{id:string, joinedAt:number, lastSeen:number}>}
     */
    getWindows() {
        return Array.from(this._windows.values());
    }

    /**
     * Get the number of known windows.
     * @returns {number}
     */
    get count() {
        return this._windows.size;
    }
}
