/**
 * CSV ↔ JSON Converter
 * Handles CSV parsing with quoted fields, newlines in quotes, etc.
 *
 * @author  0xR3TRO <https://github.com/0xR3TRO>
 * @license MIT – Copyright (c) 2026 0xR3TRO
 */
const CsvJsonConverter = (() => {
    /** Parse CSV string into array of objects (first row = headers) */
    function _parseCsv(text) {
        const rows = [];
        let current = [];
        let field = "";
        let inQuotes = false;
        let i = 0;

        while (i < text.length) {
            const ch = text[i];
            if (inQuotes) {
                if (ch === '"') {
                    if (i + 1 < text.length && text[i + 1] === '"') {
                        field += '"';
                        i += 2;
                    } else {
                        inQuotes = false;
                        i++;
                    }
                } else {
                    field += ch;
                    i++;
                }
            } else {
                if (ch === '"') {
                    inQuotes = true;
                    i++;
                } else if (ch === ",") {
                    current.push(field);
                    field = "";
                    i++;
                } else if (ch === "\r") {
                    i++;
                } else if (ch === "\n") {
                    current.push(field);
                    field = "";
                    rows.push(current);
                    current = [];
                    i++;
                } else {
                    field += ch;
                    i++;
                }
            }
        }
        // Last field
        if (field || current.length > 0) {
            current.push(field);
            rows.push(current);
        }
        return rows;
    }

    /** Validate CSV – at least 2 rows (header + data), consistent columns */
    function validateCsv(input) {
        if (!input.trim()) return { valid: false, error: "Empty input" };
        const rows = _parseCsv(input.trim());
        if (rows.length < 2)
            return {
                valid: false,
                error: "CSV must have at least a header row and one data row",
            };
        const headerLen = rows[0].length;
        for (let i = 1; i < rows.length; i++) {
            if (rows[i].length !== headerLen) {
                return {
                    valid: false,
                    error: `Row ${i + 1} has ${rows[i].length} columns, expected ${headerLen}`,
                };
            }
        }
        return { valid: true, error: null };
    }

    /** Validate JSON – must be an array of objects */
    function validateJsonArray(input) {
        try {
            const obj = JSON.parse(input);
            if (!Array.isArray(obj))
                return {
                    valid: false,
                    error: "JSON must be an array of objects",
                };
            if (obj.length === 0)
                return { valid: false, error: "JSON array is empty" };
            if (typeof obj[0] !== "object" || obj[0] === null)
                return {
                    valid: false,
                    error: "JSON array items must be objects",
                };
            return { valid: true, error: null };
        } catch (e) {
            return { valid: false, error: e.message };
        }
    }

    /** CSV → JSON */
    function csvToJson(input) {
        const v = validateCsv(input);
        if (!v.valid) throw new Error(`Invalid CSV: ${v.error}`);
        const rows = _parseCsv(input.trim());
        const headers = rows[0].map((h) => h.trim());
        const result = [];
        for (let i = 1; i < rows.length; i++) {
            const obj = {};
            for (let j = 0; j < headers.length; j++) {
                const val = rows[i][j] !== undefined ? rows[i][j].trim() : "";
                obj[headers[j]] = _autoCast(val);
            }
            result.push(obj);
        }
        return JSON.stringify(result, null, 2);
    }

    /** JSON → CSV */
    function jsonToCsv(input) {
        const v = validateJsonArray(input);
        if (!v.valid) throw new Error(`Invalid JSON: ${v.error}`);
        const arr = JSON.parse(input);
        // Collect all keys
        const keysSet = new Set();
        for (const obj of arr) {
            for (const k of Object.keys(obj)) keysSet.add(k);
        }
        const headers = Array.from(keysSet);
        const lines = [headers.map((h) => _csvEscape(h)).join(",")];
        for (const obj of arr) {
            const row = headers.map((h) => {
                const val = obj[h] !== undefined ? String(obj[h]) : "";
                return _csvEscape(val);
            });
            lines.push(row.join(","));
        }
        return lines.join("\n");
    }

    function _csvEscape(val) {
        if (val.includes(",") || val.includes('"') || val.includes("\n")) {
            return `"${val.replace(/"/g, '""')}"`;
        }
        return val;
    }

    function _autoCast(v) {
        if (v === "") return "";
        if (v === "true") return true;
        if (v === "false") return false;
        if (/^-?\d+$/.test(v) && v.length < 16) return parseInt(v, 10);
        if (/^-?\d+\.\d+$/.test(v)) return parseFloat(v);
        return v;
    }

    return { csvToJson, jsonToCsv, validateCsv, validateJsonArray };
})();
