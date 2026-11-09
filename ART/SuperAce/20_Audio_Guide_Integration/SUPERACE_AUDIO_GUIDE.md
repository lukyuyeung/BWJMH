# SUPER ACE 音樂包使用文檔

> 適用遊戲：BUNNY GALA（Unity）
> 音樂風格：BUNNY GALA 兔兔可愛風，柔和賭場爵士
> 音頻格式：WAV 44.1kHz 16bit

---

## 一、音樂包總覽

| 類別 | 數量 | 文件夾 |
|---|---|---|
| BGM 背景音樂 | 9 段 | `bgm/` |
| SFX 音效 | 25 段 | `bgm/` |
| 角色 VO | 4 段 | `vo_characters/` |

---

## 二、遊戲流程音樂對照表

### 2.1 開機 → 進入遊戲

```
玩家點開 SUPER ACE 小遊戲
    ↓
播放 superace_intro.wav（4秒開場過場）
    ↓
進入大廳畫面
    ↓
循環播放 superace_lobby.wav（大廳 BGM）
```

| 檔案 | 觸發時機 | 播放方式 | 建議音量 |
|---|---|---|---|
| `superace_intro.wav` | 玩家點入 SUPER ACE 小遊戲 | 一次性播放，播完自動轉 lobby | 0.8 |
| `superace_lobby.wav` | 大廳畫面顯示 | 循環播放 | 0.5 |

---

### 2.2 主遊戲（Base Game）

```
玩家按下 SPIN
    ↓
切換 BGM：superace_bgm_main.wav（循環）
    ↓
播放 superace_card_shuffle.wav（發牌聲）
    ↓
播放 superace_reel_spin.wav（滾輪轉動）
    ↓
5 個軸逐個停止
    ↓
每停一個軸播放 superace_reel_stop.wav（咔噠聲）
    ↓
檢查中獎
```

| 檔案 | 觸發時機 | 播放方式 | 建議音量 |
|---|---|---|---|
| `superace_bgm_main.wav` | 開始旋轉，切換主遊戲 BGM | 循環播放 | 0.6 |
| `superace_card_shuffle.wav` | 每次按下 SPIN | 一次性播放 | 0.7 |
| `superace_reel_spin.wav` | 滾輪開始轉動 | 一次性播放，跟住旋轉動畫 | 0.6 |
| `superace_reel_stop.wav` | 每個軸停止時 | 重複播放，每軸一次 | 0.7 |
| `superace_bet_change.wav` | 玩家調整下注金額 | 一次性播放 | 0.6 |
| `superace_turbo_spin.wav` | 開啟 Turbo 模式 | 一次性播放 | 0.6 |
| `superace_auto_spin.wav` | 開啟 Auto Spin | 一次性播放 | 0.6 |

---

### 2.3 中獎判定

```
所有軸停完
    ↓
有中獎？
    ├─ 冇中獎 → 播放 superace_no_win.wav → 等下次 SPIN
    └─ 有中獎 → 計算獎金
            ↓
        播放 superace_win_normal.wav（普通贏錢 chime）
            ↓
        播放 superace_win_countup.wav（數字飆升聲）
            ↓
        播放 superace_coins.wav（金幣掉落）
            ↓
        獎金加到餘額
```

| 檔案 | 觸發時機 | 播放方式 | 建議音量 |
|---|---|---|---|
| `superace_no_win.wav` | 冇中獎 | 一次性播放 | 0.5 |
| `superace_win_normal.wav` | 普通贏錢（小獎） | 一次性播放 | 0.7 |
| `superace_win_countup.wav` | 贏錢數字跳動時 | 一次性播放，跟住數字動畫 | 0.6 |
| `superace_coins.wav` | 贏錢時金幣動畫 | 一次性播放 | 0.6 |

---

### 2.4 Golden Card / Joker 機制

