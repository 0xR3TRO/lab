/**
 * WindowSync - Entry Point
 * Boots the SyncEngine, wires it to the UIController,
 * and keeps the Data panel's state snapshot up to date.
 */

import { SyncEngine } from "./src/sync-engine.js";
import { UIController } from "./src/ui-controller.js";

// ── Bootstrap ──────────────────────────────────────────────────────
const engine = new SyncEngine({
    onStateChange(state, changedFields, sourceWindowId) {
        ui.onStateChange(state, changedFields, sourceWindowId);
        renderSnapshot();
    },
    onWindowJoin() {
        ui.onWindowListChange();
    },
    onWindowLeave() {
        ui.onWindowListChange();
    },
});

engine.init();

const ui = new UIController(engine);
ui.init();

// ── Data-panel live snapshot ───────────────────────────────────────
const $snapshot = document.getElementById("state-snapshot");

function renderSnapshot() {
    if ($snapshot) {
        $snapshot.textContent = JSON.stringify(engine.getState(), null, 2);
    }
}

// Initial render
renderSnapshot();
