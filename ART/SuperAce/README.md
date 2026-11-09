最新更新：[按音效指南接入遊戲事件、獨立音量及37段試聽](20_Audio_Guide_Integration/README.md)。

最新更新：[載入通順度、圖片快取與遊戲音樂](19_Smooth_Loading_Audio/README.md)。

最新更新：[免費模式金色倍率底座](18_Free_Gold_Multiplier/README.md)。

最新更新：[金帽兔子・免費遊戲全屏圖與手動開始](17_FreeSpin_Rabbit/README.md)。

最新更新：[獎勵倒數、牌局明細與效能](16_Rewards_History_Performance/README.md)。

最新畫面修訂：[牌桌Logo與獎勵同步氣氛](15_Table_Brand_Reward_Sync/README.md)。

最新畫面修訂：[桌面清晰度與頂部留白](14_Desktop_Clarity/README.md)。

最新更新：[自訂概率模型、RTP驗證與遊戲審視](13_Math_Model_Review/README.md)。

最新修訂：[蘿蔔慶典、免費模式與瀑布大獎](12_Carrot_Feature/README.md)。

最新修訂：[新發牌器、貨幣圖示、WILD 與四階氣氛](11_Dealer_Atmosphere/README.md)。

最新介面修訂：[獨立資產、直屏示意與驗證](10_HUD_Revision/README.md)。

# Super Ace — ART 美術總覽

**最新：[48項已接入效果、影片與時間軸](08_Animations/README.md)**

**最新：[完整獨立 ART 資產清單（155項）及48項動畫製作規格](06_Asset_Register/README.md)。清單完成不代表全部素材完成。**

這裏集中展示本次設計的全部已完成美術與動畫分鏡，供逐項審閱。

**狀態：美術方向與分鏡提案，尚未完成正式拆圖、可播放動畫或完整遊戲。**

## 先看這幾張

| 項目 | 內容 | 狀態 |
|---|---|---|
| [完整牌面](01_Cards/02-complete-card-review.png) | 8 普通＋8 金牌＋2 WILD＋CARROT＋BACK | 對照稿；比例仍需由原始素材精準實作 |
| [WILD 採用方向](01_Cards/03-approved-wild-direction.png) | 金底、天使黑框金字／惡魔紅框金字，同尺寸 | 使用者已確認方向 |
| [金框與 CARROT](01_Cards/04-gold-overlay-and-carrot-study.png) | 金框疊在牌內、獨立大金蘿蔔 | 舊圖仍寫 SCATTER，正式名稱已改 CARROT；舊 WILD 配色不採用 |
| [發牌器](02_Dealer/01-dealer-and-motion-study.png) | 五口發牌器與初版動作 | 造型提案；補牌以後續分鏡為準 |
| [直屏主畫面](04_UI/01-portrait-layout-proposal.png) | 紫金主畫面、直向長方形牌面 | 已修正方形牌與CARROT底框；仍為視覺提案 |
| [設定、玩法與教學](04_UI/02-settings-help-tutorial-proposal.png) | 六組視窗 | 新提案；不是正式規則或賠付表 |
| [免費遊戲與得獎](04_UI/03-free-game-and-rewards-proposal.png) | 六個畫面狀態 | 新提案；盤面縮圖不作規則依據 |

## 動畫分鏡（48 項）

1. [01–12 發牌、中獎、消除、上方補牌、倍率及連鎖結束](03_Storyboards/01-deal-win-chain.png)
2. [13–24 金牌與天使／惡魔 WILD](03_Storyboards/02-gold-wild.png)
3. [25–36 CARROT、懸念、免費遊戲及結算](03_Storyboards/03-carrot-free-game.png)
4. [37–48 獎勵、Auto、速度、下注、教學及恢復](03_Storyboards/04-reward-controls-tutorial.png)

這些是關鍵姿勢分鏡，不是已完成動畫；縮圖仍可能出現格數、符號、角色或觸發數量偏差，不能直接作為判獎或實作測試資料。

## 已鎖定設計規格

- 保留原有 J 黑兔、Q 紅帽灰鬍兔、K 國王兔、A 白兔；不用新人物取代。
- 金牌與普通牌同尺寸，金框 ON TOP 疊在原牌內，原圖位置、字級與比例不改。
- 天使、惡魔角色同大小，均金色底牌；底部各為黑框金字／紅框金字 WILD。
- 觸發符號名稱 CARROT；獨立立體金蘿蔔，不加撲克牌底框。
- BACK 使用 00_Source/poker/back.png 原檔。正式品牌必須使用原檔，生成圖上的 Logo 不作正式來源。
- 紫金主色，蘿蔔為餘額及下注單位；付費旋轉前下注不得超過可用餘額10%。
- 5列×4行；金牌僅第2–4列；中獎消除後由上方補牌。
- Auto 先開設定；Speed 為正常、快速、極速三段。

## 新提案已知問題／待修

- 直屏已改為直向長方形牌面，CARROT底框已移除；設計目標625:835，正式素材須精準鎖定，生成圖不是像素尺寸驗收依據。
- 直屏的普通／金牌框與元素比例有漂移；正式版應重用同一底圖，疊加內框。
- 直屏 WIN0 與示意牌面尚未用判獎程式一致性驗證，不是有效結果範例。
- 免費遊戲與設定／教學提案的小盤面格數不一致；教學高亮並非有效中獎示範，需用固定5×4盤面重排。
- Auto 條件缺少完整數值輸入；賠付值、Bet單位與完整規則仍需核對遊戲內說明。
- 生成提案出現的金幣圖標不作貨幣設計依據，正式統一為原始蘿蔔素材。
- 原始來源與生成提案分開保存；沒有將生成圖的像素漂移標成正式資產。

## 原始素材

[原始52張撲克牌、兩張Joker及BACK](00_Source/poker/) · [原始蘿蔔素材](00_Source/currency/)

原檔直接從目前 GitHub poker/ 和既有蘿蔔資產複製，未經重新生成或改圖。

## 下一批正式製作工作

- [ ] 20款逐張透明素材、精準尺寸、內疊金框與來源對應
- [ ] 發牌器分層（機身、卡槽、牌堆、指示燈）
- [ ] WILD角色、翅膀、光環、泡泡與字牌分層
- [ ] CARROT本體、葉冠、文字及光效分層
- [x] 48項前端效果、時間軸、三段速度與可播放預覽
- [ ] 主畫面與視窗的正式元件、字體、按鈕狀態
- [ ] 有效5×4盤面與完整規則、計算及教學核對
- [ ] 橫屏按最新紫金方向重排；舊綠色版本只供歷史比較

[全部圖片瀏覽](GALLERY.md) · [圖片尺寸及SHA256清單](manifest.json) · [舊版／不採用方案](90_History/)

## 可玩原型與獨立素材

[試玩版原始碼](../../super-ace-prototype/README.md) · [獨立WILD與CARROT透明PNG](05_Independent_Assets/)

主介面已移除SUPER ACE標題和錯誤底部兔子圖案，旗幟已撤下，CARROT圖與字加大。48項前端效果已接入；其餘商用美術／數學驗收另列。

## 新增獨立資產

[155項獨立設計檔及分類預覽](07_Independent_Art/README.md)。均有實際檔案／字體套件；尚未全部驗收或實裝。
