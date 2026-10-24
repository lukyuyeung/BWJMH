import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import type { GameLogic } from '@bunny-gala/contract';
import type { ServerGame } from '../platform/src/games.js';
import { simulate } from '../platform/src/simulate.js';
import { logic as duel } from '../games/carrot-duel/src/game.js';
import { logic as fortune } from '../games/fortune-3-card/src/game.js';

type S = { moves: number; bag?: unknown };

/** A tiny game: one player against the banker (seat 0); the hand ends after two moves. */
function fake(overrides: Partial<GameLogic<S, { n: number }, S>> = {}): ServerGame {
  const game: GameLogic<S, { n: number }, S> = {
    gameId: 'fake',
    pve: true,
    seats: 1,
    random: 'none',
    turnMs: 1000,
    create: () => ({ moves: 0 }),
    reduce: (s) => ({ ...s, moves: s.moves + 1 }),
    actors: (s) => (s.moves < 2 ? [1] : []),
    dealt: (s) => s.moves > 0,
    needsDraw: () => false,
    result: (s) => (s.moves >= 2 ? { payouts: [{ seat: 1, payout: 20 }], result: null } : null),
    matchOver: () => false,
    fallback: () => ({ n: 1 }),
    liability: () => 10,
    ...overrides,
  };
  return game as unknown as ServerGame;
}

const problemsOf = (game: ServerGame) => simulate(game, { hands: 3 }).problems.join('\n');

