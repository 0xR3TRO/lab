/**
 * TipEase — Main Application Entry Point
 * Wires together all modules and binds DOM events.
 */

import BillInput from "./src/bill-input.js";
import TipCalculator from "./src/tip-calculator.js";
import TipPresets from "./src/tip-presets.js";
import SplitManager from "./src/split-manager.js";
import UIController from "./src/ui-controller.js";
import Storage from "./src/storage.js";

const UI = UIController;

// ── Helpers ──────────────────────────────────────────────────────────────

function recalculate() {
    const billEl = document.querySelector(UI.selectors.billInput);
    const bill = BillInput.parse(billEl.value);

    if (bill === null || bill <= 0) {
        UI.clearResults();
        return;
    }

    const tipPercent = TipPresets.getActive();
    if (tipPercent === null) {
        UI.clearResults();
        return;
    }

    const people = SplitManager.get();
    const { tipAmount, totalAmount, perPerson } = TipCalculator.calculate(
        bill,
        tipPercent,
        people,
    );

    UI.updateResults(tipAmount, totalAmount, perPerson);
    UI.clearError();
}

function resetAll() {
    const billEl = document.querySelector(UI.selectors.billInput);
    const customEl = document.querySelector(UI.selectors.customTipInput);
    const splitEl = document.querySelector(UI.selectors.splitInput);

    billEl.value = "";
    customEl.value = "";
    SplitManager.reset();
    splitEl.value = SplitManager.get();
    TipPresets.reset();
    UI.clearActiveTipButtons();
    UI.clearResults();
    UI.clearError();
    billEl.focus();
}

// ── Initialization ───────────────────────────────────────────────────────

function init() {
    const billEl = document.querySelector(UI.selectors.billInput);
    const customEl = document.querySelector(UI.selectors.customTipInput);
    const splitEl = document.querySelector(UI.selectors.splitInput);
    const tipButtons = document.querySelectorAll(UI.selectors.tipButtons);
    const decrBtn = document.querySelector(UI.selectors.splitDecrement);
    const incrBtn = document.querySelector(UI.selectors.splitIncrement);
    const resetBtn = document.querySelector("#reset-btn");

    // Restore saved defaults
    const savedTip = Storage.getDefaultTip();
    const savedSplit = Storage.getLastSplit();

    if (savedTip !== null) {
        const presets = TipPresets.getPresets();
        if (presets.includes(savedTip)) {
            TipPresets.select(savedTip);
            UI.setActiveTipButton(savedTip);
        } else {
            TipPresets.selectCustom(savedTip);
            customEl.value = savedTip;
        }
    }

    if (savedSplit > 1) {
        SplitManager.set(savedSplit);
        splitEl.value = SplitManager.get();
    }

    // Bill input
    billEl.addEventListener("input", () => {
        const error = BillInput.validate(billEl.value);
        if (error && billEl.value.trim() !== "") {
            UI.showError(error);
        } else {
            UI.clearError();
        }
        recalculate();
    });

    // Tip preset buttons
    tipButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            const percent = Number(btn.dataset.tip);
            TipPresets.select(percent);
            UI.setActiveTipButton(percent);
            customEl.value = "";
            Storage.setDefaultTip(percent);
            recalculate();
        });
    });

    // Custom tip
    customEl.addEventListener("input", () => {
        const result = TipPresets.selectCustom(customEl.value);
        if (result !== null) {
            UI.clearActiveTipButtons();
            UI.clearError();
            Storage.setDefaultTip(result);
        }
        recalculate();
    });

    customEl.addEventListener("focus", () => {
        UI.clearActiveTipButtons();
        TipPresets.selectCustom(customEl.value || "0");
    });

    // Split controls
    splitEl.addEventListener("input", () => {
        const error = SplitManager.validate(splitEl.value);
        if (error) {
            UI.showError(error);
        } else {
            UI.clearError();
            SplitManager.set(splitEl.value);
            Storage.setLastSplit(SplitManager.get());
        }
        recalculate();
    });

    decrBtn.addEventListener("click", () => {
        const val = SplitManager.decrement();
        splitEl.value = val;
        Storage.setLastSplit(val);
        recalculate();
    });

    incrBtn.addEventListener("click", () => {
        const val = SplitManager.increment();
        splitEl.value = val;
        Storage.setLastSplit(val);
        recalculate();
    });

    // Reset
    resetBtn.addEventListener("click", resetAll);
}

document.addEventListener("DOMContentLoaded", init);
