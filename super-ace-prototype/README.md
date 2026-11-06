# Bunny Gala · CARROT 私人試玩版

使用原有像素兔子撲克牌、BACK 與 Bunny Gala Logo。以蘿蔔作本機測試餘額，不能充值或兌換。

## 執行

```sh
python -m http.server 4173 --directory dist
node --test engine.test.mjs
```

瀏覽 http://localhost:4173 。首次進入有四步教學。AUTO 可設定次數、單局倍率、餘額上下限及免費遊戲停止條件；SPEED 三段。底部有不影響餘額的動畫試映與重設試玩。

## 重要狀態

- 5×4、左至右1024ways、原位消除後上方補牌、金牌轉WILD、惡魔複製及CARROT免費遊戲已實作。
- 每次付費下注不超過餘額10%；免費遊戲沿用觸發下注。
- 賠付表與隨機權重是未校準的試玩參考值，不宣稱官方JILI派彩或RTP。完整規則文字與Bet單位仍需核對官方遊戲內說明。
- 金牌轉換動畫、免費回合獎勵重觸發時序為目前原型實作，尚未逐一對照原版動態驗收。
- 儲存只有瀏覽器localStorage，沒有伺服器帳戶、多人、付費或正式安全錢包。
- 引擎7項測試通過，Chromium手機與桌面基礎操作通過。
- 未完成所有48項正式動畫，也未完成全部獨立ART；現有透明圖與CSS組合可供試玩。

## 獨立美術實裝

背景、旗幟、發牌器、桌框、牌面與操作區均使用獨立美術，CSS負責排版、文字與互動。`dist/assets/art/ui-asset-mapping.json`記錄原始素材與顯示視窗；原圖保存於`ART/SuperAce/07_Independent_Art`。155項為設計候選交付，完整動畫、共同畫布及所有功能畫面尚需逐項驗收。
