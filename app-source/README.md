# Bunny Gala 單人牌桌 Demo

正式 v2.7.2 規則引擎與三家電腦玩家，搭配翡翠黑金 3D 牌桌介面。

獨立瀏覽器單人試玩，不連接正式多人伺服器。

單人局會自動保存在同一瀏覽器，大廳可繼續對局或開始新局；DEMO 不會覆蓋正式單人進度。專屬影片跟隨全局遊戲音效音量，人物報役仍使用獨立配音音量。

四個角色已有各自手部外觀，沿用同一套摸牌、出牌及立直動作。設計圖與可重播的 3D 預覽：`/art/character-hands-v1/index.html`。

執行 npm install && npm run build。

## 手機版修正

預設 1125 × 634 橫向手機遊戲區，其他視窗等比例顯示。包含實際骰數／開門／配牌、
左上寶牌指示牌與結算裏寶牌、常駐理牌／和牌／不鳴牌／摸切、倒計時、安全逾時操作及完整結算。
牌河和副露以參考牌面原圖顯示，每組副露只繪製一次。

檢查：`npm run typecheck && npm run build`。
瀏覽器情境：先執行 Vite 開發伺服器於 5182，再執行 `node qa/phone-qa.mjs`。
正式建置驗證：`node qa/production-qa.mjs`（會啟動本地 preview）。
可用 `QA_CHROMIUM_PATH` 指定現有 Chromium 執行檔。

## 青綠牌桌介面

四家兔仔頭像、行動方位、放大手牌及金色操作按鈕；保留原有吃碰槓、立直、和牌、結算與開局演出。牌河、副露與對手手牌使用共用 3D 鏡頭；手牌保留 DOM 操作區與鍵盤焦點。

## 手機橫向參考版面

以提供的 1125 × 634 對局截圖對位：翡翠黑金斜俯視牌桌、中央四向分數、四角頭像、左側理／和／鳴／切、底部手牌與獨立摸牌。依然使用 Bunny Gala 原有角色與牌面素材。

## 即時打牌與品牌操作按鈕

合法手牌點選一次即打出；選擇立直後，點選合法手牌即宣告並打出。移除二次確認。牌桌保留參考圖的角度，使用原有深綠黑金配色；吃碰槓和牌操作採用已核准的 Concept C 字樣素材。

## 實體牌身與指示燈

使用鎖定原版黑金牌背、正式牌面與桌面布料材質。牌身為圓角象牙白實體，厚度約牌寬 44%；四家牌河、副露與手牌共用桌面投影，前景手牌與操作區對齊。
倒數只在需要本人打牌或回應鳴牌時出現；四邊燈帶跟隨實際輪次，鳴牌等待另用粉紅燈。WebGL 無法使用時保留可操作的原圖牌面。
檢查：開發伺服器啟動後執行 `node qa/physical-qa.mjs`。

## 手機錄影對照

依 848 × 384 參考錄影保留中央手牌比例並延伸兩側 3D 視野；外側選單與頭像按手機寬度定位。最新公開棄牌顯示持續箭嘴與描邊，鳴走後移除。
本局結算確認後顯示四家真實點數變動，再進入下一局；終局顯示真實排名及再開一局。沒有加入帳戶貨幣、段位或郵件假資料。
驗證：`node qa/video-reference-qa.mjs`。

Table layout repair: render both layers of all occupied public wall slots, including revealed indicators, from the engine state. Enlarge the physical felt to contain opponent hands and meld lanes, reserve an independent foreground strip for own exposed sets, and clear the central display from all four rivers. `qa/table-layout-qa.mjs` checks actual projected tile bounds against the felt and center HUD, wall occupancy, late-hand rivers and mobile screenshots.

October 19 interaction pass: physical wall slots now consume each upper tile before its lower partner (144 dealer/dice combinations and every draw prefix verified). The left arrow opens a documented automatic-play panel using existing persisted options. Original golden Bunny GLB hand geometry and Draw/Discard animation clips are reused in the shared table scene, with reduced-motion support. Legal pon/kan previews and real settlement transfer arrows/counting are included. Small Chinese action buttons use the untouched `action-buttons.png` sprite from the user's callout-assets Site version 4 (source commit `28b512ae8a79a099f0107f873c362e0e7b941755`); the separate material Site is read only and unchanged.

Simplified table pass: remove the dice/break/deal presentation and its six-second input delay, and stop rendering physical wall stacks. Engine tile order, dead wall, remaining-tile count, opponent hands and direct discard remain functional. Integrate the user's ART library v1 from material Site version 6, source `285f5b7dd8602a93bf28a3c4d9f2e36a80389e52`: independent Chinese action buttons (including separate tsumo and riichi), seat-local portrait/call banners and event particles, dealer/riichi/furiten/tenpai badges, help/settings icons, result titles, actual placement plates and next-hand/replay buttons. Character portraits remain static artwork; animated hands continue to use the original GLB. Rank progression and account services are not inferred from artwork.
