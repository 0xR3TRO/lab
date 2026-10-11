/**
 * JSON ↔ XML Converter
 * Converts between JSON and XML strings using vanilla JS DOM parsing.
 *
 * @author  0xR3TRO <https://github.com/0xR3TRO>
 * @license MIT – Copyright (c) 2026 0xR3TRO
 */
const JsonXmlConverter = (() => {
    /** Validate JSON string */
    function validateJson(input) {
        try {
            JSON.parse(input);
            return { valid: true, error: null };
        } catch (e) {
            return { valid: false, error: e.message };
        }
    }

    /** Validate XML string */
    function validateXml(input) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(input, "application/xml");
        const err = doc.querySelector("parsererror");
        if (err) return { valid: false, error: err.textContent.split("\n")[0] };
        return { valid: true, error: null };
    }

    /* ── JSON → XML ────────────────────────────────────────────────── */
    function jsonToXml(input) {
        const v = validateJson(input);
        if (!v.valid) throw new Error(`Invalid JSON: ${v.error}`);
        const obj = JSON.parse(input);
        return (
            '<?xml version="1.0" encoding="UTF-8"?>\n' +
            _objToXml(obj, "root", 0)
        );
    }

    function _objToXml(obj, tagName, indent) {
        const pad = "  ".repeat(indent);
        if (obj === null || obj === undefined) {
            return `${pad}<${tagName}/>\n`;
        }
        if (Array.isArray(obj)) {
            let xml = `${pad}<${tagName}>\n`;
            for (const item of obj) {
                xml += _objToXml(item, "item", indent + 1);
            }
            xml += `${pad}</${tagName}>\n`;
            return xml;
        }
        if (typeof obj === "object") {
            let xml = `${pad}<${tagName}>\n`;
            for (const key of Object.keys(obj)) {
                const safeKey = _sanitizeTag(key);
                xml += _objToXml(obj[key], safeKey, indent + 1);
            }
            xml += `${pad}</${tagName}>\n`;
            return xml;
        }
        // Primitive
        const escaped = _escapeXml(String(obj));
        return `${pad}<${tagName}>${escaped}</${tagName}>\n`;
    }

    function _sanitizeTag(name) {
        let tag = name.replace(/[^a-zA-Z0-9_.-]/g, "_");
        if (/^[^a-zA-Z_]/.test(tag)) tag = "_" + tag;
        return tag;
    }

    function _escapeXml(s) {
        return s
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&apos;");
    }

    /* ── XML → JSON ────────────────────────────────────────────────── */
    function xmlToJson(input) {
        const v = validateXml(input);
        if (!v.valid) throw new Error(`Invalid XML: ${v.error}`);
        const parser = new DOMParser();
        const doc = parser.parseFromString(input, "application/xml");
        const result = _xmlNodeToObj(doc.documentElement);
        return JSON.stringify(result, null, 2);
    }

    function _xmlNodeToObj(node) {
        // Text-only node
        if (node.children.length === 0) {
            const text = node.textContent.trim();
            return _autoCast(text);
        }

        const obj = {};
        for (const child of node.children) {
            const key = child.tagName;
            const val = _xmlNodeToObj(child);

            if (obj.hasOwnProperty(key)) {
                if (!Array.isArray(obj[key])) obj[key] = [obj[key]];
                obj[key].push(val);
            } else {
                obj[key] = val;
            }
        }
        return obj;
    }

    function _autoCast(v) {
        if (v === "") return null;
        if (v === "true") return true;
        if (v === "false") return false;
        if (/^-?\d+$/.test(v)) return parseInt(v, 10);
        if (/^-?\d+\.\d+$/.test(v)) return parseFloat(v);
        return v;
    }

    return { jsonToXml, xmlToJson, validateJson, validateXml };
})();
