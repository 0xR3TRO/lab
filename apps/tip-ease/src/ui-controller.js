/**
 * UI Controller Module
 * Updates the DOM: results display, error messages, and active button states.
 */

const UIController = (() => {
    const selectors = {
        billInput: "#bill-input",
        customTipInput: "#custom-tip-input",
        splitInput: "#split-input",
        tipButtons: ".tip-btn",
        splitDecrement: "#split-decrement",
        splitIncrement: "#split-increment",
        tipAmountDisplay: "#tip-amount",
        totalAmountDisplay: "#total-amount",
        perPersonDisplay: "#per-person",
        errorMessage: "#error-message",
        resultsSection: ".results",
    };

    function el(selector) {
        return document.querySelector(selector);
    }

    function allEl(selector) {
        return document.querySelectorAll(selector);
    }

    /** Format a number as USD currency. */
    function formatCurrency(value) {
        return "$" + value.toFixed(2);
    }

    /** Update the three result values. */
    function updateResults(tipAmount, totalAmount, perPerson) {
        const tipEl = el(selectors.tipAmountDisplay);
        const totalEl = el(selectors.totalAmountDisplay);
        const ppEl = el(selectors.perPersonDisplay);

        if (tipEl) tipEl.textContent = formatCurrency(tipAmount);
        if (totalEl) totalEl.textContent = formatCurrency(totalAmount);
        if (ppEl) ppEl.textContent = formatCurrency(perPerson);
    }

    /** Reset results to $0.00. */
    function clearResults() {
        updateResults(0, 0, 0);
    }

    /** Show an error message below the inputs. */
    function showError(message) {
        const errEl = el(selectors.errorMessage);
        if (errEl) {
            errEl.textContent = message;
            errEl.hidden = false;
        }
    }

    /** Hide the error message. */
    function clearError() {
        const errEl = el(selectors.errorMessage);
        if (errEl) {
            errEl.textContent = "";
            errEl.hidden = true;
        }
    }

    /** Mark one tip button as active; deactivate the rest. */
    function setActiveTipButton(percent) {
        allEl(selectors.tipButtons).forEach((btn) => {
            const btnValue = Number(btn.dataset.tip);
            btn.classList.toggle("active", btnValue === percent);
        });
    }

    /** Deactivate all tip preset buttons (for custom tip). */
    function clearActiveTipButtons() {
        allEl(selectors.tipButtons).forEach((btn) =>
            btn.classList.remove("active"),
        );
    }

    return {
        selectors,
        el,
        allEl,
        formatCurrency,
        updateResults,
        clearResults,
        showError,
        clearError,
        setActiveTipButton,
        clearActiveTipButtons,
    };
})();

export default UIController;
