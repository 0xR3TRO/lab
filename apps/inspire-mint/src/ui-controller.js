/**
 * ui-controller.js — DOM manipulation, rendering, animations, and event handling
 */

import {
    loadQuotes,
    getRandomQuote,
    getCategories,
    getAllTags,
} from "./quote-engine.js";
import { initTheme, toggleTheme } from "./theme.js";
import { debounce } from "./utils.js";

let currentFilters = {
    category: "all",
    tags: [],
    keywords: "",
};

export async function initApp() {
    initTheme();
    await loadQuotes();
    buildCustomizePanel();
    bindEvents();
    generateAndDisplay();
}

function bindEvents() {
    document
        .getElementById("btn-generate")
        .addEventListener("click", generateAndDisplay);
    document.getElementById("theme-toggle").addEventListener("click", () => {
        toggleTheme();
    });
    document
        .getElementById("btn-customize-toggle")
        .addEventListener("click", toggleCustomizePanel);

    const keywordInput = document.getElementById("keyword-input");
    if (keywordInput) {
        keywordInput.addEventListener(
            "input",
            debounce((e) => {
                currentFilters.keywords = e.target.value;
            }, 300),
        );
    }
}

function toggleCustomizePanel() {
    const panel = document.getElementById("customize-panel");
    const btn = document.getElementById("btn-customize-toggle");
    const isOpen = panel.classList.toggle("open");
    btn.setAttribute("aria-expanded", isOpen);
}

function buildCustomizePanel() {
    const categories = getCategories();
    const tags = getAllTags();

    // Category buttons
    const categoryContainer = document.getElementById("category-options");
    categoryContainer.innerHTML = "";

    const allBtn = createChip("all", "All", true);
    allBtn.addEventListener("click", () => selectCategory("all"));
    categoryContainer.appendChild(allBtn);

    categories.forEach((cat) => {
        const chip = createChip(cat, capitalize(cat), false);
        chip.addEventListener("click", () => selectCategory(cat));
        categoryContainer.appendChild(chip);
    });

    // Tag buttons
    const tagContainer = document.getElementById("tag-options");
    tagContainer.innerHTML = "";
    tags.forEach((tag) => {
        const chip = createChip(tag, tag, false, "tag");
        chip.addEventListener("click", () => toggleTag(tag, chip));
        tagContainer.appendChild(chip);
    });
}

function createChip(value, label, active, type = "category") {
    const btn = document.createElement("button");
    btn.className = `chip ${type}-chip${active ? " active" : ""}`;
    btn.dataset.value = value;
    btn.textContent = label;
    btn.type = "button";
    return btn;
}

function selectCategory(category) {
    currentFilters.category = category;
    document.querySelectorAll(".category-chip").forEach((chip) => {
        chip.classList.toggle("active", chip.dataset.value === category);
    });
}

function toggleTag(tag, chipEl) {
    const idx = currentFilters.tags.indexOf(tag);
    if (idx > -1) {
        currentFilters.tags.splice(idx, 1);
        chipEl.classList.remove("active");
    } else {
        currentFilters.tags.push(tag);
        chipEl.classList.add("active");
    }
}

function generateAndDisplay() {
    const quote = getRandomQuote(currentFilters);
    if (!quote) return;
    renderQuote(quote);
}

function renderQuote(quote) {
    const card = document.getElementById("quote-card");
    const textEl = document.getElementById("quote-text");
    const authorEl = document.getElementById("quote-author");

    // Fade out
    card.classList.remove("fade-in");
    card.classList.add("fade-out");

    setTimeout(() => {
        textEl.textContent = quote.text;
        authorEl.textContent = quote.author ? `— ${quote.author}` : "";

        // Fade in
        card.classList.remove("fade-out");
        card.classList.add("fade-in");
    }, 300);
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
