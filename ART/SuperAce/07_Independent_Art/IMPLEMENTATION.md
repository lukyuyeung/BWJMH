# 直屏實裝與驗收 — 2026-11-07

目前只製作直屏。桌面亦顯示同一個直屏舞台；橫屏製作暫停。

這次修正：固定單屏、按剩餘高度安排牌桌、移除雙旗與頁尾、Bunny Gala去背版、原有蘿蔔貨幣、牌內黑金框、居中旋轉鍵、頂部說明／設定／音效、右側AUTO與速度。教學與主遊戲共用WILD和CARROT。

- [390×844實際畫面](../04_UI/Implemented/portrait.png) · [320×568實際畫面](../04_UI/Implemented/portrait-320x568.png)
- [AUTO](../04_UI/Implemented/auto-390.png) · [小屏AUTO](../04_UI/Implemented/auto-320.png) · [設定](../04_UI/Implemented/settings-320.png) · [賠率表](../04_UI/Implemented/paytable.png)
- [Logo淺底驗證](../04_UI/Implemented/logo-on-light.png) · [去背PNG](brand/bunny-gala-logo-transparent.png) · [保留原圖](brand/bunny-gala-logo.png)
- [私人試玩版](https://bunny-gala-carrot-lab.almondcrab34.chatgpt.site)
- [程式及素材對照](../../../super-ace-prototype/dist/assets/art/ui-asset-mapping.json) · [版面回歸檢查](../../../super-ace-prototype/qa/portrait-layout.cjs)

Chromium瀏覽器檢查320×568、360×640、375×667、390×701、390×844、430×932：20個牌位保持625:835；所有核心按鈕至少44px且在可視區域內，中心可點擊；頁面無水平／垂直捲動。另驗證123,456,789.12的大額餘額不溢出。

教學4步、賠率表、三段速度、音效狀態同步、自動旋轉、獎勵確認、零餘額後於設定重設試玩均已檢查。長說明與設定可在彈窗內捲動，主遊戲舞台不捲動。7項引擎測試通過。

UI以獨立PNG為主體。SVG保留嵌入的原始PNG，外框按容器排版；牌面比例另外固定。修正原素材顯示視窗留白造成的錯位，以及選項背景重複平鋪、預設數字／圖示與動態文字重疊。發牌起點按各出口位置計算，動畫時間依速度同步。

這不是155項美術及48項動畫均完成正式驗收的聲明。原生共同畫布、角色精確比例與所有分層錨點、完整動畫演出、官方規則及數學模型仍需驗收。現有賠率與隨機權重為試玩參考值，不代表JILI官方數據。此輪未作iOS／Android實機驗收。
