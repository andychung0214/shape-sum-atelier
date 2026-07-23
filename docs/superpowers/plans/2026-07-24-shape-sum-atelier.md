# Shape Sum Atelier Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 建立可直接開啟 `index.html` 的兒童圖形運算翻牌題庫，提供至少 30 道可驗證題目、進度保存、響應式操作及完整文件。

**Architecture:** 使用三個職責分離的 IIFE JavaScript 檔案：`core.js` 處理圖形集合與題庫、`state.js` 處理純狀態運算、`app.js` 處理 DOM 與 `localStorage`。純邏輯同時輸出至 `window` 與 `module.exports`，讓瀏覽器直接執行且 Node.js 可在無套件環境測試。

**Tech Stack:** HTML5、CSS3、Vanilla JavaScript ES2020、SVG、`localStorage`、Node.js 內建 `assert`、Git。

## Global Constraints

- 不使用 React、Angular、Vue、TypeScript、後端服務或大型遊戲引擎。
- 不使用外部字型、CDN、套件管理器或需要建構的工具。
- 直接以 `file://` 開啟 `index.html` 時必須完整執行。
- UI、中文文件及註解遵守 AGENTS.md 的 zh-TW 名詞翻譯規範。
- 桌機優先，至少支援手機、平板、桌機三組版面。
- 所有答案預設隱藏，按下後翻開，再按一次翻回。
- 每一個可測試功能都先建立失敗測試，再撰寫最小實作。
- 不讀取、提交或推送 `.env`、憑證、token 或私人金鑰。
- 推送前顯示 remote、branch 與 commit。

---

## File Structure

```text
shape-sum-atelier/
├── index.html                         # 語意化頁面骨架與靜態控制元件
├── css/
│   └── styles.css                     # 色彩 token、方格紙視覺、翻牌與 RWD
├── js/
│   ├── core.js                        # 圖形片段、集合運算、題庫與 SVG
│   ├── state.js                       # 篩選、翻牌狀態、進度與狀態正規化
│   └── app.js                         # DOM 控制器與安全的 localStorage 整合
├── tests/
│   └── run-tests.js                   # Node.js 零相依單元測試
├── docs/
│   ├── PLAN.md                        # 需求、範圍、里程碑、風險與驗收
│   ├── ART-DIRECTION.md               # 視覺方向、token、元件與動畫規範
│   ├── TEST-PLAN.md                   # 自動、手動、行動裝置與無障礙清單
│   └── superpowers/                   # 核准規格與本實作計畫
├── README.md
├── CONTRIBUTING.md
├── LICENSE
└── .gitignore
```

### Task 1: 圖形集合引擎與有效題庫

**Files:**
- Create: `tests/run-tests.js`
- Create: `js/core.js`

**Interfaces:**
- Produces: `ShapeSumCore.combine(left: string[], right: string[], operator: "add"|"subtract"): string[]`
- Produces: `ShapeSumCore.validateQuestion(question): string[]`
- Produces: `ShapeSumCore.validateBank(questions): string[]`
- Produces: `ShapeSumCore.renderShape(segmentIds: string[], options?): string`
- Produces: `ShapeSumCore.SEGMENTS`, `ShapeSumCore.QUESTIONS`

- [ ] **Step 1: Write failing set-operation tests**

```js
const assert = require("node:assert/strict");
const core = require("../js/core.js");

assert.deepEqual(core.combine(["top"], ["left"], "add"), ["top", "left"]);
assert.deepEqual(core.combine(["top", "left"], ["top"], "subtract"), ["left"]);
assert.deepEqual(core.combine(["top"], ["top"], "add"), ["top"]);
assert.throws(() => core.combine(["top"], ["left"], "multiply"), /不支援/);
```

- [ ] **Step 2: Run test and verify RED**

Run: `node tests/run-tests.js`

Expected: FAIL with `Cannot find module '../js/core.js'`.

- [ ] **Step 3: Implement ordered set operations**

