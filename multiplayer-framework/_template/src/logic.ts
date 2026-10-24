/**
 * 新遊戲的骨架：一人對莊家比大小（押注 → 各發一張 → 大的贏，1 賠 1，平手退回）。
 * 它已經能跑、能過 npm run check。把它改成你的遊戲：所有標「改這裡」的地方。
 *
 * 規則檔的硬規定：不能碰 DOM、不能用 Math.random（亂數只能來自 ctx.draw）、
 * 不能改傳進來的 state、state 只能放 JSON 能存的值。詳見 docs/外包指南.md。
 */
import type { HandResult, RoundContext } from '@bunny-gala/contract';

/** 改這裡：你的遊戲狀態。 */
export interface State {
  phase: 'bet' | 'deal' | 'done';
  /** 玩家的座位。有莊家（pve）時莊家是座位 0，玩家是 1。 */
  player: number;
  minBet: number;
  maxBet: number;
  bet: number;
  playerCard: number | null;
  bankerCard: number | null;
}

/** 改這裡：玩家能送的動作。draw 由平台送（needsDraw 為 true 時）。 */
export type Action = { type: 'bet'; amount: number } | { type: 'draw' } | { type: 'wait' };

/** 改這裡：瀏覽器看得到的畫面。這款開牌時兩張一起亮，沒有暗牌，所以就是整個 state。 */
export type View = State;

const rank = (card: number) => card % 13;

/** ctx.draw 是 16 個 0–51 的數字（可能重複），拿它當種子洗牌。同一組 draw 永遠洗出同一副牌。 */
export function shuffleFromDraw(draw: readonly number[]): number[] {
  const cards = Array.from({ length: 52 }, (_, i) => i);
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

export function create(ctx: RoundContext): State {
  return {
    phase: 'bet',
    player: ctx.seats.findIndex((s) => s.seat !== ctx.pveBanker),
    minBet: ctx.limits.minBet,
    maxBet: ctx.limits.maxBet,
    bet: 0,
    playerCard: null,
    bankerCard: null,
  };
}

export function reduce(state: State, action: Action, ctx: RoundContext): State {
  if (action.type === 'bet') {
    const amount = action.amount;
    if (state.phase !== 'bet' || !Number.isInteger(amount) || amount < state.minBet || amount > state.maxBet) return state;
    return { ...state, phase: 'deal', bet: amount };
  }
  if (action.type === 'draw') {
    if (state.phase !== 'deal' || !ctx.draw) return state;
    const [playerCard, bankerCard] = shuffleFromDraw(ctx.draw);
    return { ...state, phase: 'done', playerCard, bankerCard };
  }
  return state;
}

export function result(state: State): HandResult | null {
  if (state.phase !== 'done' || state.playerCard === null || state.bankerCard === null) return null;
  const diff = rank(state.playerCard) - rank(state.bankerCard);
  // 派彩包含本金：贏拿回 2 倍，平手拿回本金，輸是 0。
  const payout = diff > 0 ? state.bet * 2 : diff === 0 ? state.bet : 0;
  return { payouts: [{ seat: state.player, payout }], result: { diff } };
}

/**
 * 機器人：莊家（以及任何機器人座位）。對玩家座位也下最小注，
 * 這樣 npm run check 的規則模擬才打得到結算、驗得到派彩。
 */
export function bot(state: State, seat: number, ctx: RoundContext): Action {
  if (seat === ctx.pveBanker) return { type: 'wait' };
  return state.phase === 'bet' ? { type: 'bet', amount: state.minBet } : { type: 'wait' };
}

/** 玩家超時：還沒下注就繼續等（玩家離開時平台會作廢這一手，退回押注）。 */
export function fallback(): Action {
  return { type: 'wait' };
}
