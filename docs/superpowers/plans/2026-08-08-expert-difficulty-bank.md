# 專家難度與題庫擴充實作計畫

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 保留既有 80 題、架構與互動，新增專家 12 題並讓既有四難度各增加 6 題，將題庫擴充至 116 題。

**Architecture:** 保留 `core.js` 題庫／集合運算、`state.js` 純狀態、`app.js` DOM 控制器與既有 HTML/CSS。只追加題庫資料、expert allowlist／標籤／選項與測試，不新增狀態欄位、儲存版本、元件或玩法。

**Tech Stack:** HTML5、CSS3、Vanilla JavaScript ES2020、SVG、`localStorage`、Node.js 內建 `assert`、Git。

## Global Constraints

- 總題數恰為 116；`easy`、`medium`、`hard`、`challenge` 各 26 題，`expert` 12 題。
- 既有四難度各有 13 題加法與 13 題減法；`expert` 有 6 題加法與 6 題減法。
- 原有 80 題識別碼、運算元、答案與順序不得改變；新增題目只能追加。
- 只使用既有 15 種片段，不使用框架、CDN、後端、新玩法或新儲存版本。
- 保持 `shape-sum-atelier-state-v1` 與 `STORAGE_VERSION = 1`。
- 所有程式變更先建立失敗測試；Commit 使用 Conventional Commits zh-TW 描述。
- 推送前顯示 remote、branch、commit，之後才 `git push origin main`。

---

### Task 1: 題庫分布測試與 36 道新題

**Files:** `tests/run-tests.js`, `js/core.js`

- [ ] **Step 1: Write failing tests**

新增下列真實題庫測試，預期目前程式先失敗：

```js
test("題庫提供一百一十六題", () => {
  assert.equal(core.QUESTIONS.length, 116);
});

test("五個難度各有指定題數與加減分布", () => {
  const expected = {
    easy: { total: 26, add: 13, subtract: 13 },
    medium: { total: 26, add: 13, subtract: 13 },
    hard: { total: 26, add: 13, subtract: 13 },
    challenge: { total: 26, add: 13, subtract: 13 },
    expert: { total: 12, add: 6, subtract: 6 },
  };
  for (const [difficulty, counts] of Object.entries(expected)) {
    const questions = core.QUESTIONS.filter((q) => q.difficulty === difficulty);
    assert.equal(questions.length, counts.total, `${difficulty} 題數`);
    assert.equal(questions.filter((q) => q.operator === "add").length, counts.add);
    assert.equal(questions.filter((q) => q.operator === "subtract").length, counts.subtract);
  }
});

test("專家難度可正規化並篩選十二題", () => {
  const normalized = stateApi.normalizeState(
    { difficulty: "expert", operator: "all" },
    core.QUESTIONS.map((q) => q.id),
  );
  assert.equal(normalized.difficulty, "expert");
  assert.equal(stateApi.filterQuestions(core.QUESTIONS, normalized).length, 12);
});
```

- [ ] **Step 2: Run RED**

Run `node tests/run-tests.js`. Expected failure: 80 vs 116 題、既有難度 20 vs 26 題、expert 0 題，且 expert 狀態回到 `all`。

- [ ] **Step 3: Append 24 existing-difficulty questions**

在既有 80 題之後追加，所有答案由現有 `combine()` 自動產生；右側減法運算元必須是左側子集合：