```js
function combine(left, right, operator) {
  const rightSet = new Set(right);
  if (operator === "add") return [...new Set([...left, ...right])];
  if (operator === "subtract") return left.filter((id) => !rightSet.has(id));
  throw new Error(`不支援的運算：${operator}`);
}
```

Export through both `module.exports` and `window.ShapeSumCore`.

- [ ] **Step 4: Run tests and verify GREEN**

Run: `node tests/run-tests.js`

Expected: all four assertions pass and process exits with code 0.

- [ ] **Step 5: Add failing question-bank tests**

Extend `tests/run-tests.js` to assert:

```js
assert.ok(Object.keys(core.SEGMENTS).length >= 12);
assert.ok(core.QUESTIONS.length >= 30);
assert.deepEqual(core.validateBank(core.QUESTIONS), []);
for (const difficulty of ["easy", "medium", "hard"]) {
  assert.ok(core.QUESTIONS.some((q) => q.difficulty === difficulty && q.operator === "add"));
  assert.ok(core.QUESTIONS.some((q) => q.difficulty === difficulty && q.operator === "subtract"));
}
```

- [ ] **Step 6: Run test and verify RED**

Run: `node tests/run-tests.js`

Expected: FAIL because `SEGMENTS`, `QUESTIONS` or `validateBank` is missing.

- [ ] **Step 7: Implement segments, 36 questions and validation**

Define at least these stable fragment identifiers:

```js
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
  center: "M 42 50 A 8 8 0 1 0 58 50 A 8 8 0 1 0 42 50"
});
```

Create 36 explicit question specifications split evenly across `easy`, `medium`, and `hard`. Compute every `answer` by calling `combine`. Reject empty operands, empty answers, unknown fragments, duplicate IDs, invalid operators, and subtract operands that are not subsets.

- [ ] **Step 8: Add and pass SVG rendering tests**

Test:

```js
const svg = core.renderShape(["top", "left"], { label: "測試圖形" });
assert.match(svg, /<svg/);
assert.match(svg, /aria-label="測試圖形"/);
assert.equal((svg.match(/<path/g) || []).length, 2);
```

Run: `node tests/run-tests.js`

Expected: all tests pass with a final summary line.

- [ ] **Step 9: Commit**

```powershell
git add -- js/core.js tests/run-tests.js
git commit -m "feat: 建立圖形運算引擎與題庫"
```

### Task 2: 狀態、篩選與進度模型

**Files:**
- Modify: `tests/run-tests.js`
- Create: `js/state.js`

**Interfaces:**
- Consumes: question objects from `ShapeSumCore.QUESTIONS`
- Produces: `ShapeSumState.createDefaultState(): AppState`
- Produces: `ShapeSumState.normalizeState(raw, validIds): AppState`
- Produces: `ShapeSumState.toggleRevealed(state, questionId): AppState`
- Produces: `ShapeSumState.filterQuestions(questions, filters): Question[]`
- Produces: `ShapeSumState.calculateProgress(questions, revealedIds): Progress`

- [ ] **Step 1: Write failing state tests**

```js
const stateApi = require("../js/state.js");
const initial = stateApi.createDefaultState();
assert.deepEqual(initial.revealedIds, []);
assert.equal(initial.difficulty, "all");
assert.equal(initial.operator, "all");

const opened = stateApi.toggleRevealed(initial, "easy-add-01");
assert.deepEqual(opened.revealedIds, ["easy-add-01"]);
assert.deepEqual(initial.revealedIds, []);
assert.deepEqual(stateApi.toggleRevealed(opened, "easy-add-01").revealedIds, []);
```

- [ ] **Step 2: Run test and verify RED**

Run: `node tests/run-tests.js`

Expected: FAIL with `Cannot find module '../js/state.js'`.

- [ ] **Step 3: Implement immutable default and toggle functions**

Use a versioned state:

```js
const STORAGE_VERSION = 1;
function createDefaultState() {
  return { version: STORAGE_VERSION, revealedIds: [], difficulty: "all", operator: "all", shuffled: false };
}
```

`toggleRevealed` must return a new object and a new `revealedIds` array.

- [ ] **Step 4: Add failing normalization, filter and progress tests**

