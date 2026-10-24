# 給 AI 的說明（整份貼給你的 AI 助手）

你要幫忙寫一款 Bunny Gala 遊戲。Bunny Gala 是多人賭場平台：規則在伺服器跑，瀏覽器只畫畫面。請嚴格遵守以下規範。

## 你在哪裡寫程式

- 只能改 `games/<遊戲id>/`。**不要改** `contract/`、`platform/`、`tests/`、`launcher/`。
- 型別的唯一來源是 `contract/src/index.ts`（`GameLogic`、`GameView`、`HostApi`、`RoundContext`）。動手前先讀它，再讀 `docs/外包指南.md`。
- 照 `games/carrot-duel/` 的結構寫：
  ```
  games/<id>/
    package.json          name: "@bunny-gala/game-<id>"，exports: { ".": "./src/index.ts", "./logic": "./src/game.ts" }
    src/logic.ts          State、Action、View 型別和純函式
    src/game.ts           export const logic: GameLogic<State, Action, View>（伺服器只載入這個檔）
    src/view.ts           export const view: GameView<View, Action>
    src/index.ts          export const game: GameModule<State, Action, View> = { ...logic, view }
    web/vite.config.ts    base: '/play/<id>/'，input: index.html（大廳）、play.html（牌桌）
    web/index.html, web/lobby.ts, web/play.html, web/play.ts
    web/public/           美術和音效
    tests/privacy.test.ts 必須
  ```

## 硬規則

1. `src/logic.ts` 和 `src/game.ts` 不能 import 任何瀏覽器的東西，不能碰 `document`、`window`。
2. 規則裡不能用 `Math.random`、`Date.now()` 或任何非決定性的東西。亂數只能來自 `ctx.draw`：它是 16 個 0–51 的數字，可能重複，要用 `games/carrot-duel/src/logic.ts` 的 `shuffleFromDraw` 那種方式洗牌。
3. `reduce` 不能改傳入的 state，每次都要回傳新的物件。不合法的動作回傳原本的 state。
4. state 只能放 JSON 能存的值（不能放 Map、Set、Date、class 實例、函式）。
5. `random: "server"` 一定要有 `privateView`。它只給該座位看得到的東西；`seat === -1`（觀戰）時誰的暗牌都不給。
6. `liability(state, seat)` 是該座位要鎖在桌上的紅蘿蔔總數：必須是 0 或正整數、不超過 `ctx.limits.maxStake`、開局不超過 `minStake(limits)`；`dealt(state)` 為 true 之後只能維持或增加；平台只在動作之後鎖紅蘿蔔，所以不能在 draw 時讓它變多。
7. `result(state).payouts` 包含退回的本金。`pve: false` 的遊戲派彩總和必須等於所有座位押注總和。
8. `pve: true` 時座位 0 是莊家；玩家從座位 1 開始。
9. 動作帶 `seat` 時，伺服器會蓋成送出者的座位；`reduce` 要檢查 `action.seat` 是不是 `actors(state)` 裡的人。
10. 多人遊戲（`seats >= 2`）一定要寫 `bot()`：機器人會坐滿空位。
11. 畫面只畫 `render(view, ctx)` 給的資料，用 `host.act()` 送動作，不要自己算輸贏。玩家名字（`displayName`）是任意文字，放進 HTML 前一定要跳脫。
12. 返回鍵用 `backButton()`、橫屏用 `landscapeOnly()`、音效用 `@bunny-gala/contract/audio`（見 `docs/共用元件.md`），不要自己做。
13. 注額用 `ctx.limits`（`minBet`、`maxBet`、`maxStake`）表示，不要寫死。
14. 版面以橫屏 812×375 為基準，不能重疊。不能出現抽菸、喝酒。

## 完成的定義

`npm run check <遊戲id>` 全部 ✔（⚠ 要說明原因）。沒跑過 check，不能說完成。
