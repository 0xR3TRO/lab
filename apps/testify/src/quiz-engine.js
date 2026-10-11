/**
 * quiz-engine.js — Core quiz logic: state, navigation, answer checking
 */
import { loadQuestions, getCategoryMeta } from "./question-loader.js";
import {
    resetScore,
    addPoint,
    getScore,
    saveHighScore,
    getHighScore,
} from "./score-manager.js";
import { startTimer, stopTimer } from "./timer.js";
import { getPercentage } from "./utils.js";

const TIMER_SECONDS = 20;

let questions = [];
let currentIndex = 0;
let selectedAnswer = null;
let answered = false;
let currentCategory = null;
let timerEnabled = true;
let onUpdate = null; // callback to ui-controller

export function setUpdateCallback(cb) {
    onUpdate = cb;
}

export function setTimerEnabled(enabled) {
    timerEnabled = enabled;
}

export function isTimerEnabled() {
    return timerEnabled;
}

export async function startQuiz(categoryId) {
    currentCategory = categoryId;
    questions = await loadQuestions(categoryId);
    currentIndex = 0;
    selectedAnswer = null;
    answered = false;
    resetScore();
    emitUpdate();
}

export function getCurrentState() {
    const q = questions[currentIndex] || null;
    const meta = getCategoryMeta(currentCategory);
    const hs = currentCategory ? getHighScore(currentCategory) : null;

    return {
        category: currentCategory,
        categoryName: meta ? meta.name : "",
        question: q,
        currentIndex,
        totalQuestions: questions.length,
        score: getScore(),
        selectedAnswer,
        answered,
        isFinished: currentIndex >= questions.length,
        highScore: hs,
        percentage: getPercentage(getScore(), questions.length),
        timerEnabled,
        timerSeconds: TIMER_SECONDS,
    };
}

export function selectAnswer(index) {
    if (answered) return;
    selectedAnswer = index;
    answered = true;
    stopTimer();

    const q = questions[currentIndex];
    if (q && index === q.answer) {
        addPoint();
    }
    emitUpdate();
}

export function nextQuestion() {
    currentIndex++;
    selectedAnswer = null;
    answered = false;

    if (currentIndex >= questions.length) {
        stopTimer();
        saveHighScore(currentCategory, getScore(), questions.length);
    }
    emitUpdate();
}

export function getTimerConfig() {
    return { enabled: timerEnabled, seconds: TIMER_SECONDS };
}

function emitUpdate() {
    if (onUpdate) onUpdate(getCurrentState());
}
