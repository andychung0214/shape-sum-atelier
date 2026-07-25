# Expanded Difficulty Bank Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在不改變現有程式架構與互動的前提下，新增挑戰難度並把四個難度各擴充為 20 題，共 80 題。

**Architecture:** 保留 `core.js` 的靜態 `QUESTION_SPECS` 與集合運算、`state.js` 的純狀態模型、`app.js` 的 DOM 控制器。只擴充題庫資料與四個難度 allowlist／標籤，既有 36 題識別碼、儲存版本、視覺與互動不變。

**Tech Stack:** HTML5、CSS3、Vanilla JavaScript ES2020、SVG、`localStorage`、Node.js 內建 `assert`、Git。

## Global Constraints

- 題庫必須恰為 80 題，四個難度各 20 題。
- 每個難度必須恰有 10 題加法與 10 題減法。
- 原有 36 題的識別碼、運算元與答案不得改變。
- 不新增圖形片段、玩法、狀態欄位、儲存版本或 UI 元件。
- 不使用框架、套件管理器、外部字型、CDN 或建構流程。
- 中文 UI、註解與文件遵守 AGENTS.md 的 zh-TW 名詞翻譯規範。
- 所有程式變更先建立會因缺少功能而失敗的測試。
- 推送前顯示 remote、branch 與 commit。

---

## File Map

```text
js/core.js               # 新增 44 道靜態題目與 challenge 驗證
js/state.js              # challenge 篩選 allowlist
js/app.js                # challenge 中文標籤
index.html               # 挑戰難度選項
tests/run-tests.js       # 80／20／10 精確分布與狀態行為測試
tests/browser-smoke.html # 80 題、初階加法 10 題、挑戰保存整合測試
README.md                # 四難度與 80 題說明
docs/PLAN.md             # 規模與驗收條件
docs/TEST-PLAN.md        # 新測試範圍與驗證紀錄
```

### Task 1: 精確題庫分布與 44 道新題

**Files:**
- Modify: `tests/run-tests.js`
- Modify: `js/core.js`

**Interfaces:**
- Consumes: `ShapeSumCore.combine()`、15 種既有 `SEGMENTS`
- Produces: `ShapeSumCore.QUESTIONS`，恰有 80 道不可變題目
- Produces: `validateQuestion()` 接受 `easy|medium|hard|challenge`

- [ ] **Step 1: Write failing distribution tests**

新增真實題庫行為測試；若題目漏加、運算分布錯誤或 `challenge` 未被驗證接受，測試必須失敗：

```js
test("題庫恰有八十題", () => {
  assert.equal(core.QUESTIONS.length, 80);
});

test("四個難度各有二十題且加減各十題", () => {
  for (const difficulty of ["easy", "medium", "hard", "challenge"]) {
    const questions = core.QUESTIONS.filter(
      (question) => question.difficulty === difficulty,
    );
    assert.equal(questions.length, 20);
    assert.equal(
      questions.filter((question) => question.operator === "add").length,
      10,
    );
    assert.equal(
      questions.filter((question) => question.operator === "subtract").length,
      10,
    );
  }
});
```

保留 `validateBank(core.QUESTIONS)` 等於空陣列的既有測試。把舊的「至少 30 題」改成只驗證片段數，避免與精確 80 題測試重複。

- [ ] **Step 2: Run test and verify RED**

Run: `node tests/run-tests.js`

Expected: FAIL，實際題數為 36，且 `challenge` 為 0 題。

- [ ] **Step 3: Add 24 questions to existing difficulties**

在 `QUESTION_SPECS` 追加下列識別碼，每組依序 4 題：

```text
easy-add-07..10, easy-subtract-07..10
medium-add-07..10, medium-subtract-07..10
hard-add-07..10, hard-subtract-07..10
```

初階使用單線、十字、平行線與中心記號；中階使用 3 至 4 個片段與一個重疊片段；進階使用 4 至 7 個片段並混合外框、斜線與圓弧。每道減法右側都必須是左側真子集合且保留非空答案。

- [ ] **Step 4: Add 20 challenge questions**

新增 `challenge-add-01..10` 與 `challenge-subtract-01..10`。加法的結果使用 8 至 10 個唯一片段且有 2 至 4 個重疊片段；減法左側使用 8 至 10 個片段、移除 2 至 4 個片段、保留 5 至 7 個答案片段。

題目只能使用：

```text
top, right, bottom, left, middleH, middleV, diagDown, diagUp,
roofLeft, roofRight, bowlLeft, bowlRight, arcLeft, arcRight, center
```

將驗證 allowlist 改為：

```js
["easy", "medium", "hard", "challenge"]
```

- [ ] **Step 5: Run test and verify GREEN**

Run: `node tests/run-tests.js`

Expected: 精確題數與分布測試通過，`validateBank()` 回傳空陣列。

- [ ] **Step 6: Commit**

```powershell
git add -- js/core.js tests/run-tests.js
git commit -m "feat: 擴充四難度圖形題庫至八十題"
```

### Task 2: 挑戰篩選、標籤與保存