Cover invalid JSON-shaped values, unknown IDs, unsupported filters, difficulty filtering, operator filtering and progress rounding:

```js
assert.deepEqual(
  stateApi.normalizeState({ revealedIds: ["valid", "ghost"], difficulty: "oops" }, ["valid"]).revealedIds,
  ["valid"]
);
assert.equal(stateApi.normalizeState(null, []).difficulty, "all");
assert.equal(stateApi.filterQuestions(core.QUESTIONS, { difficulty: "easy", operator: "add" })
  .every((q) => q.difficulty === "easy" && q.operator === "add"), true);
assert.deepEqual(stateApi.calculateProgress([{ id: "a" }, { id: "b" }], ["a"]), {
  explored: 1, total: 2, percent: 50
});
```

- [ ] **Step 5: Implement and run GREEN**

Implement pure functions with allowlists for `difficulty` and `operator`. Deduplicate revealed IDs and keep only IDs in `validIds`.

Run: `node tests/run-tests.js`

Expected: all tests pass.

- [ ] **Step 6: Commit**

```powershell
git add -- js/state.js tests/run-tests.js
git commit -m "feat: 建立題庫狀態與進度模型"
```

### Task 3: 可操作題庫與翻牌互動

**Files:**
- Create: `index.html`
- Create: `js/app.js`
- Modify: `tests/run-tests.js`

**Interfaces:**
- Consumes: `window.ShapeSumCore`, `window.ShapeSumState`
- Produces: `[data-question-id]` question cards
- Produces: `.answer-flip[aria-expanded]` accessible toggle buttons
- Produces: persisted key `shape-sum-atelier-state-v1`

- [ ] **Step 1: Write failing static contract tests**

Read `index.html` and `js/app.js` as text and assert:

```js
assert.match(indexHtml, /<main/);
assert.match(indexHtml, /id="question-grid"/);
assert.match(indexHtml, /id="difficulty-filter"/);
assert.match(indexHtml, /<noscript>/);
assert.match(appJs, /aria-expanded/);
assert.match(appJs, /shape-sum-atelier-state-v1/);
```

- [ ] **Step 2: Run test and verify RED**

Run: `node tests/run-tests.js`

Expected: FAIL because `index.html` and `js/app.js` do not exist.

- [ ] **Step 3: Create semantic HTML shell**

Include a skip link, branded header, status region, labelled filter controls, question grid, empty state, reset button, instructions, footer, `noscript`, and scripts in this exact dependency order:

```html
<script src="js/core.js"></script>
<script src="js/state.js"></script>
<script src="js/app.js"></script>
```

- [ ] **Step 4: Implement DOM controller and safe storage**

`app.js` must:

1. Validate the bank before rendering.
2. Read saved JSON inside `try/catch`, then call `normalizeState`.
3. Render SVG operands and the hidden answer.
4. Use one click listener on `#question-grid`.
5. Toggle state, `aria-expanded`, visible prompt and progress.
6. Persist inside `try/catch`; failure must not stop play.
7. Keep revealed states while filtering or shuffling.
8. Confirm before reset.
9. Show a readable fatal error if validation fails.

The answer markup must use:

```html
<button class="answer-flip" type="button" aria-expanded="false"
  aria-label="揭曉第 1 題答案">
  <span class="answer-flip__inner">
    <span class="answer-flip__face answer-flip__front" aria-hidden="true">？</span>
    <span class="answer-flip__face answer-flip__back">…SVG…</span>
  </span>
</button>
```

- [ ] **Step 5: Run automated tests**

Run: `node tests/run-tests.js`

Expected: all pure logic and static contract tests pass.

- [ ] **Step 6: Commit**

```powershell
git add -- index.html js/app.js tests/run-tests.js
git commit -m "feat: 建立題庫介面與答案翻牌互動"
```

### Task 4: 方格紙藝術方向與響應式版面

**Files:**
- Create: `css/styles.css`
- Modify: `index.html`
- Modify: `tests/run-tests.js`
- Create: `docs/ART-DIRECTION.md`

