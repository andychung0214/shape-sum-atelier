(function initShapeSumCore(root, factory) {
  const api = factory();

  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }

  if (root) {
    root.ShapeSumCore = api;
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function createCore() {
  "use strict";

  const SEGMENTS = Object.freeze({
    top: "M 20 20 L 80 20",
    right: "M 80 20 L 80 80",
    bottom: "M 80 80 L 20 80",
    left: "M 20 80 L 20 20",
    middleH: "M 20 50 L 80 50",
    middleV: "M 50 20 L 50 80",
    diagDown: "M 20 20 L 80 80",
    diagUp: "M 80 20 L 20 80",
    roofLeft: "M 20 50 L 50 20",
    roofRight: "M 50 20 L 80 50",
    bowlLeft: "M 20 50 Q 20 80 50 80",
    bowlRight: "M 50 80 Q 80 80 80 50",
    arcLeft: "M 50 20 Q 20 20 20 50",
    arcRight: "M 50 20 Q 80 20 80 50",
    center: "M 42 50 A 8 8 0 1 0 58 50 A 8 8 0 1 0 42 50",
  });

  function combine(left, right, operator) {
    const rightSet = new Set(right);

    if (operator === "add") {
      return [...new Set([...left, ...right])];
    }

    if (operator === "subtract") {
      return left.filter((id) => !rightSet.has(id));
    }

    throw new Error(`不支援的運算：${operator}`);
  }

  const QUESTION_SPECS = [
    ["easy-add-01", "easy", "add", ["top"], ["left"]],
    ["easy-add-02", "easy", "add", ["bottom"], ["right"]],
    ["easy-add-03", "easy", "add", ["diagDown"], ["diagUp"]],
    ["easy-add-04", "easy", "add", ["roofLeft"], ["roofRight"]],
    ["easy-add-05", "easy", "add", ["arcLeft"], ["arcRight"]],
    ["easy-add-06", "easy", "add", ["bowlLeft"], ["bowlRight"]],
    ["easy-subtract-01", "easy", "subtract", ["top", "right"], ["top"]],
    ["easy-subtract-02", "easy", "subtract", ["bottom", "left"], ["left"]],
    ["easy-subtract-03", "easy", "subtract", ["diagDown", "diagUp"], ["diagUp"]],
    [
      "easy-subtract-04",
      "easy",
      "subtract",
      ["roofLeft", "roofRight"],
      ["roofLeft"],
    ],
    [
      "easy-subtract-05",
      "easy",
      "subtract",
      ["arcLeft", "arcRight"],
      ["arcRight"],
    ],
    [
      "easy-subtract-06",
      "easy",
      "subtract",
      ["bowlLeft", "bowlRight"],
      ["bowlLeft"],
    ],
    [
      "medium-add-01",
      "medium",
      "add",
      ["top", "left"],
      ["top", "right"],
    ],
    [
      "medium-add-02",
      "medium",
      "add",
      ["bottom", "left"],
      ["bottom", "right"],
    ],
    [
      "medium-add-03",
      "medium",
      "add",
      ["roofLeft", "middleV"],
      ["roofRight", "middleV"],
    ],
    [
      "medium-add-04",
      "medium",
      "add",
      ["arcLeft", "bowlLeft"],
      ["arcRight", "bowlRight"],
    ],
    [
      "medium-add-05",
      "medium",
      "add",
      ["diagDown", "middleH"],
      ["diagUp", "middleH"],
    ],
    [
      "medium-add-06",
      "medium",
      "add",
      ["top", "bottom"],
      ["left", "right"],
    ],
    [
      "medium-subtract-01",
      "medium",
      "subtract",
      ["top", "right", "bottom"],
      ["right"],
    ],
    [
      "medium-subtract-02",
      "medium",
      "subtract",
      ["left", "middleH", "right"],
      ["middleH"],
    ],
    [
      "medium-subtract-03",
      "medium",
      "subtract",
      ["roofLeft", "roofRight", "middleV"],
      ["middleV"],
    ],
    [
      "medium-subtract-04",
      "medium",
      "subtract",
      ["arcLeft", "arcRight", "center"],
      ["center"],
    ],
    [
      "medium-subtract-05",
      "medium",
      "subtract",
      ["diagDown", "diagUp", "middleH"],
      ["diagDown"],
    ],
    [
      "medium-subtract-06",
      "medium",
      "subtract",
      ["top", "right", "bottom", "left"],
      ["top", "bottom"],
    ],
    [
      "hard-add-01",
      "hard",
      "add",
      ["top", "bottom", "middleV"],
      ["left", "right", "middleH"],
    ],
    [
      "hard-add-02",
      "hard",
      "add",
      ["top", "left", "diagDown"],
      ["right", "bottom", "diagUp"],
    ],
    [
      "hard-add-03",
      "hard",
      "add",
      ["arcLeft", "arcRight", "middleV"],
      ["bowlLeft", "bowlRight", "middleV"],
    ],
    [
      "hard-add-04",
      "hard",
      "add",
      ["roofLeft", "roofRight", "middleH"],
      ["diagDown", "diagUp", "middleH"],
    ],
    [
      "hard-add-05",
      "hard",
      "add",
      ["top", "right", "center"],
      ["bottom", "left", "center"],
    ],
    [
      "hard-add-06",
      "hard",
      "add",
      ["arcLeft", "bowlRight", "diagDown"],
      ["arcRight", "bowlLeft", "diagUp"],
    ],
    [
      "hard-subtract-01",
      "hard",
      "subtract",
      ["top", "right", "bottom", "left", "middleH"],
      ["top", "bottom"],
    ],
    [
      "hard-subtract-02",
      "hard",
      "subtract",
      ["top", "right", "bottom", "left", "diagDown", "diagUp"],
      ["diagDown", "left"],
    ],
    [
      "hard-subtract-03",
      "hard",
      "subtract",
      ["arcLeft", "arcRight", "bowlLeft", "bowlRight", "center"],
      ["arcRight", "bowlLeft"],
    ],
    [
      "hard-subtract-04",
      "hard",
      "subtract",
      ["roofLeft", "roofRight", "middleV", "middleH", "center"],
      ["middleV", "center"],
    ],
    [
      "hard-subtract-05",
      "hard",
      "subtract",
      ["top", "right", "bottom", "left", "middleV", "middleH"],
      ["right", "middleH", "left"],
    ],
    [
      "hard-subtract-06",
      "hard",
      "subtract",
      ["diagDown", "diagUp", "arcLeft", "arcRight", "center"],
      ["diagUp", "arcLeft"],
    ],
  ];

  const QUESTIONS = Object.freeze(
    QUESTION_SPECS.map(([id, difficulty, operator, left, right]) =>
      Object.freeze({
        id,
        difficulty,
        operator,
        left: Object.freeze([...left]),
        right: Object.freeze([...right]),
        answer: Object.freeze(combine(left, right, operator)),
      }),
    ),
  );

  function arraysEqual(left, right) {
    return (
      left.length === right.length &&
      left.every((value, index) => value === right[index])
    );
  }

  function validateQuestion(question) {
    const errors = [];
    const knownSegments = new Set(Object.keys(SEGMENTS));

    if (!question || typeof question !== "object") {
      return ["題目必須是物件"];
    }

    if (!question.id || typeof question.id !== "string") {
      errors.push("題目缺少有效識別碼");
    }

    if (!["easy", "medium", "hard"].includes(question.difficulty)) {
      errors.push(`${question.id || "未知題目"}的難度無效`);
    }

    if (!["add", "subtract"].includes(question.operator)) {
      errors.push(`${question.id || "未知題目"}的運算無效`);
    }

    for (const side of ["left", "right", "answer"]) {
      const segments = question[side];
      if (!Array.isArray(segments) || segments.length === 0) {
        errors.push(`${question.id || "未知題目"}的${side}不可為空`);
        continue;
      }

      if (new Set(segments).size !== segments.length) {
        errors.push(`${question.id || "未知題目"}的${side}含重複片段`);
      }

      for (const segment of segments) {
        if (!knownSegments.has(segment)) {
          errors.push(`${question.id || "未知題目"}含未知片段 ${segment}`);
        }
      }
    }

    if (
      question.operator === "subtract" &&
      Array.isArray(question.left) &&
      Array.isArray(question.right)
    ) {
      const leftSet = new Set(question.left);
      if (!question.right.every((segment) => leftSet.has(segment))) {
        errors.push(`${question.id}的減法右側不是左側子集合`);
      }
    }

    if (
      ["add", "subtract"].includes(question.operator) &&
      Array.isArray(question.left) &&
      Array.isArray(question.right) &&
      Array.isArray(question.answer)
    ) {
      const expected = combine(
        question.left,
        question.right,
        question.operator,
      );
      if (!arraysEqual(expected, question.answer)) {
        errors.push(`${question.id}的答案與運算結果不一致`);
      }
    }

    return errors;
  }

  function validateBank(questions) {
    if (!Array.isArray(questions)) return ["題庫必須是陣列"];

    const errors = questions.flatMap(validateQuestion);
    const seen = new Set();

    for (const question of questions) {
      if (
        !question ||
        typeof question !== "object" ||
        typeof question.id !== "string"
      ) {
        continue;
      }

      if (seen.has(question.id)) {
        errors.push(`題目識別碼重複：${question.id}`);
      }
      seen.add(question.id);
    }

    return errors;
  }

  function escapeAttribute(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll('"', "&quot;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }

  function renderShape(segmentIds, options = {}) {
    const label = options.label || "圖形";
    const className = options.className || "shape-svg";
    const paths = segmentIds
      .map((id) => {
        if (!SEGMENTS[id]) throw new Error(`未知圖形片段：${id}`);
        return `<path d="${SEGMENTS[id]}" />`;
      })
      .join("");

    return `<svg class="${escapeAttribute(className)}" viewBox="0 0 100 100" role="img" aria-label="${escapeAttribute(label)}" focusable="false">${paths}</svg>`;
  }

  return Object.freeze({
    SEGMENTS,
    QUESTIONS,
    combine,
    validateQuestion,
    validateBank,
    renderShape,
  });
});
