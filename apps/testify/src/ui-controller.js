/**
 * ui-controller.js — Renders screens, handles DOM events, manages animations
 */
import { getCategories } from "./question-loader.js";
import {
    startQuiz,
    getCurrentState,
    selectAnswer,
    nextQuestion,
    setUpdateCallback,
    setTimerEnabled,
    isTimerEnabled,
    getTimerConfig,
} from "./quiz-engine.js";
import { startTimer, stopTimer } from "./timer.js";
import { getHighScore } from "./score-manager.js";
import { formatTime, getPercentage } from "./utils.js";

const app = document.getElementById("app");

export function init() {
    setUpdateCallback(handleStateUpdate);
    renderHome();
}

// ─── HOME SCREEN ───
function renderHome() {
    stopTimer();
    const categories = getCategories();
    const timerOn = isTimerEnabled();

    app.innerHTML = `
    <div class="screen home-screen fade-in">
      <div class="home-header">
        <img src="assets/logo.svg" alt="Testify Logo" class="logo" width="72" height="72">
        <h1>Testify</h1>
        <p class="subtitle">Interactive Quiz System</p>
      </div>
      <div class="timer-toggle">
        <label class="toggle-label">
          <span>⏱ Timer (${getTimerConfig().seconds}s per question)</span>
          <input type="checkbox" id="timer-check" ${timerOn ? "checked" : ""}>
          <span class="toggle-slider"></span>
        </label>
      </div>
      <div class="category-grid">
        ${categories
            .map((c) => {
                const hs = getHighScore(c.id);
                return `
          <button class="category-card" data-category="${c.id}">
            <span class="category-icon">${c.icon}</span>
            <h2>${c.name}</h2>
            <p>${c.description}</p>
            ${hs ? `<span class="high-score-badge">Best: ${hs.percentage}%</span>` : ""}
          </button>`;
            })
            .join("")}
      </div>
    </div>
  `;

    app.querySelectorAll(".category-card").forEach((btn) => {
        btn.addEventListener("click", () => {
            const id = btn.dataset.category;
            app.querySelector(".home-screen").classList.add("fade-out");
            setTimeout(() => startQuiz(id), 250);
        });
    });

    document.getElementById("timer-check").addEventListener("change", (e) => {
        setTimerEnabled(e.target.checked);
    });
}

// ─── STATE UPDATE HANDLER ───
function handleStateUpdate(state) {
    if (state.isFinished) {
        renderResults(state);
    } else {
        renderQuestion(state);
    }
}

// ─── QUESTION SCREEN ───
function renderQuestion(state) {
    const {
        question,
        currentIndex,
        totalQuestions,
        score,
        selectedAnswer,
        answered,
        categoryName,
        timerEnabled,
        timerSeconds,
    } = state;

    app.innerHTML = `
    <div class="screen quiz-screen fade-in">
      <div class="quiz-header">
        <span class="quiz-category">${categoryName}</span>
        <span class="quiz-progress">${currentIndex + 1} / ${totalQuestions}</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${(currentIndex / totalQuestions) * 100}%"></div>
      </div>
      ${timerEnabled ? '<div class="timer" id="timer-display">⏱ --</div>' : ""}
      <div class="question-text">${escapeHtml(question.question)}</div>
      <div class="options-list">
        ${question.options
            .map((opt, i) => {
                let cls = "option-btn";
                if (answered) {
                    if (i === question.answer) cls += " correct";
                    else if (i === selectedAnswer && i !== question.answer)
                        cls += " incorrect";
                }
                if (i === selectedAnswer) cls += " selected";
                return `<button class="${cls}" data-index="${i}" ${answered ? "disabled" : ""}>${escapeHtml(opt)}</button>`;
            })
            .join("")}
      </div>
      <div class="quiz-footer">
        <span class="score-display">Score: ${score}</span>
        <button class="btn-next" id="btn-next" ${!answered ? "disabled" : ""}>${currentIndex + 1 >= totalQuestions ? "See Results" : "Next"}</button>
      </div>
    </div>
  `;

    // Option click handlers
    app.querySelectorAll(".option-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            selectAnswer(parseInt(btn.dataset.index, 10));
        });
    });

    // Next button
    document.getElementById("btn-next").addEventListener("click", () => {
        app.querySelector(".quiz-screen").classList.add("fade-out");
        setTimeout(() => nextQuestion(), 200);
    });

    // Timer
    if (timerEnabled && !answered) {
        startTimer(
            timerSeconds,
            (sec) => {
                const el = document.getElementById("timer-display");
                if (el) {
                    el.textContent = `⏱ ${formatTime(sec)}`;
                    if (sec <= 5) el.classList.add("timer-warning");
                }
            },
            () => {
                selectAnswer(-1); // time expired, no answer selected
            },
        );
    }
}

// ─── RESULTS SCREEN ───
function renderResults(state) {
    const { score, totalQuestions, percentage, highScore, categoryName } =
        state;
    const isNewHigh =
        highScore &&
        highScore.percentage === percentage &&
        highScore.score === score;

    let emoji = "😢";
    if (percentage >= 90) emoji = "🏆";
    else if (percentage >= 70) emoji = "🎉";
    else if (percentage >= 50) emoji = "👍";
    else if (percentage >= 30) emoji = "🤔";

    app.innerHTML = `
    <div class="screen results-screen fade-in">
      <div class="results-header">
        <span class="results-emoji">${emoji}</span>
        <h2>Quiz Complete!</h2>
        <p class="results-category">${categoryName}</p>
      </div>
      <div class="results-score-ring">
        <svg viewBox="0 0 120 120" class="score-ring">
          <circle cx="60" cy="60" r="52" stroke="var(--ring-bg)" stroke-width="10" fill="none"/>
          <circle cx="60" cy="60" r="52" stroke="var(--ring-fg)" stroke-width="10" fill="none"
            stroke-dasharray="${2 * Math.PI * 52}"
            stroke-dashoffset="${2 * Math.PI * 52 * (1 - percentage / 100)}"
            stroke-linecap="round" transform="rotate(-90 60 60)"/>
        </svg>
        <div class="score-ring-text">
          <span class="score-ring-percent">${percentage}%</span>
          <span class="score-ring-detail">${score}/${totalQuestions}</span>
        </div>
      </div>
      ${highScore ? `<p class="high-score-info">🏅 Best Score: ${highScore.percentage}% (${highScore.score}/${highScore.total})</p>` : ""}
      ${isNewHigh ? '<p class="new-high-score">🎊 New High Score!</p>' : ""}
      <div class="results-actions">
        <button class="btn-primary" id="btn-retry">Retry Quiz</button>
        <button class="btn-secondary" id="btn-home">Back to Menu</button>
      </div>
    </div>
  `;

    document.getElementById("btn-retry").addEventListener("click", () => {
        app.querySelector(".results-screen").classList.add("fade-out");
        setTimeout(() => startQuiz(state.category), 250);
    });

    document.getElementById("btn-home").addEventListener("click", () => {
        app.querySelector(".results-screen").classList.add("fade-out");
        setTimeout(() => renderHome(), 250);
    });
}

function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
}
