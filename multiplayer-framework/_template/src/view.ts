/** 新遊戲的畫面。只畫 render() 給的資料，用 host.act() 送動作。改成你的美術（docs/美術風格）。 */
import type { GameView, HostApi } from '@bunny-gala/contract';
import { ROOMS } from '@bunny-gala/contract/client';
import { roomFromUrl } from '@bunny-gala/contract/shell';
import type { Action, View } from './logic.js';

const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const face = (card: number | null) => (card === null ? '?' : `${RANKS[card % 13]}${'♣♦♥♠'[Math.floor(card / 13)]}`);

let root: HTMLElement | null = null;
let host: HostApi<Action> | null = null;

export const view: GameView<View, Action> = {
  mount(el, h) {
    root = el;
    host = h;
    el.innerHTML = '<p>連線中…</p>';
    h.ready();
  },

  render(v) {
    if (!root || !host) return;
    if (v.phase === 'bet') {
      root.innerHTML = `<p>押多少？</p><button data-bet="${v.minBet}">${v.minBet} 🥕</button> <button data-bet="${v.minBet * 5}">${v.minBet * 5} 🥕</button>`;
      root.querySelectorAll<HTMLButtonElement>('[data-bet]').forEach((b) =>
        b.addEventListener('click', () => host!.act({ type: 'bet', amount: Number(b.dataset.bet) })),
      );
      return;
    }
    const outcome = v.phase === 'done' && v.playerCard !== null && v.bankerCard !== null
      ? v.playerCard % 13 > v.bankerCard % 13 ? '你贏了！' : v.playerCard % 13 === v.bankerCard % 13 ? '平手' : '莊家贏'
      : '發牌中…';
    root.innerHTML = `<p>你：${face(v.playerCard)}　莊家：${face(v.bankerCard)}</p><p>${outcome}</p>`;
    // 單人桌結束後，按鈕呼叫 startCasual 開下一手。
    if (v.phase === 'done') {
      const again = document.createElement('button');
      again.textContent = '再來一手';
      again.addEventListener('click', () => host!.startCasual(roomFromUrl(ROOMS, 'beginner')));
      root.append(again);
    }
  },

  destroy() {
    root?.replaceChildren();
    root = null;
    host = null;
  },
};
