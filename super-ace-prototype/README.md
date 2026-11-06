# Bunny Gala · CARROT 直屏試玩版

目前只做直屏，所有核心資訊與操作固定在同一屏幕內；AUTO全部條件與操作亦能同屏顯示。牌面保持625:835；彈窗可獨立捲動。使用Bunny Gala去背版、原卡背及原有蘿蔔貨幣，沒有雙旗或網站頁尾。

```sh
python -m http.server 4173 --directory dist
node --test engine.test.mjs
```

瀏覽http://localhost:4173。已安裝Playwright與Chromium時可執行`node qa/portrait-layout.cjs`；以`PLAYWRIGHT_MODULE`、`CHROMIUM_PATH`及`QA_ORIGIN`指定現有安裝與預覽位置。

6個手機視窗尺寸已驗證20張牌、8個可點擊按鈕、至少44px觸控範圍及無頁面捲動；另驗證大額餘額不溢出。AUTO有停止條件，SPEED三段，說明可重看教學；設定可重設本機試玩蘿蔔。

[實裝及驗收紀錄](../ART/SuperAce/07_Independent_Art/IMPLEMENTATION.md)。155項為設計候選交付，完整動畫、共同畫布及全部功能畫面尚需驗收。賠率與隨機權重未經官方核對或商用校準，蘿蔔僅存於localStorage。
