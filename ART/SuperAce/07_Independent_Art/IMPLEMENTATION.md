# 遊戲實裝與驗收

本批是可逐件檢視的獨立美術設計候選稿，並非155項均已正式核准或完成動畫。

已接入試玩版：普通與金色牌面、天使／惡魔WILD、CARROT、原始BACK、直／橫屏背景、雙旗、發牌器、桌框、倍率、狀態、餘額、主要操作按鈕、共用彈窗、分頁、選項與勾選框。

- [直屏實際畫面](../04_UI/Implemented/portrait.png) · [橫屏實際畫面](../04_UI/Implemented/landscape.png) · [玩法視窗](../04_UI/Implemented/paytable.png)
- [試玩版](https://bunny-gala-carrot-lab.almondcrab34.chatgpt.site)（保留擁有人私人存取）
- [實際程式與素材對照](../../../super-ace-prototype/dist/assets/art/ui-asset-mapping.json)
- [程式](../../../super-ace-prototype/dist/)

CSS負責排版與互動；圖像主體使用獨立PNG。SVG只設定原始PNG的顯示視窗，沒有重繪圖片。顯示字串與數值保留為可讀文字。按鈕以各自獨立圖片切換狀態。

已驗證：7項引擎測試；390px直屏20張牌、無橫向溢出；1440px橫屏；旋轉、速度、自動遊戲、賠率表、彈窗內捲動，無JavaScript錯誤。

仍須驗收：牌面統一原生畫布與精確內距、透明邊緣、縮小後清晰度、完整動畫時間軸與定位、所有次要畫面逐項接入、官方規則及數學模型核對。賠率與隨機權重為試玩參考數據，不能視為JILI官方數據。
