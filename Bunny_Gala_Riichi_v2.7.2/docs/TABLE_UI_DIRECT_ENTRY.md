# 新牌桌 UI 與直接入局

## 操作

- 理：自動理牌。
- 和：只在伺服器確認可榮和／自摸時自動和牌。
- 鳴：開啟後顯示「不鳴」，略過吃／碰／明槓的叫牌提示，保留合法和牌。
- 切：合法時摸切；可自摸、或吃碰後沒有新摸牌時不會擅自打牌。
- 立直、吃、碰、明槓、暗槓、加槓、過及和牌按鈕依伺服器合法操作顯示；無操作時不顯示佔位按鈕。觸控仍需選牌後確認打出。
- 中央只顯示局目與剩餘牌數。本場、供託及真實計分資料保留在伺服器與結算畫面。
- 右上：設定、牌譜（待設計）、役種、全螢幕。役種指南只列遊戲已支援的 38 種役，聽牌提示不代表無振聽或一定有役。
- 牌河保持六張一行及真實打出順序；牌河及副露直接在主牌桌顯示，不提供額外牌河檢視掣或獨立最新棄牌提示。叫牌方向、明槓四張、加槓疊牌、暗槓中間兩張牌背保留。

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

瀏覽器模擬不等同實體電話／Safari 驗收；新背景依使用者乾淨參考圖接入；三個灰白西裝兔是透明二維素材，不是骨骼動畫模型。

## 清晰牌桌場景修正

- 新乾淨背景 `gala-empty-table.png`，三個透明灰白西裝兔由 `gala-seated-rabbits.png` 組合顯示。沒有把參考圖的牌張或分數烘焙進背景。角色為靜態二維素材，並非骨骼模型。
- 主牌桌使用同一套 DOM／WebGL 仿射映射，遠家牌河不再受舊透視壓縮；牌面不受反射光影影響。電話畫面預設保留清晰度，無需切換對比設定。
- 移除額外牌河檢視、獨立最新棄牌提示及相關浮層；最新棄牌直接以粉紅外框標示，下一位摸牌後仍保留。
- 場景容器使用不可捲動裁切，避免叫牌後瀏覽器將牌桌捲出畫面。
- 瀏覽器測試驗證直接入座、連續叫牌、所有副露形態、四家牌河次序、主牌面投影尺寸、中央遮擋、牌面留在畫面內及同座位重連。
