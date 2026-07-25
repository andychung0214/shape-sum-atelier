(function startShapeSumAtelier() {
  "use strict";

  const STORAGE_KEY = "shape-sum-atelier-state-v1";
  const core = window.ShapeSumCore;
  const stateApi = window.ShapeSumState;

  const difficultyLabels = {
    easy: "初階",
    medium: "中階",
    hard: "進階",
    challenge: "挑戰",
  };

  const operatorLabels = {
    add: "加法",
    subtract: "減法",
  };

  const elements = {
    grid: document.querySelector("#question-grid"),
    empty: document.querySelector("#empty-state"),
    message: document.querySelector("#app-message"),
    difficulty: document.querySelector("#difficulty-filter"),
    operator: document.querySelector("#operator-filter"),
    shuffle: document.querySelector("#shuffle-button"),
    reset: document.querySelector("#reset-button"),
    showAll: document.querySelector("#show-all-button"),
    visibleCount: document.querySelector("#visible-count"),
    exploredCount: document.querySelector("#explored-count"),
    progressPercent: document.querySelector("#progress-percent"),
    progressBar: document.querySelector('[role="progressbar"]'),
    progressFill: document.querySelector("#progress-fill"),
  };

  let state = loadState();
  let displayedQuestions = [];

  function loadState() {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      const parsed = stored ? JSON.parse(stored) : null;
      return stateApi.normalizeState(
        parsed,
        core.QUESTIONS.map((question) => question.id),
      );
    } catch (_error) {
      return stateApi.createDefaultState();
    }
  }

  function persistState() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (_error) {
      // 私密瀏覽或 file:// 可能停用儲存；當次操作仍保持可用。
    }
  }

  function stableRank(id) {
    let hash = 2166136261;
    for (const character of id) {
      hash ^= character.charCodeAt(0);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  function getDisplayedQuestions() {
    const filtered = stateApi.filterQuestions(core.QUESTIONS, state);
    if (!state.shuffled) return filtered;
    return [...filtered].sort(
      (left, right) => stableRank(left.id) - stableRank(right.id),
    );
  }

  function renderQuestion(question, displayIndex) {
    const questionNumber =
      core.QUESTIONS.findIndex((item) => item.id === question.id) + 1;
    const isRevealed = state.revealedIds.includes(question.id);
    const operatorSymbol = question.operator === "add" ? "+" : "−";
    const actionLabel = isRevealed ? "收起" : "揭曉";
    const expanded = String(isRevealed);

    return `
      <article class="question-card" data-question-id="${question.id}">
        <header class="question-card__meta">
          <span>第 ${String(questionNumber).padStart(2, "0")} 題</span>
          <span>${difficultyLabels[question.difficulty]} · ${operatorLabels[question.operator]}</span>
        </header>
        <div class="equation" role="group" aria-label="第 ${questionNumber} 題，${operatorLabels[question.operator]}圖形題">
          <div class="shape-box shape-box--problem">
            ${core.renderShape(question.left, { label: "左側圖形" })}
          </div>
          <span class="operator" aria-hidden="true">${operatorSymbol}</span>
          <div class="shape-box shape-box--problem">
            ${core.renderShape(question.right, { label: "右側圖形" })}
          </div>
          <span class="operator" aria-hidden="true">＝</span>
          <button
            class="answer-flip"
            type="button"
            data-question-id="${question.id}"
            aria-expanded="${expanded}"
            aria-label="${actionLabel}第 ${questionNumber} 題答案"
          >
            <span class="answer-flip__inner">
              <span
                class="answer-flip__face answer-flip__front"
                aria-hidden="${isRevealed}"
              >
                <span class="question-mark" aria-hidden="true">？</span>
                <small>${actionLabel}</small>
              </span>
              <span
                class="answer-flip__face answer-flip__back"
                aria-hidden="${!isRevealed}"
              >
                ${core.renderShape(question.answer, { label: `第 ${questionNumber} 題答案圖形` })}
              </span>
            </span>
          </button>
        </div>
        <p class="question-card__hint">練習紙上的第 ${displayIndex + 1} 題</p>
      </article>
    `;
  }

  function updateProgress() {
    const progress = stateApi.calculateProgress(
      displayedQuestions,
      state.revealedIds,
    );
    elements.visibleCount.textContent = String(progress.total);
    elements.exploredCount.textContent = String(progress.explored);
    elements.progressPercent.textContent = String(progress.percent);
    elements.progressBar.setAttribute("aria-valuenow", String(progress.percent));
    elements.progressFill.style.width = `${progress.percent}%`;
  }

  function render() {
    displayedQuestions = getDisplayedQuestions();
    elements.grid.innerHTML = displayedQuestions
      .map(renderQuestion)
      .join("");
    elements.empty.hidden = displayedQuestions.length !== 0;
    elements.grid.hidden = displayedQuestions.length === 0;
    elements.difficulty.value = state.difficulty;
    elements.operator.value = state.operator;
    elements.shuffle.setAttribute("aria-pressed", String(state.shuffled));
    elements.shuffle.textContent = state.shuffled ? "回到原順序" : "換個順序";
    updateProgress();
  }

  function setFlipState(button, isRevealed) {
    const questionId = button.dataset.questionId;
    const questionNumber =
      core.QUESTIONS.findIndex((question) => question.id === questionId) + 1;
    const actionLabel = isRevealed ? "收起" : "揭曉";
    const front = button.querySelector(".answer-flip__front");
    const back = button.querySelector(".answer-flip__back");
    const frontAction = button.querySelector(".answer-flip__front small");

    button.setAttribute("aria-expanded", String(isRevealed));
    button.setAttribute(
      "aria-label",
      `${actionLabel}第 ${questionNumber} 題答案`,
    );
    front.setAttribute("aria-hidden", String(isRevealed));
    back.setAttribute("aria-hidden", String(!isRevealed));
    frontAction.textContent = actionLabel;
  }

  function updateFilters() {
    state = {
      ...state,
      difficulty: elements.difficulty.value,
      operator: elements.operator.value,
    };
    persistState();
    render();
  }

  function showFatalError(errors) {
    elements.message.hidden = false;
    elements.message.textContent = `題庫暫時無法顯示：${errors.join("；")}`;
    elements.grid.hidden = true;
  }

  elements.grid.addEventListener("click", (event) => {
    const button = event.target.closest(".answer-flip");
    if (!button) return;

    state = stateApi.toggleRevealed(state, button.dataset.questionId);
    const isRevealed = state.revealedIds.includes(button.dataset.questionId);
    setFlipState(button, isRevealed);
    persistState();
    updateProgress();
  });

  elements.difficulty.addEventListener("change", updateFilters);
  elements.operator.addEventListener("change", updateFilters);

  elements.shuffle.addEventListener("click", () => {
    state = { ...state, shuffled: !state.shuffled };
    persistState();
    render();
  });

  elements.showAll.addEventListener("click", () => {
    state = { ...state, difficulty: "all", operator: "all" };
    persistState();
    render();
  });

  elements.reset.addEventListener("click", () => {
    const confirmed = window.confirm(
      "要清除所有已看答案與篩選紀錄嗎？這個動作無法復原。",
    );
    if (!confirmed) return;

    state = stateApi.createDefaultState();
    persistState();
    render();
  });

  const validationErrors = core.validateBank(core.QUESTIONS);
  if (validationErrors.length > 0) {
    showFatalError(validationErrors);
  } else {
    render();
  }
})();
