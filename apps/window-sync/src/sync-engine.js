/**
 * WindowSync - Sync Engine
 * Central communication hub that connects the ChannelManager,
 * WindowRegistry, and StateManager. It normalizes incoming messages
 * and routes them to the appropriate module.
 */

import { ChannelManager } from "./channel-manager.js";
import { WindowRegistry } from "./window-registry.js";
import { StateManager } from "./state-manager.js";

export class SyncEngine {
    /**
     * @param {Object} options
     * @param {Function} options.onStateChange  - (state, changedFields, sourceWindowId)
     * @param {Function} options.onWindowJoin   - (windowId)
     * @param {Function} options.onWindowLeave  - (windowId)
     */
    constructor({ onStateChange, onWindowJoin, onWindowLeave }) {
        this._onStateChangeCallback = onStateChange || (() => {});
        this._onWindowJoinCallback = onWindowJoin || (() => {});
        this._onWindowLeaveCallback = onWindowLeave || (() => {});

        // Channel (low-level transport)
        this.channel = new ChannelManager((msg) => this._handleMessage(msg));

        // Registry (window presence tracking)
        this.registry = new WindowRegistry({
            broadcast: (msg) => this.channel.postMessage(msg),
            onJoin: (id) => {
                // When a new window joins, send it our full state
                this.state.broadcastFullState(this.windowId);
                this._onWindowJoinCallback(id);
            },
            onLeave: (id) => this._onWindowLeaveCallback(id),
        });

        // State (synchronized data)
        this.state = new StateManager({
            broadcast: (msg) => this.channel.postMessage(msg),
            onStateChange: (state, changedFields, sourceWindowId) => {
                this._onStateChangeCallback(
                    state,
                    changedFields,
                    sourceWindowId,
                );
            },
        });
    }

    /* ------------------------------------------------------------------ */
    /*  Lifecycle                                                          */
    /* ------------------------------------------------------------------ */

    /**
     * Initialize the sync engine: register this window and begin
     * heartbeating / listening.
     */
    init() {
        this.registry.init();
    }

    /**
     * Tear down the sync engine cleanly.
     */
    destroy() {
        this.registry.destroy();
        this.channel.destroy();
    }

    /* ------------------------------------------------------------------ */
    /*  Message routing                                                    */
    /* ------------------------------------------------------------------ */

    /**
     * Central message handler. Normalizes the message and routes it.
     * @param {Object} msg
     */
    _handleMessage(msg) {
        if (!msg || !msg.type) return;

        // Ignore messages from ourselves
        if (msg.windowId === this.windowId) return;

        if (msg.type.startsWith("registry:")) {
            this.registry.handleMessage(msg);
        } else if (msg.type.startsWith("state:")) {
            this.state.handleMessage(msg);
        }
        // Future: add more namespaces here (e.g., 'action:')
    }

    /* ------------------------------------------------------------------ */
    /*  Public convenience accessors                                       */
    /* ------------------------------------------------------------------ */

    /** This window's unique ID. */
    get windowId() {
        return this.registry.id;
    }

    /** Current shared state (without meta). */
    getState() {
        return this.state.getState();
    }

    /**
     * Update shared state from this window.
     * @param {Object} fields
     */
    updateState(fields) {
        this.state.update(fields, this.windowId);
    }

    /** List of active windows. */
    getWindows() {
        return this.registry.getWindows();
    }

    /** Whether BroadcastChannel is in use. */
    get usingBroadcastChannel() {
        return this.channel.isBroadcastChannel;
    }
}
