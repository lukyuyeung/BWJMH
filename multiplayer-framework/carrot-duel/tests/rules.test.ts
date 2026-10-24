import { describe, expect, it } from 'vitest';
import { logic } from '../src/game.js';
import type { Card, State } from '../src/logic.js';
import { ctx } from './context.js';

const KING = (suit: number): Card => suit * 13 + 11;
const THREE = 1;
const FIVE = 3;

function dealt(c = ctx()): State {
  return logic.reduce(logic.create(c), { type: 'draw' }, c);
}

/** A dealt hand with these cards, to steer who wins. */
function withCards(cards: Card[], c = ctx()): State {
  return { ...dealt(c), cards };
}

function play(state: State, moves: ('call' | 'fold')[], c = ctx()): State {
  for (const type of moves) state = logic.reduce(state, { type, seat: logic.actors(state)[0] }, c);
  return state;
}

describe('carrot-duel rules', () => {
  it('locks the ante before the deal', () => {
    const state = logic.create(ctx());
    expect([0, 1, 2, 3].map((seat) => logic.liability(state, seat, ctx()))).toEqual([10, 10, 10, 10]);
    expect(logic.needsDraw(state)).toBe(true);
    expect(logic.dealt(state)).toBe(false);
  });

  it('deals each seat one different card', () => {
    const state = dealt();
    expect(state.cards.every((c) => c !== null)).toBe(true);
    expect(new Set(state.cards).size).toBe(4);
    expect(logic.dealt(state)).toBe(true);
  });

  it('short deck only has 9 to A', () => {
    const c = ctx({ options: { deck: 'short' } });
    for (let k = 0; k < 20; k++) {
      const state = logic.reduce(logic.create(c), { type: 'draw' }, { ...c, draw: c.draw!.map((v) => (v + k * 7) % 52) });
      expect(state.cards.every((card) => card !== null && card % 13 >= 7)).toBe(true);
    }
  });

  it('rotates the first speaker with handNo', () => {
    expect(logic.actors(dealt(ctx({ handNo: 0 })))).toEqual([0]);
    expect(logic.actors(dealt(ctx({ handNo: 1 })))).toEqual([1]);
    expect(logic.actors(dealt(ctx({ handNo: 5 })))).toEqual([1]);
  });

  it('ignores a move from a seat that is not on turn', () => {
    const state = dealt();
    expect(logic.reduce(state, { type: 'call', seat: 2 }, ctx())).toBe(state);
  });

  it('call raises the stake, fold keeps it', () => {
    const state = play(dealt(), ['call', 'fold']);
    expect(logic.liability(state, 0, ctx())).toBe(20);
    expect(logic.liability(state, 1, ctx())).toBe(10);
  });

  it('last one standing wins without a showdown', () => {
    const state = play(dealt(), ['fold', 'fold', 'fold']);
    expect(state.phase).toBe('done');
    expect(logic.result(state)?.payouts).toEqual([{ seat: 3, payout: 40 }]);
  });

  it('two winners split the pot', () => {
    const state = play(withCards([KING(0), KING(1), THREE, FIVE]), ['call', 'call', 'fold', 'fold']);
    expect(logic.result(state)?.payouts).toEqual([
      { seat: 0, payout: 30 },
      { seat: 1, payout: 30 },
    ]);
  });

  it('the odd carrot of a split goes to the lowest seat', () => {
    const state = play(withCards([KING(0), KING(1), KING(2), FIVE]), ['call', 'call', 'call', 'fold']);
    const payouts = logic.result(state)!.payouts;
    expect(payouts).toEqual([
      { seat: 0, payout: 24 },
      { seat: 1, payout: 23 },
      { seat: 2, payout: 23 },
    ]);
    expect(payouts.reduce((sum, p) => sum + p.payout, 0)).toBe(70);
  });

  it('the highest card wins after everyone has spoken', () => {
    const state = play(withCards([FIVE, KING(0), THREE, FIVE + 13]), ['call', 'call', 'call', 'call']);
    expect(logic.result(state)?.payouts).toEqual([{ seat: 1, payout: 80 }]);
  });

  it('bots call J or better and fold below', () => {
    const state = withCards([9, 8, 12, 0]);
    expect(logic.bot!(state, 0, ctx())).toEqual({ type: 'call', seat: 0 });
    expect(logic.bot!({ ...state, cards: [8, 9, 12, 0] }, 0, ctx())).toEqual({ type: 'fold', seat: 0 });
    expect(logic.fallback(state, 0, ctx())).toEqual({ type: 'fold', seat: 0 });
  });

  it('counts the hands played at the table', () => {
    expect(logic.nextOptions!(dealt(), {})).toEqual({ handsPlayed: 1 });
    expect(logic.nextOptions!(dealt(), { handsPlayed: 4 })).toEqual({ handsPlayed: 5 });
  });

  it('wins at most 4 times the stake, which is its maxPayoutMultiple', () => {
    // Everyone else folds before the winner speaks: 1 ante staked, pot of 4 antes.
    const alone = play(dealt(), ['fold', 'fold', 'fold']);
    // Everyone calls and one card is best: 2 antes staked, pot of 8.
    const allIn = play(withCards([KING(0), THREE, FIVE, 0]), ['call', 'call', 'call', 'call']);
    expect(logic.result(alone)!.payouts[0].payout / logic.liability(alone, 3, ctx())).toBe(4);
    expect(logic.result(allIn)!.payouts[0].payout / logic.liability(allIn, 0, ctx())).toBe(4);
    expect(logic.maxPayoutMultiple).toBe(4);
  });

  it('needs two bets to sit down', () => {
    expect(logic.minStake!(ctx().limits)).toBe(20);
  });
});
