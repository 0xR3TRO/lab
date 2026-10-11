/**
 * WindowSync - Channel Manager
 * Manages cross-window communication using BroadcastChannel with
 * a localStorage event fallback for older browsers.
 */

import { safeJsonParse } from "./utils.js";

const CHANNEL_NAME = "windowsync";
const LS_KEY = "windowsync_msg";

export class ChannelManager {
    /**
     * @param {Function} onMessage - Callback invoked with each incoming message object.
     */
    constructor(onMessage) {
        this._onMessage = onMessage;
        this._channel = null;
        this._useLocalStorage = false;
        this._boundStorageHandler = this._handleStorageEvent.bind(this);

        this._init();
    }

    /* ------------------------------------------------------------------ */
    /*  Initialization                                                     */
    /* ------------------------------------------------------------------ */

    _init() {
        if (typeof BroadcastChannel !== "undefined") {
            this._channel = new BroadcastChannel(CHANNEL_NAME);
            this._channel.onmessage = (event) => {
                if (event.data) {
                    this._onMessage(event.data);
                }
            };
        } else {
            // Fallback: use localStorage "storage" events.
            this._useLocalStorage = true;
            window.addEventListener("storage", this._boundStorageHandler);
        }
    }

    /**
     * Handle a storage event (localStorage fallback path).
     * @param {StorageEvent} event
     */
    _handleStorageEvent(event) {
        if (event.key !== LS_KEY) return;
        const msg = safeJsonParse(event.newValue);
        if (msg) {
            this._onMessage(msg);
        }
    }

    /* ------------------------------------------------------------------ */
    /*  Public API                                                         */
    /* ------------------------------------------------------------------ */

    /**
     * Broadcast a message to all other windows.
     * @param {Object} message - The message payload (must be serializable).
     */
    postMessage(message) {
        if (this._channel) {
            this._channel.postMessage(message);
        }

        if (this._useLocalStorage || !this._channel) {
            // Even when BroadcastChannel is available we also write to
            // localStorage so that popup windows opened with window.open()
            // can pick up messages via postMessage relay.
            try {
                localStorage.setItem(LS_KEY, JSON.stringify(message));
                // Immediately remove so subsequent identical messages still fire.
                localStorage.removeItem(LS_KEY);
            } catch {
                // Storage quota exceeded or private mode – silently degrade.
            }
        }
    }

    /**
     * Check whether BroadcastChannel is in use (vs. fallback).
     * @returns {boolean}
     */
    get isBroadcastChannel() {
        return !this._useLocalStorage && this._channel !== null;
    }

    /**
     * Tear down the channel and remove listeners.
     */
    destroy() {
        if (this._channel) {
            this._channel.close();
            this._channel = null;
        }
        window.removeEventListener("storage", this._boundStorageHandler);
    }
}
