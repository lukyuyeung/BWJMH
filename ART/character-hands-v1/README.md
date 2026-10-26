# 角色兔掌 v1

- collection.png：忍者、國王、巫師三款概念設計圖。
- live-collection.png / live-ninja.png / live-king.png / live-wizard.png：實際程式模型的設計預覽截圖。
- index.html：3D 預覽，可分別重播摸牌／出牌／立直；加 ?role=ninja / king / wizard 可單獨查看。

忍者：炭黑手套、棕色雙束帶、銀灰護腕片。
國王：奶油色兔掌、酒紅袖、白皮草黑點袖口、金邊皇冠扣。
巫師：銀白兔掌、深紫袖、金邊、青綠寶石袖扣。

遊戲使用同一個 src/table-hands.ts 動作程式。掌形、手指位置、袖身連續延伸、摸牌 0.52 秒、出牌／立直 0.72 秒、63% 放牌／摸牌事件、牌的位置、排隊與收手不變。按實際座位角色分配外觀，不隨莊家輪轉交換角色。

預覽的 table-hands.js 由 build-hand-preview.mjs 每次建置從同一 TS 原始碼產生，避免設計展示與實際遊戲各用一套模型。概念圖的燈光／材質細節是美術方向；live 截圖及 3D 預覽對應實裝模型。

公開互動預覽：https://bunny-gala-table-demo.almondcrab34.chatgpt.site/art/character-hands-v1/index.html
