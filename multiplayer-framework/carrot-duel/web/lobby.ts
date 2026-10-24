/**
 * 大廳：平台的標準大廳（照德州撲克 Poker Room，見 docs/大廳規格.md）。
 * 第一步「怎麼玩」用來選 tableOptions 的牌組（deck），選一樣的人才會同桌。
 * 只改這裡的設定和 public/assets/lobby/ 的圖；web/lobby/ 裡的程式不要改。
 */
import { mountLobby } from './lobby/lobby.js';
import { logic } from '../src/game.js';

const name = new URLSearchParams(location.search).get('name');

void mountLobby({
  gameId: logic.gameId,
  logo: 'assets/lobby/logo.png',
  mascot: 'assets/lobby/mascot.webp',
  scene: 'assets/lobby/scene.webp',
  modesHeading: '選擇牌組',
  modes: [
    { id: 'full', title: '完整 52 張', art: 'assets/lobby/tiles/mode-a.webp' },
    { id: 'short', title: '短牌 9–A', art: 'assets/lobby/tiles/mode-b.webp' },
  ],
  rooms: {
    beginner: { title: '新手', art: 'assets/lobby/tiles/beginner.webp' },
    intermediate: { title: '中級', art: 'assets/lobby/tiles/intermediate.webp' },
    advanced: { title: '高級', art: 'assets/lobby/tiles/advanced.webp' },
    god: { title: '神級', art: 'assets/lobby/tiles/god.webp' },
  },
  open: ({ room, mode }) => {
    const next = new URLSearchParams({ room, deck: mode ?? 'full' });
    // 練習時 ?name= 代表玩家，要一起帶過去。
    if (name) next.set('name', name);
    location.assign(`play.html?${next}`);
  },
});
