/**
 * quote-engine.js — Core quote loading and selection logic
 */

import { getRandomItem } from "./utils.js";
import { applyFilters } from "./quote-filter.js";

const CATEGORIES = ["general", "success", "mindfulness", "creativity"];
let allQuotes = [];
let lastQuote = null;

export async function loadQuotes() {
    allQuotes = [];

    const fetches = CATEGORIES.map(async (cat) => {
        try {
            const res = await fetch(`data/${cat}.json`);
            const data = await res.json();
            return data.map((q) => ({ ...q, _category: cat }));
        } catch {
            console.warn(`Failed to load data/${cat}.json`);
            return [];
        }
    });

    const results = await Promise.all(fetches);
    allQuotes = results.flat();
    return allQuotes;
}

export function getAllQuotes() {
    return allQuotes;
}

export function getCategories() {
    return CATEGORIES;
}

export function getRandomQuote(filters = {}) {
    let pool = applyFilters(allQuotes, filters);

    // Fallback to general category if no results
    if (pool.length === 0) {
        pool = allQuotes.filter((q) => q._category === "general");
    }
    // Fallback to all quotes
    if (pool.length === 0) {
        pool = allQuotes;
    }

    // Avoid repeating the same quote
    if (pool.length > 1 && lastQuote) {
        pool = pool.filter((q) => q.text !== lastQuote.text);
    }

    const quote = getRandomItem(pool);
    lastQuote = quote;
    return quote;
}

export function getAllTags() {
    const tagSet = new Set();
    allQuotes.forEach((q) => q.tags.forEach((t) => tagSet.add(t)));
    return [...tagSet].sort();
}
