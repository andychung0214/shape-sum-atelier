# 貢獻指南

感謝協助改善形算小工房。請保持題目規則可驗證、介面適合兒童，並維持專案零相依與直接執行的特性。

## 開發流程

1. 從最新 `main` 建立分支。
2. 功能使用 `feature/xxx`，修正使用 `fix/xxx`，維護使用 `chore/xxx`。
3. 先新增會因缺少功能而失敗的測試。
4. 執行 `node tests/run-tests.js` 確認測試以預期原因失敗。
5. 撰寫最小實作使測試通過，再進行整理。
6. 直接開啟 `index.html`，完成桌機、平板、手機與鍵盤檢查。
7. 提交前執行 `git diff --check` 並確認沒有秘密資料。

## 程式碼規範

- 使用具語意的英文命名。
- JavaScript 使用嚴格模式、兩格縮排及尾端逗號。
- 中文 UI、註解與文件使用 zh-TW。
- 保持 `core.js`、`state.js` 與 `app.js` 的責任分離。
- 題目答案必須由 `combine` 函式產生，不可手寫互相矛盾的答案。
- 不加入框架、外部字型、CDN 或必須建構的流程。
- 新互動必須支援鍵盤與減少動態效果。

## Commit 訊息

使用 Conventional Commits，描述必須是 zh-TW：

```text
feat: 新增圖形難度篩選
fix: 修正行動裝置翻牌尺寸
docs: 更新靜態網站部署說明
```

可使用的 type 包含 `feat`、`fix`、`docs`、`style`、`refactor`、`test`、`chore`、`build`、`ci` 與 `perf`。

## 安全

- 不讀取、提交或推送憑證、token、`.env`、憑證檔或私人金鑰。
- 不將秘密資料放入範例、測試資料或 Git 歷史。
- 發現疑似秘密資料時停止提交，先移除並通知維護者。

## 提交前檢查

```powershell
node tests/run-tests.js
git diff --check
git status --short
```

所有測試必須通過，且變更範圍只能包含本次工作。