```
軸停完，檢查有 Golden Card
    ↓
Golden Card 出現
    ↓
播放 superace_golden_card.wav（金光閃爍）
    ↓
Golden Card 參與消除
    ↓
播放 superace_golden_eliminate.wav（變身音效）
    ↓
變成 Little Joker 或 Big Joker
    ├─ Little Joker → superace_little_joker.wav（小 Joker 落地）
    └─ Big Joker → superace_big_joker.wav（大 Joker 擴展）
```

| 檔案 | 觸發時機 | 播放方式 | 建議音量 |
|---|---|---|---|
| `superace_golden_card.wav` | Golden Card 符號出現 | 一次性播放 | 0.8 |
| `superace_golden_eliminate.wav` | Golden Card 消除變身 | 一次性播放 | 0.8 |
| `superace_little_joker.wav` | Little Joker 落地 | 一次性播放 | 0.7 |
| `superace_big_joker.wav` | Big Joker 擴展 | 一次性播放 | 0.8 |

---

### 2.5 Cascade 連勝 / Multiplier 上升

```
消除後新符號落下
    ↓
有連勝？
    ↓
播放 superace_cascade.wav（連串消除聲）
    ↓
Multiplier 上升
    ↓
播放 superace_multiplier.wav（音階上升）
```

| 檔案 | 觸發時機 | 播放方式 | 建議音量 |
|---|---|---|---|
| `superace_cascade.wav` | 每次連勝消除 | 一次性播放 | 0.7 |
| `superace_multiplier.wav` | Multiplier 升級（x2→x3→x5→x10） | 一次性播放 | 0.8 |

**Multiplier 梯級：**
- 主遊戲：x1 → x2 → x3 → x5
- Free Spins：x2 → x4 → x6 → x10（雙倍）

---

### 2.6 Scatter / Free Spins 流程

```
軸停完，檢查 Scatter 數量
    ↓
有 1-2 個 Scatter
    ↓
播放 superace_scatter.wav（Scatter 出現聲）
    ↓
如果有 2 個 Scatter
    ↓
播放 superace_scatter_near.wav（等第三個緊張期待）
    ↓
下次旋轉時加強緊張感
    ↓
有 3 個 Scatter
    ↓
播放 superace_freespin_trigger.wav（觸發過場音樂）
    ↓
切換 BGM：superace_bgm_bonus.wav（Free Spins BGM）
    ↓
進入 Free Spins 模式
```

| 檔案 | 觸發時機 | 播放方式 | 建議音量 |
|---|---|---|---|
| `superace_scatter.wav` | 1-2 個 Scatter 出現 | 一次性播放 | 0.7 |
| `superace_scatter_near.wav` | 已有 2 個 Scatter，等第三個 | 一次性播放 | 0.7 |
| `superace_freespin_trigger.wav` | 3 個 Scatter 觸發 Free Spins | 一次性播放，播完切 BGM | 0.9 |
| `superace_bgm_bonus.wav` | Free Spins 進行中 | 循環播放 | 0.6 |
| `superace_freespin_retrigger.wav` | Free Spins 中再中 3 Scatter（加 5 局） | 一次性播放 | 0.8 |
| `superace_freespin_bigwin.wav` | Free Spins 中 Big Win | 一次性播放 | 0.9 |
| `superace_freespin_result.wav` | Free Spins 結束結算 | 一次性播放 | 0.7 |
| `superace_return_base.wav` | 返回主遊戲過場 | 一次性播放 | 0.6 |

---

### 2.7 贏錢等級音樂

```
贏錢金額判定
    ↓
小獎（< 5x） → superace_win_normal.wav
    ↓
中獎（5x - 20x） → superace_win_big.wav
    ↓
大獎（20x - 100x） → superace_mega_win.wav
    ↓
超大獎（100x - 1000x） → superace_ultimate_win.wav
    ↓
Jackpot（> 1000x） → superace_jackpot.wav
```

