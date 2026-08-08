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
    ["easy-add-07", "easy", "add", ["middleH"], ["middleV"]],
    ["easy-add-08", "easy", "add", ["top"], ["bottom"]],
    ["easy-add-09", "easy", "add", ["left"], ["right"]],
    ["easy-add-10", "easy", "add", ["center"], ["middleV"]],
    [
      "easy-subtract-07",
      "easy",
      "subtract",
      ["middleH", "middleV"],
      ["middleH"],
    ],
    [
      "easy-subtract-08",
      "easy",
      "subtract",
      ["top", "bottom"],
      ["top"],
    ],
    [
      "easy-subtract-09",
      "easy",
      "subtract",
      ["left", "right"],
      ["right"],
    ],
    [
      "easy-subtract-10",
      "easy",
      "subtract",
      ["center", "middleV"],
      ["center"],
    ],
    [
      "medium-add-07",
      "medium",
      "add",
      ["top", "left"],
      ["bottom", "left"],
    ],
    [
      "medium-add-08",
      "medium",
      "add",
      ["top", "right"],
      ["bottom", "right"],
    ],
    [
      "medium-add-09",
      "medium",
      "add",
      ["diagDown", "center"],
      ["diagUp", "center"],
    ],
    [
      "medium-add-10",
      "medium",
      "add",
      ["arcLeft", "bowlRight"],
      ["arcRight", "bowlRight"],
    ],
    [
      "medium-subtract-07",
      "medium",
      "subtract",
      ["top", "left", "bottom", "middleH"],
      ["middleH"],
    ],
    [
      "medium-subtract-08",
      "medium",
      "subtract",
      ["top", "right", "bottom", "middleV"],
      ["middleV"],
    ],
    [
      "medium-subtract-09",
      "medium",
      "subtract",
      ["diagDown", "diagUp", "center", "middleH"],
      ["center", "middleH"],
    ],
    [
      "medium-subtract-10",
      "medium",
      "subtract",
      ["arcLeft", "arcRight", "bowlLeft", "bowlRight"],
      ["arcLeft", "bowlRight"],
    ],
    [
      "hard-add-07",
      "hard",
      "add",
      ["top", "bottom", "diagDown", "middleV"],
      ["left", "right", "diagUp", "middleV"],
    ],
    [
      "hard-add-08",
      "hard",
      "add",
      ["arcLeft", "arcRight", "center", "diagDown"],
      ["bowlLeft", "bowlRight", "center", "diagUp"],
    ],
    [
      "hard-add-09",
      "hard",
      "add",
      ["roofLeft", "roofRight", "left", "middleH"],
      ["bottom", "right", "middleH", "center"],
    ],
    [
      "hard-add-10",
      "hard",
      "add",
      ["top", "left", "bowlLeft", "diagUp"],
      ["right", "bottom", "arcRight", "diagDown"],
    ],
    [
      "hard-subtract-07",
      "hard",
      "subtract",
      ["top", "right", "bottom", "left", "diagDown", "diagUp", "center"],
      ["top", "center", "diagUp"],
    ],
    [
      "hard-subtract-08",
      "hard",
      "subtract",
      ["arcLeft", "arcRight", "bowlLeft", "bowlRight", "middleH", "middleV"],
      ["arcLeft", "bowlRight", "middleH"],
    ],
    [
      "hard-subtract-09",
      "hard",
      "subtract",
      [
        "roofLeft",
        "roofRight",
        "left",
        "right",
        "bottom",
        "middleV",
        "center",
      ],
      ["roofRight", "middleV", "center"],
    ],
    [
      "hard-subtract-10",
      "hard",
      "subtract",
      ["top", "right", "bottom", "left", "middleH", "middleV", "diagDown"],
      ["right", "middleH", "diagDown"],
    ],
    [
      "challenge-add-01",
      "challenge",
      "add",
      ["top", "right", "left", "middleH", "diagDown", "center"],
      ["top", "bottom", "left", "middleV", "diagUp", "center"],
    ],
    [
      "challenge-add-02",
      "challenge",
      "add",
      ["arcLeft", "arcRight", "bowlLeft", "middleH", "middleV", "center"],
      ["arcLeft", "bowlLeft", "bowlRight", "diagDown", "diagUp", "center"],
    ],
    [
      "challenge-add-03",
      "challenge",
      "add",
      ["roofLeft", "roofRight", "left", "right", "middleV", "center"],
      ["roofLeft", "roofRight", "bottom", "middleH", "diagDown", "diagUp"],
    ],
    [
      "challenge-add-04",
      "challenge",
      "add",
      ["top", "right", "bottom", "left", "diagDown", "center"],
      ["top", "right", "bottom", "left", "diagUp", "middleH"],
    ],
    [
      "challenge-add-05",
      "challenge",
      "add",
      ["arcLeft", "arcRight", "bowlLeft", "bowlRight", "middleV", "center"],
      ["arcLeft", "arcRight", "bowlLeft", "bowlRight", "middleH", "diagDown"],
    ],
    [
      "challenge-add-06",
      "challenge",
      "add",
      ["top", "bottom", "middleH", "middleV", "diagDown", "diagUp"],
      ["left", "right", "middleH", "middleV", "roofLeft", "roofRight"],
    ],
    [
      "challenge-add-07",
      "challenge",
      "add",
      ["top", "left", "arcLeft", "bowlLeft", "diagDown", "center"],
      ["top", "right", "arcRight", "bowlRight", "diagUp", "center"],
    ],
    [
      "challenge-add-08",
      "challenge",
      "add",
      ["bottom", "left", "roofLeft", "bowlLeft", "middleH", "middleV"],
      ["bottom", "right", "roofRight", "bowlRight", "middleH", "middleV"],
    ],
    [
      "challenge-add-09",
      "challenge",
      "add",
      ["top", "right", "arcRight", "bowlRight", "diagDown", "diagUp"],
      ["bottom", "left", "arcLeft", "bowlLeft", "diagDown", "diagUp"],
    ],
    [
      "challenge-add-10",
      "challenge",
      "add",
      ["roofLeft", "roofRight", "arcLeft", "arcRight", "middleH", "center"],
      ["roofLeft", "roofRight", "bowlLeft", "bowlRight", "middleV", "center"],
    ],
    [
      "challenge-subtract-01",
      "challenge",
      "subtract",
      [
        "top",
        "right",
        "bottom",
        "left",
        "middleH",
        "middleV",
        "diagDown",
        "diagUp",
        "center",
      ],
      ["middleH", "diagUp", "center"],
    ],
    [
      "challenge-subtract-02",
      "challenge",
      "subtract",
      [
        "arcLeft",
        "arcRight",
        "bowlLeft",
        "bowlRight",
        "middleH",
        "middleV",
        "diagDown",
        "diagUp",
        "center",
      ],
      ["arcLeft", "bowlRight", "middleV"],
    ],
    [
      "challenge-subtract-03",
      "challenge",
      "subtract",
      [
        "roofLeft",
        "roofRight",
        "left",
        "right",
        "bottom",
        "middleH",
        "middleV",
        "diagDown",
        "diagUp",
        "center",
      ],
      ["roofRight", "bottom", "diagDown", "center"],
    ],
    [
      "challenge-subtract-04",
      "challenge",
      "subtract",
      [
        "top",
        "right",
        "bottom",
        "left",
        "arcLeft",
        "arcRight",
        "bowlLeft",
        "bowlRight",
        "middleH",
        "middleV",
      ],
      ["top", "left", "arcRight", "bowlLeft"],
    ],
    [
      "challenge-subtract-05",
      "challenge",
      "subtract",
      [
        "top",
        "bottom",
        "left",
        "right",
        "roofLeft",
        "roofRight",
        "diagDown",
        "diagUp",
        "center",
      ],
      ["roofLeft", "right", "diagUp"],
    ],
    [
      "challenge-subtract-06",
      "challenge",
      "subtract",
      [
        "arcLeft",
        "arcRight",
        "bowlLeft",
        "bowlRight",
        "middleH",
        "middleV",
        "diagDown",
        "diagUp",
      ],
      ["arcRight", "bowlLeft", "middleH"],
    ],
    [
      "challenge-subtract-07",
      "challenge",
      "subtract",
      [
        "top",
        "right",
        "bottom",
        "left",
        "middleH",
        "middleV",
        "diagDown",
        "diagUp",
      ],
      ["top", "bottom", "middleV"],
    ],
    [
      "challenge-subtract-08",
      "challenge",
      "subtract",
      [
        "top",
        "bottom",
        "arcLeft",
        "arcRight",
        "bowlLeft",
        "bowlRight",
        "middleH",
        "middleV",
        "center",
      ],
      ["arcLeft", "bowlRight", "middleH", "center"],
    ],
    [
      "challenge-subtract-09",
      "challenge",
      "subtract",
      [
        "roofLeft",
        "roofRight",
        "left",
        "right",
        "bottom",
        "middleH",
        "middleV",
        "diagDown",
        "diagUp",
      ],
      ["roofLeft", "right", "middleV", "diagDown"],
    ],
    [
      "challenge-subtract-10",
      "challenge",
      "subtract",
      [
        "top",
        "right",
        "bottom",
        "left",
        "arcLeft",
        "bowlRight",
        "diagDown",
        "diagUp",
        "center",
      ],
      ["right", "arcLeft", "diagDown", "center"],
    ],
    ["easy-add-11", "easy", "add", ["top", "middleH"], ["bottom"]],
    ["easy-add-12", "easy", "add", ["left", "middleV"], ["right"]],
    ["easy-add-13", "easy", "add", ["diagDown"], ["center"]],
    ["easy-subtract-11", "easy", "subtract", ["top", "middleH", "bottom"], ["middleH"]],
    ["easy-subtract-12", "easy", "subtract", ["left", "middleV", "right"], ["right"]],
    ["easy-subtract-13", "easy", "subtract", ["diagDown", "center"], ["center"]],
    ["medium-add-11", "medium", "add", ["top", "left", "middleH"], ["bottom", "left"]],
    ["medium-add-12", "medium", "add", ["arcLeft", "bowlLeft", "center"], ["arcRight", "bowlLeft", "center"]],
    ["medium-add-13", "medium", "add", ["roofLeft", "middleV", "diagDown"], ["roofRight", "middleV", "diagUp"]],
    ["medium-subtract-11", "medium", "subtract", ["top", "right", "bottom", "middleH"], ["right", "middleH"]],
    ["medium-subtract-12", "medium", "subtract", ["arcLeft", "arcRight", "bowlLeft", "bowlRight"], ["arcRight", "bowlLeft"]],
    ["medium-subtract-13", "medium", "subtract", ["roofLeft", "roofRight", "middleV", "center"], ["middleV"]],
    ["hard-add-11", "hard", "add", ["top", "right", "bottom", "diagDown"], ["left", "middleH", "diagUp", "center"]],
    ["hard-add-12", "hard", "add", ["arcLeft", "arcRight", "bowlLeft", "center"], ["arcRight", "bowlRight", "diagUp", "middleV"]],
    ["hard-add-13", "hard", "add", ["roofLeft", "roofRight", "left", "middleH"], ["right", "bottom", "diagDown", "center"]],
    ["hard-subtract-11", "hard", "subtract", ["top", "right", "bottom", "left", "diagDown", "middleV", "center"], ["right", "diagDown", "center"]],
    ["hard-subtract-12", "hard", "subtract", ["arcLeft", "arcRight", "bowlLeft", "bowlRight", "middleH", "diagUp"], ["arcRight", "bowlLeft"]],
    ["hard-subtract-13", "hard", "subtract", ["roofLeft", "roofRight", "top", "bottom", "middleV", "diagDown", "center"], ["roofLeft", "middleV", "center"]],
    ["challenge-add-11", "challenge", "add", ["top", "right", "bottom", "left", "diagDown", "center"], ["top", "right", "middleH", "diagUp", "center"]],
    ["challenge-add-12", "challenge", "add", ["arcLeft", "arcRight", "bowlLeft", "bowlRight", "middleV", "center"], ["arcLeft", "bowlLeft", "middleH", "diagDown", "center"]],
    ["challenge-add-13", "challenge", "add", ["roofLeft", "roofRight", "left", "right", "middleV", "diagUp"], ["roofLeft", "right", "bottom", "middleH", "diagDown", "diagUp"]],
    ["challenge-subtract-11", "challenge", "subtract", ["top", "right", "bottom", "left", "middleH", "middleV", "diagDown", "diagUp", "center"], ["middleH", "diagUp", "center"]],
    ["challenge-subtract-12", "challenge", "subtract", ["arcLeft", "arcRight", "bowlLeft", "bowlRight", "middleH", "middleV", "diagDown", "diagUp", "center"], ["arcLeft", "bowlRight", "middleV", "diagUp"]],
    ["challenge-subtract-13", "challenge", "subtract", ["roofLeft", "roofRight", "top", "right", "bottom", "left", "middleH", "middleV", "center"], ["roofRight", "right", "middleH", "center"]],
    ["expert-add-01", "expert", "add", ["top", "right", "bottom", "left", "middleH", "diagDown", "center"], ["top", "right", "middleV", "diagUp", "center", "roofLeft"]],
    ["expert-add-02", "expert", "add", ["arcLeft", "arcRight", "bowlLeft", "bowlRight", "middleH", "middleV", "center"], ["arcLeft", "bowlLeft", "diagDown", "diagUp", "center", "roofRight"]],
    ["expert-add-03", "expert", "add", ["roofLeft", "roofRight", "left", "right", "middleV", "diagDown", "center"], ["roofLeft", "right", "bottom", "middleH", "diagUp", "center", "bowlRight"]],
    ["expert-add-04", "expert", "add", ["top", "bottom", "diagDown", "diagUp", "middleH", "middleV", "center"], ["top", "bottom", "left", "right", "middleH", "roofLeft", "roofRight"]],
    ["expert-add-05", "expert", "add", ["arcLeft", "arcRight", "bowlLeft", "middleH", "middleV", "center", "diagDown"], ["arcLeft", "arcRight", "bowlRight", "middleH", "roofLeft", "roofRight", "diagUp"]],
    ["expert-add-06", "expert", "add", ["top", "right", "bowlRight", "diagDown", "diagUp", "center", "roofLeft"], ["top", "right", "bowlLeft", "diagDown", "middleV", "center", "roofRight"]],
    ["expert-subtract-01", "expert", "subtract", ["top", "right", "bottom", "left", "middleH", "middleV", "diagDown", "diagUp", "roofLeft", "center"], ["top", "diagDown", "roofLeft", "center"]],
    ["expert-subtract-02", "expert", "subtract", ["arcLeft", "arcRight", "bowlLeft", "bowlRight", "middleH", "middleV", "diagDown", "diagUp", "center", "roofRight"], ["arcRight", "bowlLeft", "middleV", "center"]],
    ["expert-subtract-03", "expert", "subtract", ["roofLeft", "roofRight", "top", "right", "bottom", "left", "middleH", "middleV", "diagDown", "center", "bowlRight"], ["roofLeft", "right", "middleH", "center", "bowlRight"]],
    ["expert-subtract-04", "expert", "subtract", ["top", "bottom", "left", "right", "arcLeft", "arcRight", "bowlLeft", "bowlRight", "diagUp", "center"], ["top", "left", "arcRight", "center"]],
    ["expert-subtract-05", "expert", "subtract", ["roofLeft", "roofRight", "middleH", "middleV", "diagDown", "diagUp", "arcLeft", "arcRight", "bowlLeft", "bowlRight", "center"], ["roofRight", "middleV", "diagUp", "bowlLeft", "center"]],
    ["expert-subtract-06", "expert", "subtract", ["top", "right", "bottom", "left", "middleH", "middleV", "diagDown", "diagUp", "roofLeft", "roofRight", "center", "bowlRight"], ["right", "middleV", "diagDown", "roofLeft", "center"]],
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

    if (
      !["easy", "medium", "hard", "challenge", "expert"].includes(question.difficulty)
    ) {
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