**Files:**
- Modify: `tests/run-tests.js`
- Modify: `js/state.js`
- Modify: `js/app.js`
- Modify: `index.html`
- Modify: `tests/browser-smoke.html`

**Interfaces:**
- Consumes: `question.difficulty === "challenge"`
- Produces: `normalizeState(...).difficulty === "challenge"`
- Produces: 挑戰篩選 20 題；挑戰加法／減法各 10 題
- Produces: UI 中文標籤「挑戰」

- [ ] **Step 1: Write failing challenge behavior tests**

```js
test("挑戰狀態可正規化並篩選二十題", () => {
  const normalized = stateApi.normalizeState(
    { difficulty: "challenge", operator: "all" },
    core.QUESTIONS.map((question) => question.id),
  );
  assert.equal(normalized.difficulty, "challenge");
  assert.equal(
    stateApi.filterQuestions(core.QUESTIONS, normalized).length,
    20,
  );
});
```

在瀏覽器靜態契約測試加入選項與標籤：

```js
assert.match(indexHtml, /<option value="challenge">挑戰<\/option>/);
assert.match(appJs, /challenge:\s*"挑戰"/);
```

修改瀏覽器冒煙測試的可觀察結果：

- 首次繪製由 36 題改為 80 題。
- 初階加法由 6 題改為 10 題。
- 設定 `difficulty="challenge"` 後必須顯示 20 題。
- 重新載入後必須仍為 `challenge` 且保持翻牌狀態。

- [ ] **Step 2: Run test and verify RED**

Run: `node tests/run-tests.js`

Expected: FAIL，`challenge` 被正規化為 `all`，HTML／應用程式沒有挑戰標籤。

- [ ] **Step 3: Implement challenge state and UI**

`js/state.js`：

```js
const DIFFICULTIES = new Set([
  "all",
  "easy",
  "medium",
  "hard",
  "challenge",
]);
```

`js/app.js`：

```js
const difficultyLabels = {
  easy: "初階",
  medium: "中階",
  hard: "進階",
  challenge: "挑戰",
};
```

`index.html`：

```html
<option value="challenge">挑戰</option>
```

更新 `tests/browser-smoke.html` 的真實 DOM 互動，使用 iframe 的 `Event` 切換至挑戰難度，斷言 20 題，翻開第一道挑戰題後重新載入，斷言篩選與翻牌仍保留，最後重置測試狀態。

- [ ] **Step 4: Run test and verify GREEN**

Run: `node tests/run-tests.js`

Expected: 所有 Node.js 測試通過。

- [ ] **Step 5: Commit**

```powershell
git add -- js/state.js js/app.js index.html tests/run-tests.js tests/browser-smoke.html
git commit -m "feat: 新增挑戰難度篩選與保存"
```

### Task 3: 文件、瀏覽器驗證與發布

**Files:**
- Modify: `README.md`
- Modify: `docs/PLAN.md`
- Modify: `docs/TEST-PLAN.md`

**Interfaces:**
- Produces: 與 80 題、四難度一致的使用及測試文件

- [ ] **Step 1: Update human documentation**

將舊的 36 題／三難度／每類 6 題文字更新為：

```text
80 道題目
初階、中階、進階、挑戰四種難度
每個難度 20 題，加法與減法各 10 題
```

在測試計畫加入挑戰難度的篩選、翻牌、重新載入保存與四種難度精確分布檢查。既有 2026-07-24 的 36 題驗證紀錄標記為首版歷史紀錄，不冒充本次結果。

- [ ] **Step 2: Run full automated verification**

```powershell
node tests/run-tests.js
node --check js/core.js
node --check js/state.js
node --check js/app.js
git diff --check
```

Expected: 所有測試通過，JavaScript 語法及空白檢查無錯誤。

- [ ] **Step 3: Run browser verification**

透過本機 HTTP 執行 `tests/browser-smoke.html`，頁面狀態必須為 `passed`。再檢查：

- 1440 × 1000：三欄、80 題、無水平捲動。
- 820 × 1180：雙欄、無水平捲動。
- 390 × 844：單欄、無水平捲動。
- 挑戰篩選 20 題，挑戰加法及減法各 10 題。
- 挑戰題翻牌與重新載入保存。
- 主控台 0 個警告、0 個錯誤。

- [ ] **Step 4: Request code review**

使用 `superpowers:requesting-code-review`，審查：

- 原有 36 題是否未變。
- 新增 44 題是否符合難度與集合規則。
- 四難度精確分布與狀態相容性。
- 瀏覽器冒煙測試是否測試真實首頁行為。

修正 Critical 與 Important 問題後重新執行完整測試。

- [ ] **Step 5: Commit documentation and verification evidence**

```powershell
git add -- README.md docs/PLAN.md docs/TEST-PLAN.md
git commit -m "docs: 更新四難度題庫與測試說明"
```

- [ ] **Step 6: Finish and push**

使用 `superpowers:finishing-a-development-branch` 合併到 `main`。推送前依序顯示：

```powershell
git remote -v
git symbolic-ref --short HEAD
git log -1 --oneline
```

確認 remote、branch、commit 後執行：

```powershell
git push origin main
```
