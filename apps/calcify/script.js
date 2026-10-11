/* ==========================================================================
   Calcify — Script
   Modular calculator logic: utils, calculator-engine, display-controller,
   theme-switcher, input-handler.
   ========================================================================== */

(() => {
    "use strict";

    /* ========================================================================
     Module: Utils
     Validation helpers and number formatting.
     ======================================================================== */
    const Utils = (() => {
        const OPERATORS = ["+", "−", "×", "÷"];

        function isOperator(char) {
            return OPERATORS.includes(char);
        }

        function lastChar(str) {
            return str[str.length - 1];
        }

        function formatNumber(num) {
            if (!Number.isFinite(num)) return String(num);
            // Limit to 12 significant digits to avoid floating-point noise
            const str = parseFloat(num.toPrecision(12)).toString();
            return str;
        }

        function hasMultipleDots(segment) {
            return (segment.match(/\./g) || []).length > 1;
        }

        /** Return the current "number segment" — the portion after the last operator. */
        function currentSegment(expression) {
            let seg = "";
            for (let i = expression.length - 1; i >= 0; i--) {
                if (isOperator(expression[i])) break;
                seg = expression[i] + seg;
            }
            return seg;
        }

        return {
            OPERATORS,
            isOperator,
            lastChar,
            formatNumber,
            hasMultipleDots,
            currentSegment,
        };
    })();

    /* ========================================================================
     Module: CalculatorEngine
     Core arithmetic: parse expression string, evaluate, handle errors.
     ======================================================================== */
    const CalculatorEngine = (() => {
        /**
         * Tokenize an expression string into numbers and operators.
         * Handles negative leading numbers like "−5+3".
         */
        function tokenize(expr) {
            const tokens = [];
            let num = "";

            for (let i = 0; i < expr.length; i++) {
                const ch = expr[i];

                if (Utils.isOperator(ch)) {
                    // Allow leading minus or minus after another operator (e.g. "5×−3")
                    if (
                        ch === "−" &&
                        (i === 0 || Utils.isOperator(expr[i - 1]))
                    ) {
                        num += "-";
                    } else {
                        if (num !== "") tokens.push(parseFloat(num));
                        num = "";
                        tokens.push(ch);
                    }
                } else {
                    num += ch;
                }
            }
            if (num !== "") tokens.push(parseFloat(num));
            return tokens;
        }

        /** Evaluate a flat token list respecting operator precedence. */
        function evaluate(tokens) {
            // First pass: × and ÷
            let i = 0;
            while (i < tokens.length) {
                if (tokens[i] === "×" || tokens[i] === "÷") {
                    const left = tokens[i - 1];
                    const right = tokens[i + 1];
                    if (right === undefined || left === undefined)
                        return { error: "Error" };
                    let result;
                    if (tokens[i] === "×") {
                        result = left * right;
                    } else {
                        if (right === 0)
                            return { error: "Cannot divide by zero" };
                        result = left / right;
                    }
                    tokens.splice(i - 1, 3, result);
                } else {
                    i++;
                }
            }

            // Second pass: + and −
            i = 0;
            while (i < tokens.length) {
                if (tokens[i] === "+" || tokens[i] === "−") {
                    const left = tokens[i - 1];
                    const right = tokens[i + 1];
                    if (right === undefined || left === undefined)
                        return { error: "Error" };
                    const result =
                        tokens[i] === "+" ? left + right : left - right;
                    tokens.splice(i - 1, 3, result);
                } else {
                    i++;
                }
            }

            if (tokens.length !== 1 || typeof tokens[0] !== "number")
                return { error: "Error" };
            return { value: tokens[0] };
        }

        /** Public: compute the result from an expression string. */
        function compute(expression) {
            if (!expression || expression.trim() === "")
                return { error: "Error" };
            const tokens = tokenize(expression);
            return evaluate(tokens);
        }

        return { compute };
    })();

    /* ========================================================================
     Module: DisplayController
     Updates the calculator screen elements.
     ======================================================================== */
    const DisplayController = (() => {
        const equationEl = document.getElementById("equation");
        const valueEl = document.getElementById("displayValue");

        function setEquation(text) {
            equationEl.textContent = text || "\u00A0"; // non-breaking space if empty
        }

        function setValue(text) {
            valueEl.textContent = text;
        }

        function getEquation() {
            const t = equationEl.textContent.trim();
            return t === "" || t === "\u00A0" ? "" : t;
        }

        function getValue() {
            return valueEl.textContent;
        }

        return { setEquation, setValue, getEquation, getValue };
    })();

    /* ========================================================================
     Module: ThemeSwitcher
     Light/dark mode with localStorage persistence.
     ======================================================================== */
    const ThemeSwitcher = (() => {
        const STORAGE_KEY = "calcify-theme";
        const toggleBtn = document.getElementById("themeToggle");
        const iconEl = document.getElementById("themeIcon");
        const LIGHT_ICON = "\u263E"; // ☾
        const DARK_ICON = "\u2600"; // ☀

        function apply(theme) {
            document.documentElement.setAttribute("data-theme", theme);
            iconEl.textContent = theme === "dark" ? DARK_ICON : LIGHT_ICON;
        }

        function toggle() {
            const current = document.documentElement.getAttribute("data-theme");
            const next = current === "dark" ? "light" : "dark";
            apply(next);
            try {
                localStorage.setItem(STORAGE_KEY, next);
            } catch (_) {
                /* storage unavailable */
            }
        }

        function init() {
            let saved;
            try {
                saved = localStorage.getItem(STORAGE_KEY);
            } catch (_) {
                /* storage unavailable */
            }
            const preferred =
                saved ||
                (window.matchMedia("(prefers-color-scheme: dark)").matches
                    ? "dark"
                    : "light");
            apply(preferred);
            toggleBtn.addEventListener("click", toggle);
        }

        return { init };
    })();

    /* ========================================================================
     Module: InputHandler
     Manages button clicks, keyboard input, and calculator state.
     ======================================================================== */
    const InputHandler = (() => {
        let expression = "";
        let justEvaluated = false;

        function popAnimation(btn) {
            btn.classList.remove("btn--pop");
            // Trigger reflow to restart animation
            void btn.offsetWidth;
            btn.classList.add("btn--pop");
        }

        function updateDisplay() {
            DisplayController.setEquation(expression || "\u00A0");
            // Show current value — the "live" last number segment or result
            if (expression === "") {
                DisplayController.setValue("0");
            }
        }

        function appendDigit(digit) {
            if (justEvaluated) {
                // After pressing =, start a new expression if a digit is typed
                expression = "";
                justEvaluated = false;
            }

            // Prevent multiple leading zeros
            const seg = Utils.currentSegment(expression);
            if (seg === "0" && digit === "0") return;
            if (seg === "0" && digit !== ".") {
                // Replace leading zero with the digit
                expression = expression.slice(0, -1);
            }

            // Prevent multiple dots in one number
            if (digit === ".") {
                if (seg.includes(".")) return;
                // Auto-prepend 0 if segment is empty
                if (seg === "") expression += "0";
            }

            expression += digit;
            updateDisplay();
            DisplayController.setValue(expression);
        }

        function appendOperator(op) {
            if (expression === "" && op !== "−") return;
            // Allow leading minus
            if (expression === "" && op === "−") {
                expression = "−";
                updateDisplay();
                DisplayController.setValue(expression);
                return;
            }

            if (justEvaluated) {
                justEvaluated = false;
            }

            const last = Utils.lastChar(expression);

            // Replace last operator if user presses another (except allow double minus for negative)
            if (Utils.isOperator(last)) {
                expression = expression.slice(0, -1);
            }

            expression += op;
            updateDisplay();
            DisplayController.setValue(expression);
        }

        function clear() {
            expression = "";
            justEvaluated = false;
            DisplayController.setEquation("\u00A0");
            DisplayController.setValue("0");
        }

        function deleteLast() {
            if (justEvaluated) {
                clear();
                return;
            }
            expression = expression.slice(0, -1);
            updateDisplay();
            DisplayController.setValue(expression || "0");
        }

        function equals() {
            if (expression === "") return;
            // Strip trailing operator
            let expr = expression;
            while (expr.length && Utils.isOperator(Utils.lastChar(expr))) {
                expr = expr.slice(0, -1);
            }
            if (expr === "") return;

            const result = CalculatorEngine.compute(expr);
            if (result.error) {
                DisplayController.setEquation(expression + " =");
                DisplayController.setValue(result.error);
                expression = "";
                justEvaluated = true;
                return;
            }

            const formatted = Utils.formatNumber(result.value);
            DisplayController.setEquation(expression + " =");
            DisplayController.setValue(formatted);
            // Let user continue from the result
            expression = formatted;
            justEvaluated = true;
        }

        /* ---- Button Click Handler ---- */
        function handleButton(e) {
            const btn = e.target.closest(".btn");
            if (!btn) return;

            popAnimation(btn);

            const digit = btn.dataset.digit;
            const operator = btn.dataset.operator;
            const action = btn.dataset.action;

            if (digit !== undefined) appendDigit(digit);
            else if (operator) appendOperator(operator);
            else if (action === "clear") clear();
            else if (action === "delete") deleteLast();
            else if (action === "equals") equals();
        }

        /* ---- Keyboard Handler ---- */
        const KEY_MAP = {
            0: "0",
            1: "1",
            2: "2",
            3: "3",
            4: "4",
            5: "5",
            6: "6",
            7: "7",
            8: "8",
            9: "9",
            ".": ".",
        };

        const OP_MAP = {
            "+": "+",
            "-": "−",
            "*": "×",
            x: "×",
            X: "×",
            "/": "÷",
        };

        function handleKey(e) {
            const key = e.key;

            if (KEY_MAP[key] !== undefined) {
                e.preventDefault();
                appendDigit(KEY_MAP[key]);
            } else if (OP_MAP[key]) {
                e.preventDefault();
                appendOperator(OP_MAP[key]);
            } else if (key === "Enter" || key === "=") {
                e.preventDefault();
                equals();
            } else if (key === "Backspace") {
                e.preventDefault();
                deleteLast();
            } else if (key === "Escape" || key === "c" || key === "C") {
                e.preventDefault();
                clear();
            }
        }

        /* ---- Init ---- */
        function init() {
            document
                .querySelector(".buttons")
                .addEventListener("click", handleButton);
            document.addEventListener("keydown", handleKey);
        }

        return { init };
    })();

    /* ========================================================================
     Bootstrap
     ======================================================================== */
    document.addEventListener("DOMContentLoaded", () => {
        ThemeSwitcher.init();
        InputHandler.init();
    });
})();
