/**
 * 胡蘿蔔比大小的畫面（GameView）。只畫伺服器給的資料：privateView 的結果和 ctx。
 * 畫面不算輸贏、不洗牌、不碰紅蘿蔔，玩家按按鈕就呼叫 host.act()，其他都交給伺服器。
 * 這裡用最簡單的 DOM，沒有美術；正式遊戲請照 docs/美術風格 做。
 */
import type { GameView, HostApi, ViewContext } from '@bunny-gala/contract';
import { rankOf, type Action, type Card, type View } from './logic.js';

const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const SUITS = ['♣', '♦', '♥', '♠'];

let root: HTMLElement | null = null;
let host: HostApi<Action> | null = null;
let deadlineAt: number | null = null;
/** The seat this viewer asked for while watching; the server deals them in from the next hand. */
let pickedSeat: number | null = null;
let clock: ReturnType<typeof setInterval> | undefined;

function cardFace(card: Card | null): string {
  if (card === null) return '<span class="card back">🥕</span>';
  const suit = Math.floor(card / 13);
  return `<span class="card ${suit === 1 || suit === 2 ? 'red' : ''}">${RANKS[rankOf(card)]}${SUITS[suit]}</span>`;
}

function seatStatus(view: View, seat: number): string {
  if (view.phase === 'done') return view.winners.includes(seat) ? '贏了' : view.folded[seat] ? '棄牌' : '輸了';
  if (view.folded[seat]) return '棄牌';
  if (view.called[seat]) return '跟注';
  return view.turnSeat === seat ? '思考中…' : '';
}

function paintClock(): void {
  const el = root?.querySelector<HTMLElement>('.clock');
  if (!el) return;
  el.textContent = deadlineAt ? `${Math.max(0, Math.ceil((deadlineAt - Date.now()) / 1000))} 秒` : '';
}

/**
 * 玩家名字在正式平台上是玩家自己取的任意文字，放進 HTML 之前一定要跳脫，
 * 不然有人把名字取成 <svg onload=…> 就能在同桌每個人的瀏覽器裡執行程式。
 */
const ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (c) => ESCAPES[c]);
}

/** 整張桌子的 HTML。獨立成純函式，方便測試（tests/view.test.ts）。 */
export function tableHtml(v: View, ctx: ViewContext, picked: number | null): string {
  const me = ctx.you;
  const name = (seat: number) => (seat === me ? '你' : escapeHtml(ctx.seats[seat].displayName));
  const seats = ctx.seats
    .map((s, i) => {
      // 觀戰時可以接手機器人的座位，下一手開始就坐進去（HostApi.takeSeat）。
      const sit = me === -1 && picked === null && s.bot ? `<button class="sit" data-seat="${i}">坐這裡</button>` : '';
      return `<div class="seat ${i === me ? 'me' : ''} ${v.turnSeat === i ? 'turn' : ''}">
        <div class="name">${name(i)}${s.bot ? ' 🤖' : ''}</div>
        ${cardFace(v.cards[i])}
        <div class="state">${seatStatus(v, i)}</div>${sit}
      </div>`;
    })
    .join('');
  const myTurn = me !== -1 && v.turnSeat === me;
  const status =
    v.phase === 'done'
      ? `開牌！底池 ${v.pot} 🥕 由 ${v.winners.map(name).join('、')} 拿走`
      : me === -1
        ? picked === null
          ? '觀戰中。可以點「坐這裡」，下一手開始加入。'
          : `已選 ${picked + 1} 號位，下一手開始發牌給你。`
        : myTurn
          ? `輪到你：跟注再押 ${v.ante} 🥕，或棄牌`
          : `底池 ${v.pot} 🥕，等其他玩家…`;
  return `<div class="duel">
    <div class="seats">${seats}</div>
    <p class="status">${status} <span class="clock"></span></p>
    <div class="actions">${myTurn ? '<button data-act="call">跟注</button><button data-act="fold">棄牌</button>' : ''}</div>
  </div>`;
}

export const view: GameView<View, Action> = {
  // 掛上畫面。host 是和平台溝通的唯一管道。畫好桌子後呼叫 host.ready()。
  mount(el, h) {
    root = el;
    host = h;
    el.innerHTML = '<div class="duel"><p class="status">等待發牌…</p></div>';
    clock = setInterval(paintClock, 250);
    h.ready();
  },

  // 每次伺服器送來新的畫面就重畫。ctx.you 是自己的座位；-1 表示正在觀戰。
  render(v, ctx: ViewContext) {
    if (!root || !host) return;
    const me = ctx.you;
    if (me !== -1) pickedSeat = null;
    root.innerHTML = tableHtml(v, ctx, pickedSeat);
    root.querySelectorAll<HTMLButtonElement>('[data-act]').forEach((b) =>
      // 動作帶上自己的座位；伺服器會再蓋一次章，所以沒辦法冒充別人。
      b.addEventListener('click', () => host!.act({ type: b.dataset.act as 'call' | 'fold', seat: me })),
    );
    root.querySelectorAll<HTMLButtonElement>('.sit').forEach((b) =>
      b.addEventListener('click', () => {
        pickedSeat = Number(b.dataset.seat);
        host!.takeSeat?.(pickedSeat);
        view.render(v, ctx);
      }),
    );
    paintClock();
  },

  // 伺服器的倒數（UTC 時間），沒有人在計時時是 null。
  deadline(at) {
    deadlineAt = at ? Date.parse(at) : null;
    paintClock();
  },

  destroy() {
    clearInterval(clock);
    pickedSeat = null;
    root?.replaceChildren();
    root = null;
    host = null;
  },
};
