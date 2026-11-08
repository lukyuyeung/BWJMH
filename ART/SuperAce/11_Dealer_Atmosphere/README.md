# 新機械發牌器、貨幣圖示與四階氣氛

## 獨立資產

- [機械外殼 PNG](dealer-housing.png)／[適配 SVG](dealer-housing.svg)
- [單一滾輪出牌口 PNG](dealer-outlet.png)／[適配 SVG](dealer-outlet.svg)：程式按牌區相同列距排列五份，與下方五列對齊，沒有牌背。
- [小圓角矩形倍率底座 PNG](multiplier-base.png)／[適配 SVG](multiplier-base.svg)

SVG 只收起透明安全邊距，內嵌原 PNG，未重畫原圖。既有卡背保留供遊戲揭牌，發牌器不再展示卡背。

## 整合示意

下列為獨立 review 模式的版面示意；四角放置 CARROT 是為檢查越框顯示，不代表實際隨機牌局。

- [320×568](hud-v4-320x568.png)／[390×844](hud-v4-390x844.png)
- [×1 深梅紫](hud-v4-heat-0.png)
- [×2 暖金](hud-v4-heat-1.png)
- [×3 粉紅](hud-v4-heat-2.png)
- [×5 香檳金](hud-v4-heat-3.png)

## 修訂

四個金額（餘額、BET、本局獎勵、Session 淨輸贏）前加原蘿蔔圖示。保留原數字字體大小；極長完整小額若無法同排，圖示置於數字上方，避免縮字或截斷。M／B／T 格式及比例下注沿用上一版。

WILD 先前因 object-fit 樣式優先級仍使用 contain，造成金色牌面偏窄；現在對特殊牌實際圖片指定 fill，金底可見區填滿與普通牌相同的矩形。

牌區取消 isolation 獨立堆疊，CARROT 層級高於外框，四個邊角不再被桌框蓋住。牌面及外框原圖保留。

四階從背景色光、倍率底座、出牌口、牌區外圍一起變化；撲克牌本身不染色，升級動畫仍在遊戲節奏內。

## 驗證

22 項單元測試通過；6 種手機尺寸檢查圖示、字體、大額及小額完整顯示、WILD fill 尺寸、CARROT 圖層、五個出牌口對齊。另檢查固定單屏、Auto，以及付費局 Session／精確下注流程。
