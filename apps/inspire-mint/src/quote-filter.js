/**
 * quote-filter.js — Filtering logic for quotes
 */

import { normalizeText } from "./utils.js";

export function filterByCategory(quotes, category) {
    if (!category || category === "all") return quotes;
    return quotes.filter((q) => q._category === category);
}

export function filterByTags(quotes, tags) {
    if (!tags || tags.length === 0) return quotes;
    const normalizedTags = tags.map((t) => normalizeText(t));
    return quotes.filter((q) =>
        q.tags.some((tag) => normalizedTags.includes(normalizeText(tag))),
    );
}

export function filterByKeywords(quotes, keywords) {
    if (!keywords || keywords.trim() === "") return quotes;
    const words = keywords
        .split(/[,\s]+/)
        .map((w) => normalizeText(w))
        .filter((w) => w.length > 0);

    if (words.length === 0) return quotes;

    return quotes.filter((q) => {
        const text = normalizeText(q.text);
        const author = normalizeText(q.author || "");
        const tags = q.tags.map((t) => normalizeText(t));
        return words.some(
            (w) =>
                text.includes(w) ||
                author.includes(w) ||
                tags.some((tag) => tag.includes(w)),
        );
    });
}

export function applyFilters(quotes, { category, tags, keywords }) {
    let result = filterByCategory(quotes, category);
    result = filterByTags(result, tags);
    result = filterByKeywords(result, keywords);
    return result;
}
