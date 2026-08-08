(function initShapeSumState(root, factory) {
  const api = factory();

  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }

  if (root) {
    root.ShapeSumState = api;
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function createState() {
  "use strict";

  const STORAGE_VERSION = 1;
  const DIFFICULTIES = new Set([
    "all",
    "easy",
    "medium",
    "hard",
    "challenge",
    "expert",
  ]);
  const OPERATORS = new Set(["all", "add", "subtract"]);

  function createDefaultState() {
    return {
      version: STORAGE_VERSION,
      revealedIds: [],
      difficulty: "all",
      operator: "all",
      shuffled: false,
    };
  }

  function normalizeState(raw, validIds) {
    const defaults = createDefaultState();
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return defaults;
    if (raw.version !== undefined && raw.version !== STORAGE_VERSION) {
      return defaults;
    }

    const allowedIds = new Set(validIds);
    const revealedIds = Array.isArray(raw.revealedIds)
      ? [
          ...new Set(
            raw.revealedIds.filter(
              (id) => typeof id === "string" && allowedIds.has(id),
            ),
          ),
        ]
      : [];

    return {
      version: STORAGE_VERSION,
      revealedIds,
      difficulty: DIFFICULTIES.has(raw.difficulty)
        ? raw.difficulty
        : defaults.difficulty,
      operator: OPERATORS.has(raw.operator)
        ? raw.operator
        : defaults.operator,
      shuffled:
        typeof raw.shuffled === "boolean"
          ? raw.shuffled
          : defaults.shuffled,
    };
  }

  function toggleRevealed(state, questionId) {
    const isRevealed = state.revealedIds.includes(questionId);
    const revealedIds = isRevealed
      ? state.revealedIds.filter((id) => id !== questionId)
      : [...state.revealedIds, questionId];

    return { ...state, revealedIds };
  }

  function filterQuestions(questions, filters = {}) {
    const difficulty = DIFFICULTIES.has(filters.difficulty)
      ? filters.difficulty
      : "all";
    const operator = OPERATORS.has(filters.operator)
      ? filters.operator
      : "all";

    return questions.filter(
      (question) =>
        (difficulty === "all" || question.difficulty === difficulty) &&
        (operator === "all" || question.operator === operator),
    );
  }

  function calculateProgress(questions, revealedIds) {
    const questionIds = new Set(questions.map((question) => question.id));
    const explored = new Set(revealedIds.filter((id) => questionIds.has(id)))
      .size;
    const total = questions.length;

    return {
      explored,
      total,
      percent: total === 0 ? 0 : Math.round((explored / total) * 100),
    };
  }

  return Object.freeze({
    STORAGE_VERSION,
    createDefaultState,
    normalizeState,
    toggleRevealed,
    filterQuestions,
    calculateProgress,
  });
});
