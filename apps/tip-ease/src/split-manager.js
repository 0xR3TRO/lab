/**
 * Split Manager Module
 * Handles the number-of-people input for bill splitting.
 */

const SplitManager = (() => {
    const MIN_PEOPLE = 1;
    const MAX_PEOPLE = 100;

    let count = 1;

    function get() {
        return count;
    }

    function set(value) {
        const parsed = parseInt(value, 10);
        if (Number.isNaN(parsed) || parsed < MIN_PEOPLE) {
            count = MIN_PEOPLE;
        } else if (parsed > MAX_PEOPLE) {
            count = MAX_PEOPLE;
        } else {
            count = parsed;
        }
        return count;
    }

    function increment() {
        return set(count + 1);
    }

    function decrement() {
        return set(count - 1);
    }

    function validate(raw) {
        const parsed = parseInt(raw, 10);
        if (Number.isNaN(parsed) || parsed < MIN_PEOPLE) {
            return "Number of people must be at least 1.";
        }
        if (parsed > MAX_PEOPLE) {
            return `Number of people cannot exceed ${MAX_PEOPLE}.`;
        }
        return null;
    }

    function reset() {
        count = 1;
    }

    return {
        get,
        set,
        increment,
        decrement,
        validate,
        reset,
        MIN_PEOPLE,
        MAX_PEOPLE,
    };
})();

export default SplitManager;
