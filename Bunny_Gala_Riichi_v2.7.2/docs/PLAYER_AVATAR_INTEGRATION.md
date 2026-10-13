# 玩家頭像與繁體中文結算

頭像資料鏈已接通：room:create 或 room:join → Player.avatarUrl → 公開房間資料 → 牌桌及結算四家頭像。新版依使用者要求，移除首頁／設定的頭像自選介面，Bunny Gala 帳戶頭像接入留待之後完成。player:avatar 更新目前 socket 自己的頭像，忽略客戶端提供的 playerId；重連與私人磁碟快照保留頭像。無頭像／圖片載入失敗使用名稱首字或原有角色圖，不冒充玩家自訂頭像。

另一個 App 的帳戶服務尚未提供，不能宣稱已完成帳戶登入或帳戶 API 對接。已提供網頁內整合入口：App 取得目前登入使用者的圖片網址後，在同一頁面執行：

```js
window.dispatchEvent(new CustomEvent('bunny:profile', {
  detail: { avatarUrl: 'https://your-avatar-service.example/player.png' }
}));
```

也可在開頁前設定 `localStorage.setItem('bunny-avatar', avatarUrl)`。這是頭像顯示資料入口，不是身份驗證；不可將 token 填入網址。伺服器接受無帳密的 HTTPS 圖片網址或 `/art/` 中的圖片路徑，最多 2048 字元，不接受 HTTP、data、javascript 或路徑穿越。頭像網址會公開給房間玩家；使用 App 提供的公開／適當授權圖片網址。

結算的牌張直接讀取 `hand.result.winningTile`，保留真實 id、牌面與赤牌狀態；手牌及副露來自伺服器 settlement/melds。圖片是使用者 patch 中的 2D 參考頭像，牌張以獨立 UI 顯示；並非全身模型或骨骼手持動畫。和牌分數不改引擎：主要得點不含本場與供託，分數卡顯示實際結算變動。裏寶牌指示牌只在立直和牌結算後公開。

繁體中文只改顯示名稱與可存取標籤；Socket 事件、data-action、役種識別及計分規則保留。英文瀏覽器測試選擇器已更新為繁體中文。

## 驗證

- `npm test`、`npm run typecheck`、`npm run build`、`npm run verify:art`。
- `QA_CHROMIUM_PATH=/usr/bin/chromium QA_OUTPUT_DIR=/tmp/bunny-result-ui-qa node --import tsx scripts/browser-result-ui.mjs` 驗證真實榮和／自摸牌張、頭像事件同步、四家結算、下一局及電話直／橫向。
- `QA_CHROMIUM_PATH=/usr/bin/chromium QA_OUTPUT_DIR=/tmp/bunny-fullscreen-qa npm run test:browser:fullscreen` 驗證四種電話橫向尺寸及叫牌、結果畫面。
- 外部 App 帳戶 API、真正骨骼手持動畫與實體 Safari 裝置尚未驗證。