**Interfaces:**
- Consumes: class names created by Task 3
- Produces: CSS custom properties for paper, ink, spacing and motion
- Produces: breakpoints at `47.99rem` and `75rem`

- [ ] **Step 1: Write failing visual contract tests**

Assert that `styles.css` contains:

```js
for (const token of ["--paper", "--ink-red", "--ink-blue", "--focus", "--flip-duration"]) {
  assert.match(stylesCss, new RegExp(token));
}
assert.match(stylesCss, /prefers-reduced-motion/);
assert.match(stylesCss, /@media[^{]*min-width:\s*48rem/);
assert.match(stylesCss, /@media[^{]*min-width:\s*75rem/);
assert.match(stylesCss, /\.answer-flip\[aria-expanded="true"\]/);
```

- [ ] **Step 2: Run test and verify RED**

Run: `node tests/run-tests.js`

Expected: FAIL because `css/styles.css` does not exist.

- [ ] **Step 3: Implement the visual system**

Use these approved tokens as the source of truth:

```css
:root {
  --wood: #a98762;
  --paper: #f6f1e5;
  --grid-line: rgba(71, 89, 92, 0.13);
  --ink: #272923;
  --ink-red: #8f2944;
  --ink-blue: #294a8a;
  --focus: #d97724;
  --flip-duration: 420ms;
}
```

Typography:

- Display: `"Yu Gothic", "Hiragino Kaku Gothic ProN", "Noto Sans TC", sans-serif`
- Body: `"Noto Sans TC", "Microsoft JhengHei", sans-serif`
- Utility: `ui-monospace, "SFMono-Regular", Consolas, monospace`

Layout:

- `<body>` uses restrained layered gradients suggesting wood grain.
- `.paper-sheet` uses two perpendicular repeating linear gradients for graph paper.
- Desktop grid is three columns, tablet two columns, mobile one column.
- Vary card rotation only by `nth-child` within ±0.2 degrees.
- The signature answer tile flips on the Y axis; no other continuous or entrance animation.
- At `prefers-reduced-motion: reduce`, duration becomes `0.01ms`.
- Every control has a visible `:focus-visible` outline and at least 44px target size.

- [ ] **Step 4: Document visual alternatives and prohibitions**

`docs/ART-DIRECTION.md` must include:

- Applied direction: 方格紙圖形研究室.
- Alternatives: 蒙特梭利木質教具、夜間藍圖實驗室、和紙圖形研究室.
- Exact palette and typography stacks.
- Card, filter, answer tile, progress and empty-state specifications.
- Motion timing and reduced-motion behavior.
- Prohibitions: generic gradients, glassmorphism, emoji icons, excessive pills, neon, decorative motion, external fonts.

- [ ] **Step 5: Run automated tests**

Run: `node tests/run-tests.js`

Expected: all tests pass.

- [ ] **Step 6: Commit**

```powershell
git add -- css/styles.css index.html tests/run-tests.js docs/ART-DIRECTION.md
git commit -m "style: 套用方格紙圖形研究室視覺"
```

### Task 5: 專案文件與靜態託管準備

**Files:**
- Create: `README.md`
- Create: `docs/PLAN.md`
- Create: `docs/TEST-PLAN.md`
- Create: `CONTRIBUTING.md`
- Create: `LICENSE`
- Create: `.gitignore`
- Modify: `tests/run-tests.js`

**Interfaces:**
- Produces: documented commands `node tests/run-tests.js` and static hosting instructions

- [ ] **Step 1: Write failing documentation contract tests**

Check required headings and files:

```js
for (const path of ["README.md", "docs/PLAN.md", "docs/TEST-PLAN.md",
  "CONTRIBUTING.md", "LICENSE", ".gitignore"]) {
  assert.equal(fs.existsSync(path), true, `${path} 應存在`);
}
for (const heading of ["遊戲介紹", "特色", "操作方式", "安裝與執行",
  "專案結構", "測試方式", "靜態網站", "已知限制", "授權說明"]) {
  assert.match(read("README.md"), new RegExp(heading));
}
```

- [ ] **Step 2: Run test and verify RED**