| 檔案 | 觸發時機 | 播放方式 | 建議音量 |
|---|---|---|---|
| `superace_win_normal.wav` | 小獎（< 5x） | 一次性播放 | 0.7 |
| `superace_win_big.wav` | 中獎（5x - 20x） | 一次性播放 | 0.8 |
| `superace_mega_win.wav` | 大獎（20x - 100x） | 一次性播放 | 0.9 |
| `superace_ultimate_win.wav` | 超大獎（100x - 1000x） | 一次性播放 | 1.0 |
| `superace_jackpot.wav` | Jackpot（> 1000x） | 一次性播放 | 1.0 |

---

### 2.8 其他操作

| 檔案 | 觸發時機 | 播放方式 | 建議音量 |
|---|---|---|---|
| `superace_paytable_open.wav` | 打開 Paytable/Help | 一次性播放 | 0.6 |
| `superace_settings_open.wav` | 打開 Settings/Volume | 一次性播放 | 0.6 |
| `superace_pause.wav` | Pause 暫停 | 一次性播放 | 0.6 |
| `superace_quit.wav` | Quit/Exit 離開確認 | 一次性播放 | 0.6 |
| `superace_no_coins.wav` | 餘額不足 | 一次性播放 | 0.7 |
| `superace_buy_bonus.wav` | Buy Bonus 買免費旋轉 | 一次性播放 | 0.8 |

---

## 三、角色 VO 使用

### 3.1 贏錢叫聲

當玩家贏錢時，根據當前選擇嘅角色播放對應 VO：

| 角色 | 檔案 | 叫聲 |
|---|---|---|
| Yellow（黃兔） | `vo_superace_yellow.wav` | 「Win！」（可愛少女聲） |
| Wizard（巫師兔） | `vo_superace_wizard.wav` | 「Excellent！」（成熟低沉聲） |
| Ninja（忍者兔） | `vo_superace_ninja.wav` | 「Hmph！」（俐落中低聲） |
| King（國王兔） | `vo_superace_king.wav` | 「Hail！」（厚實胸腔聲） |

**觸發規則：**
- 小獎：隨機播放，唔好每次都播
- 中獎以上：必定播放
- Free Spins 觸發：必定播放角色 VO
- Jackpot：必定播放角色 VO + 特別音樂

---

## 四、BGM 切換規則

### 4.1 BGM 層級

```
大廳 BGM（lobby）
    ↓ 玩家按 SPIN
主遊戲 BGM（bgm_main）
    ↓ 觸發 Free Spins
Free Spins BGM（bgm_bonus）
    ↓ Free Spins 結束
返回主遊戲 BGM（bgm_main）
    ↓ 離開小遊戲
大廳 BGM（lobby）
```

### 4.2 切換方式

- **淡出淡入**：BGM 切換時用 1-2 秒 fade out / fade in，唔好突然 cut
- **SFX 唔受影響**：BGM 切換唔應該中斷 SFX
- **靜音按鈕**：所有音頻都應該可以靜音（BGM 同 SFX 分開靜音）

---

## 五、Unity 實作建議

### 5.1 Audio Source 分組

```
- Audio_Music（BGM）
    - lobby
    - bgm_main
    - bgm_bonus
- Audio_SFX（音效）
    - reel_spin / reel_stop / shuffle
    - win_normal / win_big / mega_win / ultimate_win / jackpot
    - golden_card / golden_eliminate / little_joker / big_joker
    - scatter / scatter_near / freespin_trigger / freespin_retrigger / freespin_result / return_base
    - cascade / multiplier / coins / countup
    - ui_*（paytable / settings / pause / quit / no_coins / bet_change / turbo / auto / buy_bonus）
- Audio_VO（角色語音）
    - vo_yellow / vo_wizard / vo_ninja / vo_king
```

### 5.2 音量控制

| 組別 | 預設音量 | 範圍 |
|---|---|---|
| BGM | 0.6 | 0 - 1.0 |
| SFX | 0.7 | 0 - 1.0 |
| VO | 0.9 | 0 - 1.0 |

### 5.3 注意事項

