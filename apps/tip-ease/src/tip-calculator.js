/**
 * Tip Calculator Module
 * Core arithmetic for tip amount, total, and per-person split.
 */

const TipCalculator = (() => {
    /**
     * Calculate tip details.
     * @param {number} billAmount   - The pre-tip bill (> 0).
     * @param {number} tipPercent   - Tip percentage (0–100).
     * @param {number} splitCount   - Number of people (>= 1).
     * @returns {{ tipAmount: number, totalAmount: number, perPerson: number }}
     */
    function calculate(billAmount, tipPercent, splitCount = 1) {
        const bill = Math.max(0, billAmount);
        const percent = Math.max(0, Math.min(tipPercent, 100));
        const people = Math.max(1, Math.floor(splitCount));

        const tipAmount = Math.round(bill * (percent / 100) * 100) / 100;
        const totalAmount = Math.round((bill + tipAmount) * 100) / 100;
        const perPerson = Math.round((totalAmount / people) * 100) / 100;

        return { tipAmount, totalAmount, perPerson };
    }

    return { calculate };
})();

export default TipCalculator;
