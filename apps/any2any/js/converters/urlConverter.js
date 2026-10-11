/**
 * URL Encode / Decode Converter
 *
 * @author  0xR3TRO <https://github.com/0xR3TRO>
 * @license MIT – Copyright (c) 2026 0xR3TRO
 */
const UrlConverter = (() => {
    /** Encode text for URL */
    function encode(input) {
        if (input === undefined || input === null)
            throw new Error("No input provided");
        try {
            return encodeURIComponent(input);
        } catch (e) {
            throw new Error(`URL encoding failed: ${e.message}`);
        }
    }

    /** Decode URL-encoded text */
    function decode(input) {
        if (!input && input !== "") throw new Error("No input provided");
        try {
            return decodeURIComponent(input.replace(/\+/g, " "));
        } catch (e) {
            throw new Error(
                `URL decoding failed: ${e.message}. The input may contain invalid percent-encoded sequences.`,
            );
        }
    }

    return { encode, decode };
})();