```text
easy-add-11 [top,middleH]+[bottom]; easy-add-12 [left,middleV]+[right]; easy-add-13 [diagDown]+[center]
easy-subtract-11 [top,middleH,bottom]-[middleH]; easy-subtract-12 [left,middleV,right]-[right]; easy-subtract-13 [diagDown,center]-[center]
medium-add-11 [top,left,middleH]+[bottom,left]; medium-add-12 [arcLeft,bowlLeft,center]+[arcRight,bowlLeft,center]; medium-add-13 [roofLeft,middleV,diagDown]+[roofRight,middleV,diagUp]
medium-subtract-11 [top,right,bottom,middleH]-[right,middleH]; medium-subtract-12 [arcLeft,arcRight,bowlLeft,bowlRight]-[arcRight,bowlLeft]; medium-subtract-13 [roofLeft,roofRight,middleV,center]-[middleV]
hard-add-11 [top,right,bottom,diagDown]+[left,middleH,diagUp,center]; hard-add-12 [arcLeft,arcRight,bowlLeft,center]+[arcRight,bowlRight,diagUp,middleV]; hard-add-13 [roofLeft,roofRight,left,middleH]+[right,bottom,diagDown,center]
hard-subtract-11 [top,right,bottom,left,diagDown,middleV,center]-[right,diagDown,center]; hard-subtract-12 [arcLeft,arcRight,bowlLeft,bowlRight,middleH,diagUp]-[arcRight,bowlLeft]; hard-subtract-13 [roofLeft,roofRight,top,bottom,middleV,diagDown,center]-[roofLeft,middleV,center]
challenge-add-11 [top,right,bottom,left,diagDown,center]+[top,right,middleH,diagUp,center]; challenge-add-12 [arcLeft,arcRight,bowlLeft,bowlRight,middleV,center]+[arcLeft,bowlLeft,middleH,diagDown,center]; challenge-add-13 [roofLeft,roofRight,left,right,middleV,diagUp]+[roofLeft,right,bottom,middleH,diagDown,diagUp]
challenge-subtract-11 [top,right,bottom,left,middleH,middleV,diagDown,diagUp,center]-[middleH,diagUp,center]; challenge-subtract-12 [arcLeft,arcRight,bowlLeft,bowlRight,middleH,middleV,diagDown,diagUp,center]-[arcLeft,bowlRight,middleV,diagUp]; challenge-subtract-13 [roofLeft,roofRight,top,right,bottom,left,middleH,middleV,center]-[roofRight,right,middleH,center]
```

- [ ] **Step 4: Append 12 expert questions and extend validation**

Append these exact specs after the 24 existing-difficulty specs:

```text
expert-add-01 [top,right,bottom,left,middleH,diagDown,center]+[top,right,middleV,diagUp,center,roofLeft]
expert-add-02 [arcLeft,arcRight,bowlLeft,bowlRight,middleH,middleV,center]+[arcLeft,bowlLeft,diagDown,diagUp,center,roofRight]
expert-add-03 [roofLeft,roofRight,left,right,middleV,diagDown,center]+[roofLeft,right,bottom,middleH,diagUp,center,bowlRight]
expert-add-04 [top,bottom,diagDown,diagUp,middleH,middleV,center]+[top,bottom,left,right,middleH,roofLeft,roofRight]
expert-add-05 [arcLeft,arcRight,bowlLeft,middleH,middleV,center,diagDown]+[arcLeft,arcRight,bowlRight,middleH,roofLeft,roofRight,diagUp]
expert-add-06 [top,right,bowlRight,diagDown,diagUp,center,roofLeft]+[top,right,bowlLeft,diagDown,middleV,center,roofRight]
expert-subtract-01 [top,right,bottom,left,middleH,middleV,diagDown,diagUp,roofLeft,center]-[top,diagDown,roofLeft,center]
expert-subtract-02 [arcLeft,arcRight,bowlLeft,bowlRight,middleH,middleV,diagDown,diagUp,center,roofRight]-[arcRight,bowlLeft,middleV,center]
expert-subtract-03 [roofLeft,roofRight,top,right,bottom,left,middleH,middleV,diagDown,center,bowlRight]-[roofLeft,right,middleH,center,bowlRight]
expert-subtract-04 [top,bottom,left,right,arcLeft,arcRight,bowlLeft,bowlRight,diagUp,center]-[top,left,arcRight,center]
expert-subtract-05 [roofLeft,roofRight,middleH,middleV,diagDown,diagUp,arcLeft,arcRight,bowlLeft,bowlRight,center]-[roofRight,middleV,diagUp,bowlLeft,center]
expert-subtract-06 [top,right,bottom,left,middleH,middleV,diagDown,diagUp,roofLeft,roofRight,center,bowlRight]-[right,middleV,diagDown,roofLeft,center]
```

