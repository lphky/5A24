# Minesweeper: Frontline Hazard

純前端掃雷與射擊雙線遊戲，無後端或帳戶。

- 正式入口：`index.html`，兩階段增援在 120 秒與 300 秒出現，新兵有護甲及移動。
- 另一版本：`minesweeper_frontline_hazard.html`，保留原有 240 秒增援規則。
- GitHub Pages：https://lphky.github.io/5A24/ ，使用 main 分支根目錄。
- Tailwind CSS 與 Google Fonts 透過外部服務載入，需要網絡；未提供完整離線模式。

左鍵／單指點擊士兵射擊；掃雷左鍵揭格、右鍵插旗、雙擊已揭數字快速揭開周圍格子。手機插旗及完整鍵盤操作尚待下一版本討論。

## 驗證

已安裝 agent-browser 時，可在專案目錄執行：

```sh
agent-browser open "file://$PWD/index.html"
agent-browser eval --stdin < tests/browser-regression.js
agent-browser open "file://$PWD/minesweeper_frontline_hazard.html"
agent-browser eval --stdin < tests/browser-regression.js
```

結果與限制見 `TEST-RESULTS.md`。
