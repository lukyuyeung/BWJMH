# BWJMH

Bunny Warriors Japanese Mahjong。

## 日麻：保留原版，同核心供 TYC∞N 使用

新的 [apps/riichi](apps/riichi/README.md) 以已發布 Bunny Gala v103 源碼為共同基礎，提供：

- 原版 Bunny Gala：`npm run build:bunny`
- TYC∞N 墨綠金色版：`npm run build:tycoon`

兩個版本分開部署，存檔、教學、語言及音效設定分開儲存。原有公開站不會因這個分支而改版。

| 路徑 | 用途 |
|---|---|
| `apps/riichi/` | 目前共用的 v103 日麻前端、規則及兩個主題 |
| `Bunny_Gala_Riichi_v2.7.2/` | 保留的早期 React／Socket.IO 遊戲專案 |
| `multiplayer-framework/` | 保留的 Bunny Gala 遊戲契約及練習平台 |
| `handover/` | 歷史交接資料及原始素材 |

先看 [apps/riichi/README.md](apps/riichi/README.md) 的安裝、部署與現有能力。TYC∞N 目前仍是單人 Bot 練習，不是已連接真實錢包或真人伺服器的版本。
