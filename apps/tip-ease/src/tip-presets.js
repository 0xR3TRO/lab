/**
 * Tip Presets Module
 * Manages the predefined tip percentages and custom tip input.
 */

const TipPresets = (() => {
    const DEFAULT_PRESETS = [10, 12, 15, 20];

    let presets = [...DEFAULT_PRESETS];
    let activePercent = null;
    let isCustom = false;

    function getPresets() {
        return [...presets];
    }

    function setPresets(values) {
        if (Array.isArray(values) && values.length > 0) {
            presets = values
                .map(Number)
                .filter((v) => !Number.isNaN(v) && v >= 0 && v <= 100);
        }
    }

    function select(percent) {
        activePercent = percent;
        isCustom = false;
    }

    function selectCustom(percent) {
        const value = parseFloat(percent);
        if (Number.isNaN(value) || value < 0 || value > 100) return null;
        activePercent = Math.round(value * 100) / 100;
        isCustom = true;
        return activePercent;
    }

    function getActive() {
        return activePercent;
    }

    function getIsCustom() {
        return isCustom;
    }

    function reset() {
        activePercent = null;
        isCustom = false;
    }

    return {
        getPresets,
        setPresets,
        select,
        selectCustom,
        getActive,
        getIsCustom,
        reset,
    };
})();

export default TipPresets;
