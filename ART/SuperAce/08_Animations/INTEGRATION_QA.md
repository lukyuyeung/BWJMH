# 前端接入與驗證

48項均已從實際牌局、待機或UI操作觸發，沒有用預覽事件補數。完整事件與狀態見[integration-qa-results.json](integration-qa-results.json)。

- 主畫面320／390寬度：−／＋／BID／AUTO／速度均44×44px，使用同一獨立美術底板；開始鍵保留較大尺寸。核心操作共9個。
- 數字沿用餘額的DM Sans、600字重、tabular數字；深梅紫不透明襯底，暗色描邊，依中獎位置定位並限制在牌桌內。進出場不降低底板透明度，減少動態時保留完整閱讀時間。
- 六尺寸同屏、20牌比例、五欄發牌器對齊及AUTO同屏檢查通過。
- 7項引擎、7項可暫停播放時鐘、4項結果計畫／重複結算防護測試，共18項通過。
- 普通、天使、惡魔複製、大獎、CARROT、免費追加與TOTAL WIN均完成；seed29的15次免費遊戲結算8554，與獨立引擎模擬一致。
- 中途重新整理保留同一已提交牌局；派獎後重新整理不再派獎；離線暫停／恢復不再扣款。這是本機前端狀態恢復，沒有聲稱已接入正式伺服器錢包。
- 預覽頁48項均可選播；MAX及減少動態全部完成清理，預覽不讀取或改動玩家的遊戲蘿蔔。48個MP4均來自實際瀏覽器動態畫面，沒有靜態圖片冒充動畫。

[目前主畫面](../04_UI/Implemented/portrait.png) · [實際中獎](../04_UI/Implemented/win-real-390.png) · [長數字可讀性示意](../04_UI/Implemented/win-number-390.png) · [預覽頁](../04_UI/Implemented/animation-gallery.png)

[測試程式](../../../super-ace-prototype/qa/motion-flow.cjs) · [共同按鍵底板](../07_Independent_Art/ui/buttons/shared-square/normal.png)

現有派彩數字、隨機權重及正式後端仍屬另行驗收範圍；本次為前端動畫與操作交付，並非商用數學認證。