Change the core difficulty allowlist to `["easy", "medium", "hard", "challenge", "expert"]`.

- [ ] **Step 5: Run GREEN**

Run `node tests/run-tests.js`; expected 116 題、五難度精確分布、expert 篩選 12 題與 `validateBank()` 全數通過。

- [ ] **Step 6: Commit**

```powershell
git add -- js/core.js tests/run-tests.js
git commit -m "feat: 新增專家難度並擴充圖形題庫"
```

### Task 2: 專家篩選、標籤、保存與瀏覽器測試

**Files:** `tests/run-tests.js`, `js/state.js`, `js/app.js`, `index.html`, `tests/browser-smoke.html`

- [ ] **Step 1: Write failing UI contracts**

```js
assert.match(indexHtml, /<option value="expert">專家<\/option>/);
assert.match(appJs, /expert:\s*"專家"/);
assert.match(smokeTest, /value\s*=\s*"expert"/);
assert.match(smokeTest, /length\s*===\s*116/);
assert.match(smokeTest, /length\s*===\s*12/);
assert.match(smokeTest, /length\s*===\s*6/);
assert.match(smokeTest, /expert-subtract-01/);
```

- [ ] **Step 2: Run RED**

Run `node tests/run-tests.js`; expected expert allowlist、選項、標籤與 116 題冒煙契約失敗。

- [ ] **Step 3: Implement minimal changes**

Append `"expert"` to `state.js` `DIFFICULTIES`; append `expert: "專家"` to `app.js` `difficultyLabels`; append `<option value="expert">專家</option>` to `index.html`.

Update the smoke flow: clear v1 state; assert 116 initial cards; select expert/all and assert 12; select subtract and assert 6; select add and assert 6; click `expert-add-01`; reload and assert expert/add/6 cards plus expanded state; reset.

- [ ] **Step 4: Run GREEN**

Run `node tests/run-tests.js`; expected all Node.js tests pass.

- [ ] **Step 5: Commit**

```powershell
git add -- js/state.js js/app.js index.html tests/run-tests.js tests/browser-smoke.html
git commit -m "feat: 新增專家難度篩選與保存"
```

### Task 3: 文件、瀏覽器驗證、審查與發布

**Files:** `README.md`, `docs/PLAN.md`, `docs/TEST-PLAN.md`

- [ ] **Step 1: Update documentation**

更新 README、PLAN、TEST-PLAN 為 116 題、五難度與 `26/26/26/26/12` 分布；加入專家 12／6／6 題、翻牌保存與 RWD 驗收，保留歷史紀錄標示。

- [ ] **Step 2: Run full checks**

```powershell
node tests/run-tests.js
node --check js/core.js
node --check js/state.js
node --check js/app.js
git diff --check
```

另以唯讀 Node.js 比對 `origin/main` 基線，確認既有 80 題完整物件內容未變。

- [ ] **Step 3: Run browser verification**

透過本機 HTTP 執行 `tests/browser-smoke.html`，狀態必須為 `passed`；檢查 1440／820／390 寬度的三欄／雙欄／單欄、無水平捲動、專家 12／6／6 題、翻牌保存及乾淨首頁主控台。

- [ ] **Step 4: Request code review**

使用 `superpowers:requesting-code-review` 審查既有 80 題、新增 36 題、expert 狀態相容性、冒煙測試與文件；修正 Critical／Important 後重跑測試。

- [ ] **Step 5: Commit documentation**

```powershell
git add -- README.md docs/PLAN.md docs/TEST-PLAN.md
git commit -m "docs: 更新專家難度與題庫測試說明"
```

- [ ] **Step 6: Merge and push**

使用 `superpowers:finishing-a-development-branch` 合併到 `main`；推送前顯示 `git remote get-url origin`、`git symbolic-ref --short HEAD`、`git log -1 --format="%H %s"`，確認後執行 `git push origin main`。推送後 `git fetch origin`，比對 `main` 與 `origin/main` 並確認工作樹乾淨。
