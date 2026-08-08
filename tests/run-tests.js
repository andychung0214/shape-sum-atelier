"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

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

function readProject(relativePath) {
  return fs.readFileSync(path.join(__dirname, "..", relativePath), "utf8");
}

const core = require("../js/core.js");
const stateApi = require("../js/state.js");

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

test("題庫至少提供十二種圖形片段", () => {
  assert.ok(Object.keys(core.SEGMENTS).length >= 12);
});

test("題庫提供五個難度共一百十六題", () => {
  assert.equal(core.QUESTIONS.length, 116);
});

test("每個難度都有指定題數與加減法分布", () => {
  const expectedDistribution = {
    easy: { total: 26, add: 13, subtract: 13 },
    medium: { total: 26, add: 13, subtract: 13 },
    hard: { total: 26, add: 13, subtract: 13 },
    challenge: { total: 26, add: 13, subtract: 13 },
    expert: { total: 12, add: 6, subtract: 6 },
  };

  for (const [difficulty, expected] of Object.entries(expectedDistribution)) {
    const questions = core.QUESTIONS.filter(
      (question) => question.difficulty === difficulty,
    );
    assert.equal(questions.length, expected.total, `${difficulty} 題數`);
    assert.equal(
      questions.filter((question) => question.operator === "add").length,
      expected.add,
      `${difficulty} 加法題數`,
    );
    assert.equal(
      questions.filter((question) => question.operator === "subtract").length,
      expected.subtract,
      `${difficulty} 減法題數`,
    );
  }
});

test("完整題庫通過一致性驗證", () => {
  assert.deepEqual(core.validateBank(core.QUESTIONS), []);
});

test("題庫驗證會回報完全損壞的題目而不崩潰", () => {
  assert.doesNotThrow(() => core.validateBank([null, "損壞題目"]));
  assert.ok(core.validateBank([null, "損壞題目"]).length >= 2);
});

