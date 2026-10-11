/**
 * Base64 Encode / Decode Converter
 * Supports text ↔ Base64 with UTF-8 handling.
 *
 * @author  0xR3TRO <https://github.com/0xR3TRO>
 * @license MIT – Copyright (c) 2026 0xR3TRO
 */
const Base64Converter = (() => {
    /** Validate Base64 string */
    function validateBase64(input) {
        if (!input.trim()) return { valid: false, error: "Empty input" };
        // Remove whitespace for validation
        const cleaned = input.replace(/\s/g, "");
        if (!/^[A-Za-z0-9+/]*={0,2}$/.test(cleaned)) {
            return {
                valid: false,
                error: "Input contains invalid Base64 characters",
            };
        }
        if (cleaned.length % 4 !== 0) {
            return {
                valid: false,
                error: "Invalid Base64 length (must be multiple of 4)",
            };
        }
        return { valid: true, error: null };
    }

    /** Encode text to Base64 (UTF-8 safe) */
    function encode(input) {
        if (!input && input !== "") throw new Error("No input provided");
        try {
            // Handle UTF-8 properly
            const bytes = new TextEncoder().encode(input);
            let binary = "";
            for (const byte of bytes) {
                binary += String.fromCharCode(byte);
            }
            return btoa(binary);
        } catch (e) {
            throw new Error(`Encoding failed: ${e.message}`);
        }
    }

    /** Decode Base64 to text (UTF-8 safe) */
    function decode(input) {
        const v = validateBase64(input);
        if (!v.valid) throw new Error(`Invalid Base64: ${v.error}`);
        try {
            const cleaned = input.replace(/\s/g, "");
            const binary = atob(cleaned);
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) {
                bytes[i] = binary.charCodeAt(i);
            }
            return new TextDecoder().decode(bytes);
        } catch (e) {
            throw new Error(`Decoding failed: ${e.message}`);
        }
    }

    return { encode, decode, validateBase64 };
})();
