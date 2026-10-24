/**
 * privateView 測試（必須有，npm run check 會檢查）。改成你的遊戲：
 * 證明每個座位只看得到自己該看的；觀戰者（seat -1）看不到任何暗牌；畫面裡沒有 draw 或整副牌。
 * 有暗牌的完整範例：games/carrot-duel/tests/privacy.test.ts。
 */
import { describe, expect, it } from 'vitest';
import type { RoundContext } from '@bunny-gala/contract';
import { logic } from '../src/game.js';

const ctx: RoundContext = {
  mode: 'casual',
  room: 'beginner',
  seats: [
    { seat: 0, bot: true, displayName: 'Banker', vip: 0 },
    { seat: 1, bot: false, displayName: 'alice', vip: 0 },
  ],
  you: 1,
  pveBanker: 0,
  chips: [],
  options: {},
  handNo: 0,
  limits: { unit: 10, minBet: 10, maxBet: 1000, maxStake: 3000 },
  draw: [5, 17, 33, 2, 48, 11, 0, 29, 40, 7, 21, 36, 14, 3, 50, 26],
};

describe('privateView', () => {
  const betPlaced = logic.reduce(logic.create(ctx), { type: 'bet', amount: 10 }, ctx);

  it('shows no card before the deal', () => {
    const view = logic.privateView!(betPlaced, 1, ctx);
    expect(view.playerCard).toBeNull();
    expect(view.bankerCard).toBeNull();
  });

  it('never carries the draw', () => {
    const done = logic.reduce(betPlaced, { type: 'draw' }, ctx);
    expect(Object.keys(logic.privateView!(done, -1, ctx))).not.toContain('draw');
  });
});
