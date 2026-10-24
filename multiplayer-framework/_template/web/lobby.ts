/**
 * 大廳：用平台的標準大廳（照德州撲克 Poker Room，見 docs/大廳規格.md）。
 * 只改這裡的設定和 public/assets/lobby/ 的圖；web/lobby/ 裡的程式不要改。
 */
import { mountLobby } from './lobby/lobby.js';
import { logic } from '../src/game.js';

const name = new URLSearchParams(location.search).get('name');

void mountLobby({
  gameId: logic.gameId,
  // 改這裡：換成你的 Logo、主視覺角色、背景（現在是寫著「替換」的佔位圖）。
  logo: 'assets/lobby/logo.png',
  mascot: 'assets/lobby/mascot.webp',
  scene: 'assets/lobby/scene.webp',
  // 這款沒有第一步「怎麼玩」，直接選房間。要第一步的話加 modes，看 games/carrot-duel/web/lobby.ts。
  rooms: {
    beginner: { title: '新手', art: 'assets/lobby/tiles/beginner.webp' },
    intermediate: { title: '中級', art: 'assets/lobby/tiles/intermediate.webp' },
    advanced: { title: '高級', art: 'assets/lobby/tiles/advanced.webp' },
    god: { title: '神級', art: 'assets/lobby/tiles/god.webp' },
  },
  // 練習時 ?name= 代表玩家，要一起帶過去。
  open: ({ room }) => location.assign(`play.html?room=${room}${name ? `&name=${encodeURIComponent(name)}` : ''}`),
});