describe('simulate catches', () => {
  it('a clean game has no problems', () => {
    expect(simulate(fake(), { hands: 3 })).toEqual({ hands: 3, played: 3, waiting: 0, problems: [] });
  });

  it('reduce changing the state it was given', () => {
    expect(problemsOf(fake({ reduce: (s) => ((s.moves += 1), s) }))).toContain('reduce 改了傳入的 state');
  });

  it('state that cannot become JSON', () => {
    expect(problemsOf(fake({ create: () => ({ moves: 0, bag: new Map() }) }))).toContain('state 不能轉成 JSON');
  });

  it('Math.random', () => {
    expect(problemsOf(fake({ reduce: (s) => ({ ...s, moves: s.moves + 1 + Math.floor(Math.random() * 0) }) }))).toContain('用了 Math.random');
  });

  it('a hand that never ends', () => {
    expect(problemsOf(fake({ actors: () => [1], result: () => null }))).toContain('2000 步內沒有結束');
  });

  it('a stake that falls after the deal', () => {
    expect(problemsOf(fake({ liability: (s) => (s.moves >= 1 ? 5 : 10) }))).toContain('座位 1 在 dealt() 之後 liability 從 10 降到 5');
  });

  it('a payout over maxPayoutMultiple', () => {
    const game = fake({ maxPayoutMultiple: 2, result: (s) => (s.moves >= 2 ? { payouts: [{ seat: 1, payout: 999 }], result: null } : null) });
    expect(problemsOf(game)).toContain('座位 1 派彩 999 超過押注 10 × maxPayoutMultiple 2');
  });

  it('player-vs-player payouts that do not add up to the stakes', () => {
    const game = fake({
      pve: false,
      seats: 2,
      actors: (s) => (s.moves < 2 ? [s.moves] : []),
      result: (s) => (s.moves >= 2 ? { payouts: [{ seat: 0, payout: 15 }], result: null } : null),
    });
    expect(problemsOf(game)).toContain('pve 為 false 但派彩總和 15 不等於押注總和 20');
  });

  it('hidden cards with no privateView', () => {
    expect(problemsOf(fake({ random: 'server', needsDraw: () => false }))).toContain('random 為 server 但沒有 privateView');
  });

  it('a hand that waits for a person to bet is not a problem', () => {
    // Like Three Card Poker: before the deal, the fallback (and the bot) only waits for the player's bet.
    const game = fake({ reduce: (s, a) => (a.n === 0 ? s : { ...s, moves: s.moves + 1 }), fallback: () => ({ n: 0 }) });
    expect(simulate(game, { hands: 3 })).toEqual({ hands: 3, played: 0, waiting: 3, problems: [] });
  });

  it('can play the people with their fallback, as the server does when they are idle', () => {
    // Bots bet, but an idle person's fallback only waits: on the server that hand waits for them.
    const game = fake({
      reduce: (s, a) => (a.n === 0 ? s : { ...s, moves: s.moves + 1 }),
      bot: () => ({ n: 1 }),
      fallback: () => ({ n: 0 }),
    });
    expect(simulate(game, { hands: 2 })).toMatchObject({ played: 2, waiting: 0 });
    expect(simulate(game, { hands: 2, players: 'fallback' })).toMatchObject({ played: 0, waiting: 2 });
  });

  it.each([2.5, Number.NaN])('a stake of %s (the ledger only takes whole carrots)', (amount) => {
    expect(problemsOf(fake({ liability: () => amount }))).toContain(`座位 1 的 liability ${amount} 不是 0 或正整數`);
  });

  it('a stake over the room’s maxStake', () => {
    expect(problemsOf(fake({ liability: () => 99_999 }))).toContain('座位 1 的 liability 99999 超過房間上限 maxStake 3000');
  });

  it('an opening stake above minStake', () => {
    expect(problemsOf(fake({ liability: () => 30, minStake: () => 20 }))).toContain('座位 1 開局要鎖 30，比 minStake 20 多');
  });

  it('a stake that rises at a draw (the table only locks after a move)', () => {
    const game = fake({
      pve: false,
      seats: 2,
      random: 'server',
      privateView: (s) => s,
      // The hand ends at the draw; the draw doubles everyone's stake, and the pot pays it out.
      create: () => ({ moves: 0 }),
      needsDraw: (s) => s.moves === 0,
      reduce: (s) => ({ ...s, moves: s.moves + 1 }),
      actors: () => [],
      dealt: (s) => s.moves > 0,
      liability: (s) => (s.moves > 0 ? 20 : 10),
      result: (s) => (s.moves > 0 ? { payouts: [{ seat: 0, payout: 40 }], result: null } : null),
    });
    const problems = problemsOf(game);
    expect(problems).toContain('座位 0 的 liability 在 draw 時從 10 升到 20');
    expect(problems).toContain('pve 為 false 但派彩總和 40 不等於押注總和 20');
  });

  it('bots that never open a hand at a shared table', () => {
    const game = fake({ pve: false, seats: 2, actors: (s) => (s.moves < 2 ? [0] : []), reduce: (s) => s, fallback: () => ({ n: 0 }) });
    expect(problemsOf(game)).toContain('多人桌的空位由機器人坐，機器人卻不會開局');
  });

  it('some hands bots cannot open, others they can', () => {
    let hand = 0;
    const game = fake({ create: () => ({ moves: 0, bag: hand++ % 2 }), reduce: (s) => (s.bag ? s : { ...s, moves: s.moves + 1 }) });
    expect(problemsOf(game)).toContain('有 1 手機器人打不下去，但也有手打完了：bot() 不是每次都會動');
  });

  it('a bot that changes the state it was given', () => {
    const game = fake({ bot: (s) => ((s as { touched?: number }).touched = 1, { n: 1 }) });
    expect(problemsOf(game)).toContain('bot 改了傳入的 state');
  });

  it('a privateView that throws', () => {
    const game = fake({ random: 'server', privateView: () => { throw new Error('boom'); } });
    expect(problemsOf(game)).toContain('privateView 丟出錯誤：boom');
  });

  it('puts Math.random back afterwards', () => {
    const before = Math.random;
    simulate(fake(), { hands: 1 });
    expect(Math.random).toBe(before);
  });
});

describe('simulate runs the real examples clean', () => {
  it.each([
    ['carrot-duel full', duel as unknown as ServerGame, { deck: 'full' }],
    ['carrot-duel short', duel as unknown as ServerGame, { deck: 'short' }],
    ['fortune-3-card', fortune as unknown as ServerGame, {}],
  ])('%s', (_name, game, options) => {
    expect(simulate(game, { hands: 50, options }).problems).toEqual([]);
  });
});

describe('npm run check', () => {
  const kit = fileURLToPath(new URL('..', import.meta.url));
  const check = (id: string) => spawnSync('npx', ['tsx', 'scripts/check.ts', id], { cwd: kit, encoding: 'utf8' });

  it.each([
    ['_template', '_template 是範本，請先複製並改名'],
    ['不存在', '找不到 games/不存在'],
  ])('refuses %s and lists the games', (id, says) => {
    const run = check(id);
    expect(run.status).toBe(1);
    expect(run.stdout + run.stderr).toContain(says);
    expect(run.stdout + run.stderr).toContain('carrot-duel');
  });
});