Run: `node tests/run-tests.js`

Expected: FAIL because required files do not exist.

- [ ] **Step 3: Write all requested documents**

- `README.md`: cover every requested heading, direct-open steps, static server command, test command and project tree.
- `docs/PLAN.md`: requirements, scope, milestones, work breakdown, risks and acceptance criteria.
- `docs/TEST-PLAN.md`: functional, manual, desktop, tablet, mobile, accessibility and regression checklists.
- `CONTRIBUTING.md`: branch names, zh-TW Conventional Commits, TDD flow and no-secret rule.
- `LICENSE`: MIT License, copyright year 2026 and holder `Shape Sum Atelier contributors`.
- `.gitignore`: ignore OS/editor files, logs, coverage, `.env*`, certificates and private-key extensions.

- [ ] **Step 4: Run automated tests and secret-name audit**

Run:

```powershell
node tests/run-tests.js
rg --hidden --glob '!.git/**' --glob '!docs/superpowers/**' '(token|secret|password|api[_-]?key|BEGIN [A-Z ]*PRIVATE KEY)'
```

Expected: tests pass; the audit finds no credential values. Documentation mentions of forbidden secret concepts may be reviewed manually and are not credentials.

- [ ] **Step 5: Commit**

```powershell
git add -- README.md docs/PLAN.md docs/TEST-PLAN.md CONTRIBUTING.md LICENSE .gitignore tests/run-tests.js
git commit -m "docs: 補齊使用測試與貢獻文件"
```

### Task 6: 瀏覽器驗證、修正與發布準備

**Files:**
- Modify as needed: `index.html`, `css/styles.css`, `js/*.js`, `tests/run-tests.js`, `docs/TEST-PLAN.md`

**Interfaces:**
- Produces: verified static application at `index.html`

- [ ] **Step 1: Run the complete automated suite**

Run:

```powershell
node tests/run-tests.js
git diff --check
git status --short
```

Expected: all tests pass, no whitespace errors, only intentional uncommitted files if any.

- [ ] **Step 2: Verify direct-file execution**

Open the absolute `file:///F:/Codex/Projects/shape-sum-atelier/index.html` URL in a browser.

Verify:

- At least 30 question cards render.
- No console errors or failed network requests.
- First answer has `aria-expanded="false"`.
- Click reveals the blue answer and changes it to `true`.
- Second click hides it and returns it to `false`.
- Reload preserves the latest state when storage is available.

- [ ] **Step 3: Verify hosted desktop, tablet and mobile layouts**

Run a local static server, then inspect at:

- Desktop: 1440 × 1000, three columns.
- Tablet: 820 × 1180, two columns.
- Mobile: 390 × 844, one column with no horizontal overflow.

Capture screenshots for visual inspection. Test filtering, shuffle, reset cancellation, reset confirmation, keyboard focus and reduced motion.

- [ ] **Step 4: Fix each discovered issue with TDD**

For every logic or contract defect, add a failing assertion to `tests/run-tests.js`, confirm RED, apply the smallest correction, then confirm GREEN. For visual-only issues, record the failed viewport/check in `docs/TEST-PLAN.md`, correct CSS, and repeat the screenshot inspection.

- [ ] **Step 5: Request code review and address findings**

Invoke `superpowers:requesting-code-review`. Review against the approved spec, implementation plan, accessibility requirements and secret-safety constraints. Fix findings using the RED-GREEN cycle.

- [ ] **Step 6: Final verification and commit**

Run:

```powershell
node tests/run-tests.js
git diff --check
git status --short --branch
```

Commit only if browser verification required changes:

```powershell
git add -- index.html css js tests docs
git commit -m "fix: 修正瀏覽器驗證發現的問題"
```

- [ ] **Step 7: Finish branch and prepare push**

Invoke `superpowers:finishing-a-development-branch`. Configure:

```powershell
git remote add origin https://github.com/andychung0214/shape-sum-atelier.git
```

Then display:

```powershell
git remote -v
git branch --show-current
git log -1 --oneline
```

Only after displaying these exact values, run:

```powershell
git push -u origin main
```

