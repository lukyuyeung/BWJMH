# 共用日麻核心：Bunny Gala / TYC∞N

同一份遊戲核心、兩個獨立建置、兩個部署網址。原有 Bunny Gala 的規則、牌面、角色、教學與存檔行為保持；TYC∞N 加入墨綠金色外觀及獨立進度。

## 來源與原版保留

本目錄匯入公開 Bunny Gala **v103** 的完整遊戲源碼與共用素材，來源 commit `8da9729cb0e6ef62dcd957f5f9eb93ae5c8cef6d`；見 [docs/UPSTREAM.json](docs/UPSTREAM.json)。這修正了 `handover/2026-10-24/README.md` 記錄的「GitHub 舊版與公開版不同步」問題。

- 原 GitHub `Bunny_Gala_Riichi_v2.7.2/`、`multiplayer-framework/` 及 handover 檔案均保留，不作覆蓋。
- 現有原版公開網站未重新部署或更換來源。
- 原版 profile 為預設；TYC∞N 必須明確指定建置模式。
- `src/`、`engine/`、`rules/` 共用，不複製成兩套遊戲。原版主 JS/CSS 的建置雜湊與 v103 發布版本一致；見 `docs/VERIFICATION.md`。
- 上游部署身份、Git metadata、node_modules、dist 及環境秘密均不從舊站匯入。`.openai/hosting.json` **只指向新 TYC∞N 試玩站**。

## 開發與建置

Node.js 22 或更新版本：

```bash
cd apps/riichi
npm ci
npm run dev:bunny     # http://127.0.0.1:5185
npm run dev:tycoon    # http://127.0.0.1:5186
```

另擇一個終端啟動對應版本，不需要啟動舊專案的 server。

```bash
npm run typecheck
npm run test:brands
npm run build              # 同時建置兩個版本
npm run test:built-brands
npm run preview:bunny      # http://127.0.0.1:4185
npm run preview:tycoon     # http://127.0.0.1:4186
```

Sites 發布使用 `npm run build:deploy`，將 TYC∞N 產物準備到標準的 `dist/client/`；預設雙版本 build 也會完成此步驟。原版發布請自行使用 `dist/bunny/`，不會部署到新 TYC∞N 站。

TYC∞N 部署包排除未被遊戲引用的 `bunny-gala-mahjong-master.svg` 美術母版，以符合 Sites 256 MiB 展開上限；該原檔仍保留於源碼。原版產物不打包未使用的 `public/brand/` 新主題素材。實際遊戲牌面與音效保持；TYC∞N 不播放兔子角色影片。

`dist/bunny/` 與 `dist/tycoon/` 必須分別部署在**不同 origin 的根目錄**。現有來源使用 `/art/`、`/audio/` 等絕對路徑，不能直接當同一網域的兩個子目錄部署。請勿把其中一個產物覆蓋另一個。

## 主題與資料邊界

| 項目 | 原版 | TYC∞N |
|---|---|---|
| 建置模式 | `bunny` | `tycoon` |
| 輸出 | `dist/bunny` | `dist/tycoon` |
| 存檔／教學／角色／語言／音效 | 原有 `bunny-*` keys | `tycoon-riichi-*` keys |
| 入口 | 原版大廳 | 直接進牌桌等候補位，無導流大廳 |
| 遊戲核心 | 共用 `src/`、`engine/`、`rules/` | 同一份 |
| 錢包、真人伺服器 | 未連接 | 未連接 |

主題設定在 `branding/profiles.mjs`；建置套用在 `branding/vite-plugin.mjs`。原版不轉換字串；TYC∞N 使用獨立入口、UI／素材與和牌展示時間線，並隔離已列明的儲存鍵，保留內部事件名稱及角色識別。既有瀏覽器進度不會自動搬到 TYC∞N，也不會把原版進度當成賭場積分。

TYC∞N 入口在 `src/tycoon-entry.ts`。同一房間保留獨立存檔；空位每 3 秒加入一個雀聖級 AI，正常載入下約 10.5 秒開始準備開局，網絡／WebGL 失敗會顯示重試。對手隨機中文名字、保留 AI 標示、頭像空白。僅東風局，未接真人配對或資產。

`branding/tycoon-source.mjs` 在建置時套用 TYC∞N 專屬呈現：移除兔掌、角色／表情／截圖教學與影片；保留非角色宣告旗幟、牌面、實際役種與分數。立體桌框使用古銅及香檳金，墨綠桌氈；保留原版演出路由與時間線：未滿貫使用原小型宣告及牌桌翻牌，滿貫以上使用原 WinArt／SpecialWinSequence 元件及逐項計役；只移除角色圖層。中央風位沿用原 216 × 192 SVG 幾何及四向座位排版，只換墨綠／金配色及移除兔子水印。原版模組原檔、原版時間線與素材不改動。

Casino 與遊戲透過受限 `postMessage` 回報本機牌桌座位。僅接受指定遊戲 origin 及已開啟視窗的 source；回報逾 7 秒失效歸零。這是此瀏覽器的房間狀態，並非全球線上人數，不可作錢包、空投或多人同步的可信來源。好友房代碼也僅隔離本機牌桌，跨裝置連線尚未實作。

## 下一階段：真正接入賭場

共用 v103 核心仍是瀏覽器本地 **單人 Bot 對局**；原版保留九課教學，TYC∞N 只提供簡潔文字操作指南。真人入口仍保持未開放，不會扣 USDT / $BUNNY、不產生 $TYCOON 或 Season 1 積分。

正式接入需要另外設計：Privy 身份換取遊戲 session、服務端權威牌局／配桌、資金凍結及結算、事件防重放與對帳，以及由服務端認定的 Season 活動事件。`postMessage`、query string、localStorage 與這個本機 Bot 引擎都不是資金或空投的可信來源。

請在服務端、帳戶、資金帳本及環境設定分開後，再安排正式資產整合；本 PR 不宣稱已完成這些服務。

## 演出修正

宣告保留原 `01` 底帶、`03` 文字、`04` 特效及音效／時間，僅移除 `02` 角色和角色備援圖。已刪除先前替代的 `tycoon-win` 畫面與自訂 `tycoon-win-plan`；一般自摸不再被強制塞入滿貫式全屏流程。舊存檔恢復時會按原版規則重建演出狀態，清除一般和牌的舊錯誤演出計劃。

滿貫至雙倍役滿使用六張原帽衫版場景的去角色修圖，保留字效、金線、粒子、桌面與建築，由所有空白頭像座位共用。眼部過場保留原帶狀光效，只拿走角色影像。已合併角色的專屬影片以原 WinArt 元件替代，沿用原伺服器段落長度；並未宣稱已對影片逐幀去角色。