1. **BGM 要 loop**：`bgm_lobby`、`bgm_main`、`bgm_bonus` 設為 loop = true
2. **SFX 唔好重疊**：同一時間最多播放 2-3 個 SFX
3. **VO 優先級最高**：VO 播放時 BGM 自動減低 30%（ducking）
4. **iOS/Android 格式**：如果要出 mobile，建議轉 AAC 或 MP3 壓縮

---

## 六、文件清單

### BGM 背景音樂（9 段）

| 檔名 | 用途 |
|---|---|
| `superace_lobby.wav` | 大廳 BGM |
| `superace_intro.wav` | 開場過場 |
| `superace_bgm_main.wav` | 主遊戲 BGM |
| `superace_bgm_bonus.wav` | Free Spins BGM |
| `superace_win_big.wav` | 中獎音樂 |
| `superace_mega_win.wav` | 大獎音樂 |
| `superace_ultimate_win.wav` | 超大獎音樂 |
| `superace_jackpot.wav` | Jackpot 音樂 |
| `superace_freespin_bigwin.wav` | Free Spins 中 Big Win |

### SFX 音效（25 段）

| 檔名 | 用途 |
|---|---|
| `superace_reel_spin.wav` | 滾輪轉動 |
| `superace_reel_stop.wav` | 單軸停止 |
| `superace_card_shuffle.wav` | 發牌洗牌 |
| `superace_bet_change.wav` | 下注金額調整 |
| `superace_turbo_spin.wav` | Turbo 快速模式 |
| `superace_auto_spin.wav` | Auto Spin 開始 |
| `superace_no_win.wav` | 冇中獎 |
| `superace_win_normal.wav` | 普通贏錢 |
| `superace_win_countup.wav` | 數字飆升 |
| `superace_coins.wav` | 金幣掉落 |
| `superace_golden_card.wav` | Golden Card 出現 |
| `superace_golden_eliminate.wav` | Golden Card 變身 |
| `superace_little_joker.wav` | Little Joker 落地 |
| `superace_big_joker.wav` | Big Joker 擴展 |
| `superace_cascade.wav` | 連勝消除 |
| `superace_multiplier.wav` | Multiplier 上升 |
| `superace_scatter.wav` | Scatter 出現 |
| `superace_scatter_near.wav` | 等第三個 Scatter |
| `superace_freespin_trigger.wav` | Free Spins 觸發 |
| `superace_freespin_retrigger.wav` | Free Spins 再觸發 |
| `superace_freespin_result.wav` | Free Spins 結算 |
| `superace_return_base.wav` | 返回主遊戲 |
| `superace_paytable_open.wav` | 打開 Paytable |
| `superace_settings_open.wav` | 打開 Settings |
| `superace_pause.wav` | Pause 暫停 |
| `superace_quit.wav` | Quit 離開 |
| `superace_no_coins.wav` | 唔夠錢 |
| `superace_buy_bonus.wav` | Buy Bonus |

### 角色 VO（4 段）

| 檔名 | 角色 |
|---|---|
| `vo_superace_yellow.wav` | 黃兔 |
| `vo_superace_wizard.wav` | 巫師兔 |
| `vo_superace_ninja.wav` | 忍者兔 |
| `vo_superace_king.wav` | 國王兔 |

---

## 七、測試檢查清單

- [ ] 進入 SUPER ACE 時有 intro 播放
- [ ] 大廳 BGM 循環正常
- [ ] 按 SPIN 時切換主遊戲 BGM
- [ ] 每個軸停止有咔噠聲
- [ ] 中獎時有對應等級音樂
- [ ] Golden Card 出現有金光聲
- [ ] Scatter 2 個時有期待感音效
- [ ] 3 個 Scatter 觸發 Free Spins 音樂
- [ ] Free Spins 中 BGM 切換正常
- [ ] Free Spins 結束返回主遊戲 BGM
- [ ] 角色 VO 根據選擇角色播放
- [ ] 所有 UI 操作有對應音效
- [ ] 靜音按鈕有效
- [ ] BGM 同 SFX 可以分開調整音量

---

*文檔版本：v1.0*
*最後更新：2026-11-09*
