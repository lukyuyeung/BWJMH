/**
 * privateView 測試：每款有暗牌的遊戲都要有這樣一個檔案（npm run check 會檢查）。
 * 伺服器只把 privateView(state, seat) 送給那個座位，所以這裡要證明：
 * 開牌前只看得到自己的牌；觀戰者（seat -1）誰的都看不到；開牌後才看得到還在場的人的牌。
 */
import { describe, expect, it } from 'vitest';
import { logic } from '../src/game.js';
import { ctx } from './context.js';

describe('carrot-duel privateView', () => {
  const c = ctx();
  const dealt = logic.reduce(logic.create(c), { type: 'draw' }, c);

  it('shows a seat only its own card before the showdown', () => {
    const view = logic.privateView!(dealt, 1, c);
    expect(view.cards.map((card) => card !== null)).toEqual([false, true, false, false]);
    expect(view.cards[1]).toBe(dealt.cards[1]);
  });

  it('shows a spectator nobody’s card', () => {
    expect(logic.privateView!(dealt, -1, c).cards).toEqual([null, null, null, null]);
  });

  it('opens the cards of seats still in at the showdown, not the folded ones', () => {
    let state = dealt;
    for (const type of ['call', 'fold', 'call', 'call'] as const) {
      state = logic.reduce(state, { type, seat: logic.actors(state)[0] }, c);
    }
    expect(state.phase).toBe('done');
    const view = logic.privateView!(state, -1, c);
    expect(view.cards).toEqual([state.cards[0], null, state.cards[2], state.cards[3]]);
  });

  it('never puts the whole deck or the draw in a view', () => {
    const view = logic.privateView!(dealt, 0, c) as unknown as Record<string, unknown>;
    expect(Object.keys(view)).not.toContain('draw');
    expect(JSON.stringify(view)).not.toContain(JSON.stringify(dealt.cards));
  });
});
