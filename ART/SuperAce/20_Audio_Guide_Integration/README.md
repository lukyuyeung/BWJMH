# 音效指南實裝

依使用者提供的 [SUPERACE_AUDIO_GUIDE.md](SUPERACE_AUDIO_GUIDE.md) 接入現有網頁遊戲。已找到並壓縮37個音頻，總計2.66MB（來源WAV約26.16MB）。原WAV保留在GitHub main的 `Bunny_Gala_Riichi_v2.7.2/super_ace_bgm`。

[遊戲](https://bunny-gala-carrot-lab.almondcrab34.chatgpt.site) · [37段音頻獨立試聽](https://bunny-gala-carrot-lab.almondcrab34.chatgpt.site/audio-preview.html)

![獨立音樂及音效控制](01-audio-settings.png)

## 實際事件對照

| 事件 | 音頻ID（省略superace_及副檔名） |
|---|---|
| 首次操作／待開始 | intro → lobby；直接SPIN優先進主遊戲，不為開場聲延遲發牌 |
| 接受SPIN | bgm_main／免費bgm_bonus + card_shuffle |
| 開始發牌／五列各自停穩 | reel_spin／reel_stop（每列一次，共5次） |
| 每段中獎、數字及加到餘額 | win_normal、win_countup、coins |
| 全局沒有中獎 | no_win |
| 金牌初次揭開或補牌出現 | golden_card |
| 金牌翻面、天使落地、惡魔擴散 | golden_eliminate、little_joker、big_joker |
| 連鎖消除／真正提升倍率 | cascade／multiplier；倍率到頂不重複升級聲 |
| CARROT出現、兩CARROT且仍有後續列 | scatter、scatter_near；期待聲每局一次，停牌或第三個到達即結束 |
| 免費全屏圖／免費內再觸發 | freespin_trigger／freespin_retrigger |
| 免費大獎／最終結算／返回普通 | freespin_bigwin／freespin_result／return_base |
| 改下注、開AUTO、開2× | bet_change、auto_spin、turbo_spin |
| 說明、設定、可聽的斷線暫停、最低下注不足 | paytable_open、settings_open、pause、no_coins |

文件的獎勵音效分級已採用：<5× win_normal；5–<20× win_big；20–<100× mega_win；100–1000× ultimate_win；>1000× jackpot。免費大獎優先使用專屬freespin_bigwin，100×以上仍使用高階獎勵音樂。這只改音效，**現有BIG WIN/MEGA WIN畫面門檻、派彩、概率、RTP與免費規則均未改**。5–<10×使用分級聲音而不新增總獎勵彈窗。

## 聲音控制與通順度

- 三組獨立開關及音量：BGM0.6、SFX0.7、VO0.9，再乘文件各檔建議音量。設定保存在此瀏覽器。
- BGM以1.3秒交疊淡入淡出；SFX用Web Audio解碼快取，與BGM分開。BGM也經GainNode，讓行動瀏覽器可控制音量。
- 最多3個SFX、1個音樂stinger、1個VO；高優先事件優先，聲音不排長隊。VO／關鍵獎勵時降低背景30%，用壓縮器保護混音峰值。
- 圖片與短音效暖身並行，音訊最多2個並行請求；發牌、動畫、計算與派彩從不await音訊。網路失敗或超時可略過聲音，過期音效不會幾秒後補播。
- 派牌聲在全部列停穩時停止；數字聲跟隨數字動畫完成／快速收下；20ms短淡出避免突兀切音。隱藏分頁、離開與斷線暫停，返回可恢復BGM。
- 首次互動解鎖音訊；原生媒體在互動內解鎖，避免移動瀏覽器把免費BGM視為未授權自動播放。未經iPhone實機認證，實機仍須確認。
- 試聽頁與下注、餘額完全分離。37段都可逐項試聽；停止或改選後，慢載入的舊音效不會延後播放。

## 尚缺或不適用

- 四個角色VO檔案未在現有GitHub main找到：vo_superace_yellow.wav、vo_superace_wizard.wav、vo_superace_ninja.wav、vo_superace_king.wav。未以麻雀語音或其他角色冒充；語音介面清楚顯示待補、控制停用，預留獨立VO及ducking路徑。
- 現有遊戲沒有Buy Bonus與退出確認流程，buy_bonus／quit只可在試聽頁試聽；沒有為了接聲音而新增購買功能。
- 文件的Unity大廳段映射為網頁首次互動與未開始的待機BGM，沒有另加大廳畫面。

## 驗證

29項單元測試通過，包括精確音效門檻（1000×仍ultimate，超過1000×才jackpot）。

`qa/audio-guide.cjs` 以6個固定實際結果（2、37、288、8、72、181）驗證：發牌+5次停牌、未中獎、六連鎖、倍率到頂、金牌、天使/惡魔、期待只一次、免費觸發、5秒及手動開始、大獎分級、SFX最多3個、音效不遲於180ms、BGM與SFX獨立靜音、關閉BGM後量測SFX實際輸出訊號非零、37段試聽及取消不補播。事件記錄附於browser-events.json。

`qa/smooth-assets.cjs` 仍通過：圖片失敗重試、3×像素密度無空白牌面／連鎖途中新增圖片下載、正確派彩、音樂錯誤不阻塞SPIN。

有聲六連鎖單次開發環境樣本：畫面間隔P95約16.8ms，1個>50ms間隔，餘額2148正確。這是瀏覽器開發測試，不是手機幀率保證，原始資料附於active-audio-profile.json。
