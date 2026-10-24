# Bunny Gala APP 交接 — 2026-10-24

> 此資料夾是交接文件及已確認的原始表情素材，不是完整遊戲發行包。GitHub BWJMH 與 Sites 遊戲源碼庫為不同 repository，尚未完成最新遊戲源碼同步。不可將 BWJMH 現有內容當成與公開遊戲一致。

## 遊戲與版本
- 公開遊戲：https://bunny-gala-table-demo.almondcrab34.chatgpt.site
- 大廳：https://bunny-gala-table-demo.almondcrab34.chatgpt.site/design/lobby/index.html
- ART：https://bunny-gala-callout-assets-oct19.almondcrab34.chatgpt.site
- Sites project：appgprj_6ad48606b08c81918d6428e1f9c3d7d7
- Sites source remote：https://git.chatgpt-team.site/51d39b03-18ae-4c7f-9b73-cc0a4833b7dc/appgprj_6ad48606b08c81918d6428e1f9c3d7d7.git
- 公開版已回退至 v51，commit 3604c628a428a412b93d6b054580d947581e0d14。
- v51 saved version：appgprj_6ad48606b08c81918d6428e1f9c3d7d7~appgver_a304594592d48191b74112b0a858bd02
- v51 原生部署 archive：Sediment file_00000000ecd48230987d7d63f8ee72dd，tar 145418240 bytes，1370 files。此為建置產物，不等於完整源碼。
- Sites 源碼 HEAD 曾為 v52，commit c4fbd13576d7317bb31e4863ef1b865421a3e8b4。其啟動 loading 在用戶端卡住，未查明根因。不要直接發佈此 HEAD。
- 本次開發環境 pending/offline；無法讀取本地檔案、build 或完整匯出，故未宣稱同步完成。

## v51 已實裝範圍（接手者仍需逐項驗證）
- 四人本地 Bot 對局、低中高難度選擇、角色及四人準備過場。
- 黑金牌背、象牙色牌身、自訂牌面、綠枱與金屬框。
- 粉紅同牌高亮、立直選牌面燈、候選棄牌聽牌／剩餘張數預覽、等大小振聽與聽牌提示。
- 手機短按出牌；長按／移動掃牌不出牌。
- 同時翻開和牌手牌、和牌結果、點數轉移、東圈排名既有版面。
- 十秒立直刮牌，滿貫以上無字角色由右至左突入。
- 中英 UI 切換及六款英文 CHI/PON/KAN/RIICHI/RON/TSUMO 字層。役滿影片依用戶決定保留原版中文燒錄字。
- 音樂、SFX、四角色日文叫牌／役種／牌名 VO；牌名新檔採用 GitHub 來源 commit 3218173efc8f9661a74130eece4855bf1712a3e2。
- 公開版沒有實體牌山或洗骰音效。

## 本次確認表情素材
emotes/ 下四張 PNG 均為每角 3×3 原始圖，每張九個表情。尚未切圖、優化透明邊緣、生成正式小尺寸版本或接入遊戲。
排列：開心、憤怒、哭泣、驚訝、思考、抱歉、勝利、無語、調皮。
- yellow.png：全金黃色；垂耳從帽簷下面伸出，向面頰兩側垂落。禁止耳仔長在帽頂或帽帶上。
- king.png：皇冠、紅袍、黑色小鬍子，維持原角色，不能變成巫師。
- wizard.png：以此張為其餘角色的塊面、光影及表情風格基準。
- ninja.png：黑色忍者服，眼部露出白色，鼻嘴完全遮住，少量啡色頸巾；不使用藍色兔魂或藍色能量兔。
- 頭像：沿用之前 NFT 原圖，只統一置中及裁切；不要使用新生成頭像。
- 計劃 UI：倒數計右側表情按鈕，僅顯示自己角色九款，發出後座位旁短暫呈現，加輕微動態。
- 注意：原始圖是靜態美術，動畫與表情功能尚未實裝；真正跨玩家顯示需要網絡服務。

## 尚未完成／不可聲稱 APP ready
1. 取得 v51 完整 Sites 源碼，安全同步進 BWJMH 的獨立分支，核對最新使用者變更。
2. 修正首次載入：每次先到大廳，START 後四人過場；只等待當局必要牌面、頭像、桌面，次要 ART 背景載入；不可用整庫約 55 MB 解碼硬鎖入口。提供重試，期間不消耗出牌倒數。
3. 將本資料夾四套表情切圖、透明邊緣檢查、縮圖及快取，接入 UI；NFT 頭像置中。
4. 滿貫以上 CUT IN 後的額外翻牌震撼效果尚未實裝：短停頓、暗枱、全手同時翻開、適量落枱光波／掃光，保持牌面可讀。
5. 真實 multiplayer、server-authoritative 回合／時鐘、斷線重連、配對、認證未完成。
6. APP bridge、錢包／蘿蔔幣實際扣結算、服務端防重複結算、部署配置未完成。現有籌碼場次 UI 不代表真錢包已接通。
7. 實機 iOS／Android 橫向比例、安全區、觸控、音訊解鎖與效能尚需驗證。

## 建議交付內容
- app-source/：可建置完整源碼與 lockfiles；不要混入舊版本。
- dist/：固定 commit 產出的網頁 bundle，附版本號與 SHA。
- assets/：實際引用的牌、桌、角色、字體、Ribbon、影片、音效，附來源／授權及 manifest。
- docs/：啟動指令、APP WebView／原生容器接入、事件介面、後端 API、環境變數範本（無 secrets）。
- 驗證：typecheck/build、牌局順序、觸控不誤出牌、語言切換、音效同步、東圈結算、首次載入與重連。
- 沒有驗證就不要標記完整遊戲／APP ready。本文件不包含任何憑證。
