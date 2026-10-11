/**
 * Bill Input Module
 * Handles validation and parsing of the bill amount input.
 */

const BillInput = (() => {
    const MIN_AMOUNT = 0;
    const MAX_AMOUNT = 1_000_000;

    /**
     * Parse a raw input string into a numeric bill amount.
     * Returns null if the value is invalid.
     */
    function parse(raw) {
        if (typeof raw !== "string") return null;
        const cleaned = raw.trim().replace(/[^0-9.]/g, "");
        if (cleaned === "") return null;

        const value = parseFloat(cleaned);
        if (Number.isNaN(value)) return null;
        if (value < MIN_AMOUNT) return null;
        if (value > MAX_AMOUNT) return null;

        return Math.round(value * 100) / 100;
    }

    /**
     * Validate a bill amount and return an error message or null if valid.
     */
    function validate(raw) {
        if (typeof raw !== "string" || raw.trim() === "") {
            return "Please enter a bill amount.";
        }

        const cleaned = raw.trim().replace(/[^0-9.]/g, "");
        const value = parseFloat(cleaned);

        if (Number.isNaN(value)) {
            return "Please enter a valid number.";
        }
        if (value <= MIN_AMOUNT) {
            return "Bill amount must be greater than zero.";
        }
        if (value > MAX_AMOUNT) {
            return `Bill amount cannot exceed $${MAX_AMOUNT.toLocaleString()}.`;
        }
        return null;
    }

    return { parse, validate };
})();

export default BillInput;