test("各難度都包含加法與減法", () => {
  for (const difficulty of [
    "easy",
    "medium",
    "hard",
    "challenge",
    "expert",
  ]) {
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

test("預設狀態尚未揭曉題目且顯示全部題型", () => {
  const initial = stateApi.createDefaultState();
  assert.deepEqual(initial.revealedIds, []);
  assert.equal(initial.difficulty, "all");
  assert.equal(initial.operator, "all");
});

test("翻牌會建立新狀態並可再次收起", () => {
  const initial = stateApi.createDefaultState();
  const opened = stateApi.toggleRevealed(initial, "easy-add-01");
  assert.deepEqual(opened.revealedIds, ["easy-add-01"]);
  assert.deepEqual(initial.revealedIds, []);
  assert.deepEqual(
    stateApi.toggleRevealed(opened, "easy-add-01").revealedIds,
    [],
  );
});

test("損壞或過期狀態會回復安全預設值", () => {
  const normalized = stateApi.normalizeState(
    {
      revealedIds: ["valid", "ghost", "valid"],
      difficulty: "oops",
      operator: "subtract",
      shuffled: "yes",
    },
    ["valid"],
  );
  assert.deepEqual(normalized.revealedIds, ["valid"]);
  assert.equal(normalized.difficulty, "all");
  assert.equal(normalized.operator, "subtract");
  assert.equal(normalized.shuffled, false);
  assert.equal(stateApi.normalizeState(null, []).difficulty, "all");
  assert.deepEqual(
    stateApi.normalizeState(
      { version: 99, revealedIds: ["valid"], difficulty: "hard" },
      ["valid"],
    ),
    stateApi.createDefaultState(),
  );
});

test("篩選同時套用難度與運算類型", () => {
  const filtered = stateApi.filterQuestions(core.QUESTIONS, {
    difficulty: "easy",
    operator: "add",
  });
  assert.ok(filtered.length > 0);
  assert.equal(
    filtered.every(
      (question) =>
        question.difficulty === "easy" && question.operator === "add",
    ),
    true,
  );
});

test("挑戰難度可正規化、篩選並保留二十六題", () => {
  const normalized = stateApi.normalizeState(
    {
      version: stateApi.STORAGE_VERSION,
      revealedIds: ["challenge-add-01"],
      difficulty: "challenge",
      operator: "all",
      shuffled: false,
    },
    core.QUESTIONS.map((question) => question.id),
  );
  assert.equal(normalized.difficulty, "challenge");
  assert.deepEqual(normalized.revealedIds, ["challenge-add-01"]);
  assert.equal(
    stateApi.filterQuestions(core.QUESTIONS, normalized).length,
    26,
  );
});

test("進度只計算目前題目中的已揭曉題目", () => {
  assert.deepEqual(
    stateApi.calculateProgress([{ id: "a" }, { id: "b" }], ["a", "ghost"]),
    { explored: 1, total: 2, percent: 50 },
  );
  assert.deepEqual(stateApi.calculateProgress([], ["a"]), {
    explored: 0,
    total: 0,
    percent: 0,
  });
});

test("HTML 提供主要內容、篩選、題庫與無 JavaScript 提示", () => {
  const indexHtml = readProject("index.html");
  assert.match(indexHtml, /<main/);
  assert.match(indexHtml, /href="#main-content"/);
  assert.match(indexHtml, /id="main-content"[^>]*tabindex="-1"/);
  assert.match(indexHtml, /id="question-grid"/);
  assert.match(indexHtml, /id="difficulty-filter"/);
  assert.match(indexHtml, /<option value="challenge">挑戰<\/option>/);
  assert.match(indexHtml, /id="operator-filter"/);
  assert.match(indexHtml, /<noscript>/);
});

test("腳本依核心、狀態、應用程式的順序載入", () => {
  const indexHtml = readProject("index.html");
  const coreIndex = indexHtml.indexOf('src="js/core.js"');
  const stateIndex = indexHtml.indexOf('src="js/state.js"');
  const appIndex = indexHtml.indexOf('src="js/app.js"');
  assert.ok(coreIndex > -1);
  assert.ok(coreIndex < stateIndex);
  assert.ok(stateIndex < appIndex);
});

test("應用程式同步翻牌無障礙狀態並使用版本化儲存鍵", () => {
  const appJs = readProject("js/app.js");
  assert.match(appJs, /aria-expanded/);
  assert.match(appJs, /class="equation"\s+role="group"/);
  assert.match(appJs, /shape-sum-atelier-state-v1/);
  assert.match(appJs, /challenge:\s*"挑戰"/);
  assert.match(appJs, /validateBank/);
  assert.match(appJs, /try\s*{/);
});

test("樣式表定義核准色票與翻牌時間", () => {
  const stylesCss = readProject("css/styles.css");
  for (const token of [
    "--paper",
    "--ink-red",
    "--ink-blue",
    "--focus",
    "--flip-duration",
  ]) {
    assert.match(stylesCss, new RegExp(token));
  }
});

test("樣式表提供手機、平板、桌機與減少動態效果規則", () => {
  const stylesCss = readProject("css/styles.css");
  assert.match(stylesCss, /prefers-reduced-motion/);
  assert.match(stylesCss, /@media[^{]*min-width:\s*48rem/);
  assert.match(stylesCss, /@media[^{]*min-width:\s*75rem/);
  assert.match(stylesCss, /\.answer-flip\[aria-expanded="true"\]/);
});

test("必要專案文件皆存在", () => {
  for (const relativePath of [
    "README.md",
    "docs/PLAN.md",
    "docs/ART-DIRECTION.md",
    "docs/TEST-PLAN.md",
    "CONTRIBUTING.md",
    "LICENSE",
    ".gitignore",
  ]) {
    assert.equal(
      fs.existsSync(path.join(__dirname, "..", relativePath)),
      true,
      `${relativePath} 應存在`,
    );
  }
});

test("README 涵蓋所有必要交付說明", () => {
  const readme = readProject("README.md");
  for (const heading of [
    "遊戲介紹",
    "特色",
    "操作方式",
    "安裝與執行",
    "專案結構",
    "測試方式",
    "靜態網站",
    "已知限制",
    "授權說明",
  ]) {
    assert.match(readme, new RegExp(heading));
  }
});

test("計畫與測試文件包含驗收及無障礙內容", () => {
  assert.match(readProject("docs/PLAN.md"), /驗收條件/);
  assert.match(readProject("docs/PLAN.md"), /風險/);
  assert.match(readProject("docs/TEST-PLAN.md"), /無障礙/);
  assert.match(readProject("docs/TEST-PLAN.md"), /行動裝置/);
});

test("提供可執行的瀏覽器整合冒煙測試", () => {
  const smokeTest = readProject("tests/browser-smoke.html");
  const readme = readProject("README.md");
  assert.match(smokeTest, /<iframe[^>]+src="\.\.\/index\.html"/);
  assert.match(smokeTest, /data-status/);
  assert.match(smokeTest, /aria-expanded/);
  assert.match(smokeTest, /difficulty-filter/);
  assert.match(smokeTest, /value\s*=\s*"challenge"/);
  assert.match(smokeTest, /length\s*===\s*80/);
  assert.match(smokeTest, /length\s*===\s*20/);
  assert.match(smokeTest, /length\s*===\s*10/);
  assert.match(smokeTest, /operator\.value\s*=\s*"subtract"/);
  assert.match(smokeTest, /挑戰減法篩選不是 10 題/);
  assert.match(
    smokeTest,
    /localStorage\.removeItem\(\s*"shape-sum-atelier-state-v1"/,
  );
  assert.match(smokeTest, /frame\.contentWindow\.location\.reload/);
  assert.match(readme, /冒煙測試必須透過本機 HTTP/);
});

process.on("exit", () => {
  console.log(`\n${passed} 項通過，${failed} 項失敗`);
  if (failed > 0) process.exitCode = 1;
});
