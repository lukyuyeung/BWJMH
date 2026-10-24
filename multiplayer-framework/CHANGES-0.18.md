# 0.17 → 0.18 的變更

給拿過 0.17 套件的團隊看。0.18 的契約和牌桌引擎是從正式平台**直接複製**的，和上線的版本完全一樣。帳本換成記憶體版，規則和正式的相同：紅蘿蔔必須是整數，state 必須能存成 JSON，否則這一手會作廢退錢。

## 套件結構

- 練習伺服器用的是**正式的牌桌引擎**（`platform/src/tables/table.ts`），只把帳本換成記憶體版。online 會遇到的情況，本機都和正式環境一樣。
- 新的首頁（launcher）：選遊戲、選房間，用 alice / bob / carol / dave 各開一個分頁就是不同玩家；可以看和重設餘額。
- `games/` 裡的遊戲**自動載入**，不用改平台檔案。gameId 必須等於資料夾名稱。
- 新的範例 `games/carrot-duel`：online 多人桌的最小範例。
- 新的骨架 `games/_template`。
- 新的交件檢查 `npm run check <遊戲id>`，以及每款遊戲都會自動跑的測試。
- 練習玩家改用網址的 `?name=`，不用另外換 session。

## 契約新增（`contract/src/index.ts`）

| 新增 | 說明 |
|---|---|
| `maxPayoutMultiple` | 一手最多贏押注的幾倍，超過的派彩平台會封頂。預設 41 |
| `minStake(limits)` | 坐下至少要付得起多少，平台只讓付得起的人進房間 |
| `tableOptions` | 大廳的選擇，只有選一樣的人會同桌，規則從 `ctx.options` 讀 |
| `nextOptions(state, options)` | 把資料帶到下一手 |
| `restMs` | 多人桌結果顯示多久才開下一手（一定等滿）。預設 5000 |
| `liveTurns` | 動作一送到就生效，同一輪可以送很多次（下注桌） |
| `HostApi.takeSeat(seat)` | 觀戰時接手機器人的座位，下一手開始加入 |
| `playGame(..., { autoStart: false })` | 畫面自己有房間選擇時使用 |
| `ctx.limits` | 房間限額 `unit`、`minBet`、`maxBet`、`maxStake`，取代各遊戲自己寫的注額表 |
| `SeatView.stakeCap` | 這個座位這手最多能鎖多少 |

## 行為改變

- 動作裡的 `seat` 一定會被伺服器蓋成送出者的座位。
- 多人桌忽略 `setOptions`，請用 `tableOptions`。
- 中途加入多人桌的人先觀戰（`ctx.you === -1`），`privateView` 會收到 `seat = -1`。
- 一手要先結算完成，才會公布結果（每一條路都一樣）。

## 共用元件（新）

- `@bunny-gala/contract/back`：`backButton()`，每款遊戲同一個返回鍵。
- `@bunny-gala/contract/audio`：音樂和音效分開的開關，切到背景時暫停。
- `@bunny-gala/contract/landscape`：`landscapeOnly()`，整個 Bunny Gala 只有橫屏。

## 限額

房間單位：新手 10、中級 100、高級 1,000、神級 10,000。
- minBet = 1 單位
- maxBet = 100 單位
- maxStake = 300 單位
- 不再有「佔餘額幾 %」的上限

數字是暫定的，見 `docs/LIMITS.md`。
