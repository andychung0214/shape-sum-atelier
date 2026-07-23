"use strict";

const assert = require("node:assert/strict");

let passed = 0;
let failed = 0;

function test(name, callback) {
  try {
    callback();
    passed += 1;
    console.log(`✓ ${name}`);
  } catch (error) {
    failed += 1;
    console.error(`✗ ${name}`);
    console.error(`  ${error.message}`);
  }
}

const core = require("../js/core.js");

test("加法依序合併兩個圖形的片段", () => {
  assert.deepEqual(core.combine(["top"], ["left"], "add"), ["top", "left"]);
});

test("減法移除右側圖形所含的片段", () => {
  assert.deepEqual(
    core.combine(["top", "left"], ["top"], "subtract"),
    ["left"],
  );
});

test("加法不重複加入相同片段", () => {
  assert.deepEqual(core.combine(["top"], ["top"], "add"), ["top"]);
});

test("未知運算會回報錯誤", () => {
  assert.throws(
    () => core.combine(["top"], ["left"], "multiply"),
    /不支援/,
  );
});

test("題庫至少提供十二種圖形片段與三十道題目", () => {
  assert.ok(Object.keys(core.SEGMENTS).length >= 12);
  assert.ok(core.QUESTIONS.length >= 30);
});

test("完整題庫通過一致性驗證", () => {
  assert.deepEqual(core.validateBank(core.QUESTIONS), []);
});

test("各難度都包含加法與減法", () => {
  for (const difficulty of ["easy", "medium", "hard"]) {
    assert.ok(
      core.QUESTIONS.some(
        (question) =>
          question.difficulty === difficulty && question.operator === "add",
      ),
    );
    assert.ok(
      core.QUESTIONS.some(
        (question) =>
          question.difficulty === difficulty &&
          question.operator === "subtract",
      ),
    );
  }
});

test("圖形繪製器輸出具名稱的 SVG 與正確片段數量", () => {
  const svg = core.renderShape(["top", "left"], { label: "測試圖形" });
  assert.match(svg, /<svg/);
  assert.match(svg, /aria-label="測試圖形"/);
  assert.equal((svg.match(/<path/g) || []).length, 2);
});

process.on("exit", () => {
  console.log(`\n${passed} 項通過，${failed} 項失敗`);
  if (failed > 0) process.exitCode = 1;
});
