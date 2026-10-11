/**
 * HTML Entity Encode / Decode Converter
 *
 * @author  0xR3TRO <https://github.com/0xR3TRO>
 * @license MIT – Copyright (c) 2026 0xR3TRO
 */
const HtmlEntityConverter = (() => {
    const ENTITIES = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
    };

    const REVERSE_ENTITIES = {
        "&amp;": "&",
        "&lt;": "<",
        "&gt;": ">",
        "&quot;": '"',
        "&#39;": "'",
        "&apos;": "'",
        "&#x27;": "'",
        "&#x2F;": "/",
        "&nbsp;": " ",
    };

    /** Encode raw HTML characters to entities */
    function encode(input) {
        if (input === undefined || input === null)
            throw new Error("No input provided");
        return input.replace(/[&<>"']/g, (ch) => ENTITIES[ch] || ch);
    }

    /** Decode HTML entities back to characters */
    function decode(input) {
        if (input === undefined || input === null)
            throw new Error("No input provided");
        // Use DOM for decoding – handles all named & numeric entities
        const el = document.createElement("textarea");
        el.innerHTML = input;
        return el.value;
    }

    return { encode, decode };
})();
