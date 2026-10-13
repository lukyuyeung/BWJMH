# 新牌桌 UI 與直接入局

## 操作

- 理：自動理牌。
- 和：只在伺服器確認可榮和／自摸時自動和牌。
- 鳴：開啟後顯示「不鳴」，略過吃／碰／明槓的叫牌提示，保留合法和牌。
- 切：合法時摸切；可自摸、或吃碰後沒有新摸牌時不會擅自打牌。
- 立直、吃、碰、明槓、暗槓、加槓、過及和牌按鈕依伺服器合法操作顯示；無操作時不顯示佔位按鈕。觸控仍需選牌後確認打出。
- 中央只顯示局目與剩餘牌數。本場、供託及真實計分資料保留在伺服器與結算畫面。
- 右上：設定、牌譜（待設計）、役種、全螢幕。役種指南只列遊戲已支援的 38 種役，聽牌提示不代表無振聽或一定有役。
- 牌河保持六張一行及真實打出順序；正面檢視包括四家的公開牌河與副露。叫牌方向、明槓四張、加槓疊牌、暗槓中間兩張牌背保留。

## 直接入局

正常開頁不經建立房間或準備流程；優先恢復 `bunny-riichi-session` 的同一座位。未有身份時，`room:quick-start` 建立本地測試用一人加三機械人的牌局，同一 socket 重複要求不會開第二個房間、重發手牌或延長行動倒數。恢復自己的單人等候房間時會自動補齊機械人並開始；真正多人房間只準備自己，仍等其他玩家各自準備。

這不是已接通另一個遊戲的配對／帳戶 API。接入本伺服器的既有牌局時，宿主 App 必須在遊戲連線前提供有效 session：

```js
window.bunnyGalaSession = { code, playerId, resumeToken };
```

或在同頁發送：

```js
window.dispatchEvent(new CustomEvent('bunny:game-session', {
  detail: { code, playerId, resumeToken }
}));
```

接入資料會走現有的伺服器重連驗證；無效身份會報錯，不會擅自改成另一局。不要將 resumeToken 放在網址或公開牌譜中。第三方遊戲若不是本伺服器协议，需要提供其 API 才可接入。

Bunny Gala 帳戶頭像與完整歷史牌譜依使用者要求留待之後完成；已移除遊戲內頭像自選介面，保留現有 avatarUrl 資料及資料入口。

`?lobby=1` 只供舊多人開房流程及開發測試使用，正常進入遊戲不需要此參數。

## 測試

- `npm run typecheck`、`npm run build`。
- `npm run test -w @bunny/server -- test/quick-start.test.ts test/avatar.test.ts test/product-direction.test.ts`。
- `QA_CHROMIUM_PATH=/usr/bin/chromium QA_OUTPUT_DIR=/tmp/bunny-table-qa node --import tsx scripts/browser-table-ui.mjs`。
- `QA_CHROMIUM_PATH=/usr/bin/chromium QA_OUTPUT_DIR=/tmp/bunny-fullscreen-qa npm run test:browser:fullscreen`。

瀏覽器模擬不等同實體電話／Safari 驗收；參考圖中未提供的全身模型及場景不會被當成已完成素材。
