/**
 * 胡蘿蔔比大小的規則（純函式，伺服器執行）。這是 online 多人桌的最小範例：
 * 2–4 位玩家（空位由機器人坐），沒有莊家。每人押底注、拿一張暗牌，依序「跟注」或「棄牌」，
 * 最後還在場的人裡牌最大的拿走整個底池。
 *
 * 規則檔的硬規定（違反的話 npm run check 會抓到）：
 * - 不能碰 DOM，不能用 Math.random。亂數只能從 ctx.draw 來。
 * - 不能改傳進來的 state，每一步都回傳新的物件。
 * - state 必須能 JSON 化（只放數字、字串、布林、陣列、一般物件）。
 */
import type { HandResult, RoundContext, TableLimits } from '@bunny-gala/contract';

/** 0–51。rank = card % 13（0 是 2，12 是 A），suit = Math.floor(card / 13)。 */
export type Card = number;

/** full：52 張。short：只留 9、10、J、Q、K、A（rank 7–12），共 24 張。 */
export type Deck = 'full' | 'short';

export interface State {
  phase: 'deal' | 'turns' | 'done';
  deck: Deck;
  /** 底注 = 房間的 minBet（ctx.limits.minBet）。 */
  ante: number;
  /** 座位數（ctx.seats.length）。 */
  seats: number;
  cards: (Card | null)[];
  called: boolean[];
  folded: boolean[];
  /** 說話順序：從 handNo % seats 那一位開始輪。 */
  order: number[];
  /** order 裡現在輪到第幾位。 */
  turn: number;
  winners: number[];
  pot: number;
}

/**
 * 每個動作都帶 seat。伺服器會把 seat 蓋成「送出這個動作的人」的座位，所以玩家不能冒充別人。
 * draw 由平台送來（needsDraw 為 true 時），這時 ctx.draw 已經填好。
 */
export type Action = { type: 'draw' } | { type: 'call'; seat: number } | { type: 'fold'; seat: number };

/** 送到瀏覽器的畫面：沒有整副牌，別人的暗牌是 null。 */
export interface View {
  phase: State['phase'];
  cards: (Card | null)[];
  called: boolean[];
  folded: boolean[];
  turnSeat: number | null;
  pot: number;
  ante: number;
  winners: number[];
}

export const rankOf = (card: Card) => card % 13;

export function deckOf(deck: Deck): Card[] {
  const all = Array.from({ length: 52 }, (_, card) => card);
  return deck === 'short' ? all.filter((card) => rankOf(card) >= 7) : all;
}

/**
 * 用 ctx.draw 洗牌。ctx.draw 是 16 個 0–51 的數字，可能重複，不是一副牌，
 * 所以要拿它當種子把牌洗開（演算法和三張牌的 deckFromDraw 一樣）。同一組 draw 永遠洗出同一副牌。
 */
export function shuffleFromDraw(draw: readonly number[], deck: readonly Card[]): Card[] {
  const cards = [...deck];
  const source = draw.length > 0 ? draw : [1];
  let state = 0x9e3779b9;
  for (const value of source) state = Math.imul(state ^ (value + 1), 0x45d9f3b) >>> 0;
  for (let index = cards.length - 1; index > 0; index -= 1) {
    const extra = source[index % source.length] ?? 0;
    state = (Math.imul(state, 1664525) + extra + 1013904223) >>> 0;
    const swap = state % (index + 1);
    [cards[index], cards[swap]] = [cards[swap], cards[index]];
  }
  return cards;
}

/** 這個座位押在桌上的紅蘿蔔：底注，跟注後再加一份。棄牌不會退。 */
export function stake(state: State, seat: number): number {
  return state.ante * (state.called[seat] ? 2 : 1);
}

export function create(ctx: RoundContext): State {
  const seats = ctx.seats.length;
  const first = ctx.handNo % seats;
  return {
    phase: 'deal',
    deck: ctx.options.deck === 'short' ? 'short' : 'full',
    ante: ctx.limits.minBet,
    seats,
    cards: Array(seats).fill(null),
    called: Array(seats).fill(false),
    folded: Array(seats).fill(false),
    order: Array.from({ length: seats }, (_, i) => (first + i) % seats),
    turn: 0,
    winners: [],
    pot: 0,
  };
}

function finish(state: State): State {
  const pot = state.cards.reduce((sum: number, _card, seat) => sum + stake(state, seat), 0);
  const inHand = state.order.filter((seat) => !state.folded[seat]).sort((a, b) => a - b);
  const best = Math.max(...inHand.map((seat) => rankOf(state.cards[seat]!)));
  const winners = inHand.length === 1 ? inHand : inHand.filter((seat) => rankOf(state.cards[seat]!) === best);
  return { ...state, phase: 'done', pot, winners };
}

export function reduce(state: State, action: Action, ctx: RoundContext): State {
  if (action.type === 'draw') {
    if (state.phase !== 'deal' || !ctx.draw) return state;
    const shuffled = shuffleFromDraw(ctx.draw, deckOf(state.deck));
    return { ...state, phase: 'turns', cards: state.cards.map((_, seat) => shuffled[seat]) };
  }
  if (state.phase !== 'turns' || action.seat !== state.order[state.turn]) return state;
  const seat = action.seat;
  const next: State = {
    ...state,
    called: action.type === 'call' ? state.called.map((v, i) => v || i === seat) : state.called,
    folded: action.type === 'fold' ? state.folded.map((v, i) => v || i === seat) : state.folded,
    turn: state.turn + 1,
  };
  const left = next.folded.filter((f) => !f).length;
  return left === 1 || next.turn >= next.order.length ? finish(next) : next;
}

export function actors(state: State): number[] {
  return state.phase === 'turns' ? [state.order[state.turn]] : [];
}

export function result(state: State): HandResult | null {
  if (state.phase !== 'done') return null;
  const share = Math.floor(state.pot / state.winners.length);
  const odd = state.pot - share * state.winners.length;
  return {
    // 派彩包含退回的本金。沒有莊家，所以派彩總和 = 所有人押的總和。零頭給座位號最小的贏家。
    payouts: state.winners.map((seat, i) => ({ seat, payout: share + (i === 0 ? odd : 0) })),
    result: { winners: state.winners, cards: state.cards.map((card, seat) => (state.folded[seat] ? null : card)) },
  };
}

/** 機器人：J 以上跟注，否則棄牌。 */
export function bot(state: State, seat: number): Action {
  return rankOf(state.cards[seat] ?? 0) >= 9 ? { type: 'call', seat } : { type: 'fold', seat };
}

/** 超時或斷線：棄牌。 */
export function fallback(_state: State, seat: number): Action {
  return { type: 'fold', seat };
}

export function privateView(state: State, seat: number): View {
  return {
    phase: state.phase,
    // 只給自己的牌；開牌後才給還在場的人的牌。觀戰者（seat -1）開牌前誰的都看不到。
    cards: state.cards.map((card, i) => (i === seat || (state.phase === 'done' && !state.folded[i]) ? card : null)),
    called: state.called,
    folded: state.folded,
    turnSeat: state.phase === 'turns' ? state.order[state.turn] : null,
    pot: state.phase === 'done' ? state.pot : state.cards.reduce((sum: number, _c, i) => sum + stake(state, i), 0),
    ante: state.ante,
    winners: state.winners,
  };
}

/** 坐下至少要付得起底注加一次跟注。 */
export function minStake(limits: TableLimits): number {
  return 2 * limits.minBet;
}
