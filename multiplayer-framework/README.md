# Bunny Gala 遊戲套件 0.18

做 Bunny Gala 新遊戲用的套件，裡面有平台的遊戲契約、本機練習伺服器、兩款範例遊戲和交件檢查。
本機就能開單人桌和 online 多人桌：每個分頁是一位練習玩家，空位由機器人補上。

## 三步跑起來

需要 Node.js 22 以上。

```bash
npm install
npm run dev
```

然後打開 http://127.0.0.1:5190/ 。首頁會列出每款遊戲，選好房間後，按「以 alice 開啟」「以 bob 開啟」……，每個名字各開一個分頁，就是同一桌的不同玩家。

> `npm install` 如果出現 `install-scripts` 的警告（esbuild），可以忽略；套件不需要它。

## 目錄

| 路徑 | 內容 | 可以改嗎 |
|---|---|---|
| `contract/` | 遊戲契約 `@bunny-gala/contract`：型別（`src/index.ts`）、牌桌連線、返回鍵、音效、橫屏 | **不要改** |
| `platform/` | 練習伺服器：正式的牌桌引擎（`src/tables/table.ts`）、記憶體帳本、練習玩家 | **不要改** |
| `launcher/` | 首頁 | 不用改 |
| `games/fortune-3-card/` | 富貴三寶（Three Card Poker）：已上線的單人對莊家遊戲，有完整的大廳、美術和音效 | 參考用 |
| `games/carrot-duel/` | 胡蘿蔔比大小：online 多人桌的最小範例，每段都有註解對應契約 | 參考用 |
| `games/_template/` | 新遊戲的空白骨架 | 複製它 |
| `docs/` | 外包指南、給 AI 的說明、共用元件、交件清單、美術風格、限額 | 必讀 |
| `tests/` | 每款遊戲都會自動跑的測試 | 不要改 |

## 做一款新遊戲

1. 複製 `games/_template`，資料夾改成你的遊戲 id（英文小寫和 `-`，例如 `games/bunny-baccarat`）。
2. 把這三個地方改成同一個 id：
   - `package.json` 的 `name`：`@bunny-gala/game-bunny-baccarat`
   - `src/game.ts` 的 `gameId`：`bunny-baccarat`
   - `web/vite.config.ts` 的 `base`：`/play/bunny-baccarat/`
3. 重新執行 `npm install`，再執行 `npm run dev`。首頁就會出現你的遊戲。
4. 照 `docs/外包指南.md` 寫規則（`src/logic.ts`、`src/game.ts`）和畫面（`src/view.ts`、`web/`）。
5. 隨時跑 `npm run check <遊戲id>`，全部 ✔ 才算完成。

## 跟團隊一起測 online

`npm run dev` 開著，另開一個終端機：

```bash
cloudflared tunnel --url http://localhost:5190
```

它會印出一個 `https://….trycloudflare.com` 網址，團隊成員打開它，網址後面加 `/play/<遊戲id>/?name=自己的名字`，就能坐到同一桌。（安裝：`brew install cloudflared`。網址每次重開都會變。）

## 交件

```bash
npm run check <遊戲id>
```

全部 ✔ 之後，把 `games/<遊戲id>/` 打包成 zip，連同 check 的輸出一起交。詳細清單見 `docs/交件清單.md`。

## 其他指令

| 指令 | 用途 |
|---|---|
| `npm test` | 跑全部測試 |
| `npm run typecheck` | 型別檢查 |
| `npm run check <遊戲id>` | 交件檢查 |

和 0.17 的差別見 `CHANGES-0.18.md`。
