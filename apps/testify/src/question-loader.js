/**
 * question-loader.js — Load and optionally shuffle quiz questions from JSON
 */
import { shuffleArray } from "./utils.js";

const quizMeta = {
    general: {
        name: "General Knowledge",
        description: "Test your knowledge on geography, history, and more.",
        icon: "🌍",
        file: "data/general.json",
    },
    science: {
        name: "Science",
        description: "Explore questions about physics, biology, and chemistry.",
        icon: "🔬",
        file: "data/science.json",
    },
    technology: {
        name: "Technology",
        description: "How well do you know computers, the internet, and tech?",
        icon: "💻",
        file: "data/technology.json",
    },
};

export function getCategories() {
    return Object.entries(quizMeta).map(([id, meta]) => ({ id, ...meta }));
}

export function getCategoryMeta(categoryId) {
    return quizMeta[categoryId] || null;
}

export async function loadQuestions(categoryId, shuffle = true) {
    const meta = quizMeta[categoryId];
    if (!meta) throw new Error(`Unknown category: ${categoryId}`);

    const response = await fetch(meta.file);
    if (!response.ok)
        throw new Error(`Failed to load questions for ${categoryId}`);

    const questions = await response.json();
    return shuffle ? shuffleArray(questions) : questions;
}
