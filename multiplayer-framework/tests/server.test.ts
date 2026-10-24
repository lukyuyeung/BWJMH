import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { loadGames } from '../platform/src/games.js';
import { handRecords } from '../platform/src/tables/money.js';
import { call, Seat, startKit, until } from './helpers.js';

let kit: Awaited<ReturnType<typeof startKit>>;

beforeAll(async () => {
  kit = await startKit();
});

afterAll(async () => {
  await kit.close();
});

describe('practice API', () => {
  it('me needs a practice name', async () => {
    expect(await call(kit.base, '/v1/me', null)).toMatchObject({ status: 401, body: { ok: false, code: 'NO_AUTH' } });
    expect((await call(kit.base, '/v1/me', 'meg')).body).toMatchObject({ ok: true, displayName: 'meg', carrots: 1_000_000 });
  });

  it('fortune-3-card plays a hand on the memory ledger', async () => {
    const seat = await Seat.sit(kit.base, 'alice', 'fortune-3-card');
    await until(() => seat.states.length > 0);
    seat.act({ type: 'deal', ante: 10, pairPlus: 0 });
    await until(() => seat.states.some((s) => s.view.phase === 'showdown'));
    seat.close();
    const hand = handRecords().find((h) => h.opening.gameId === 'fortune-3-card' && h.status === 'settled')!;
    const stake = hand.stakes.get('p-alice')!;
    expect(stake.staked).toBeGreaterThan(0);
    expect((await call(kit.base, '/v1/me', 'alice')).body.carrots).toBe(1_000_000 - stake.staked + stake.paid);
  });

  it('refuses a room the player cannot cover', async () => {
    await call(kit.base, '/v1/dev/players/poor/reset', null, { carrots: 5 });
    const opened = await call(kit.base, '/v1/casino/tables', 'poor', { gameId: 'fortune-3-card', room: 'beginner' });
    expect(opened).toMatchObject({ status: 400, body: { code: 'ROOM_LOCKED' } });
  });

  it('answers 404 for an unknown game', async () => {
    const opened = await call(kit.base, '/v1/casino/tables', 'alice', { gameId: 'nope', room: 'beginner' });
    expect(opened).toMatchObject({ status: 404, body: { code: 'NOT_FOUND' } });
  });

  it('dev routes list games and reset balances', async () => {
    const games = (await call(kit.base, '/v1/dev/games', null)).body.games as { gameId: string; seats: number }[];
    expect(games.find((g) => g.gameId === 'fortune-3-card')).toMatchObject({ seats: 1 });
    await call(kit.base, '/v1/dev/players/bob/reset', null, { carrots: 1234 });
    const players = (await call(kit.base, '/v1/dev/players', null)).body.players as { name: string; carrots: number }[];
    expect(players.find((p) => p.name === 'bob')).toEqual({ name: 'bob', carrots: 1234 });
  });
});

describe('loadGames', () => {
  // Fixtures live inside the kit: Vitest only loads modules from under its root.
  const fixtures = fileURLToPath(new URL('./.fixtures', import.meta.url));
  const newRoot = () => {
    mkdirSync(fixtures, { recursive: true });
    return mkdtempSync(join(fixtures, 'games-'));
  };
  afterAll(() => rmSync(fixtures, { recursive: true, force: true }));

  function fakeGame(root: string, folder: string, logicSource: string) {
    mkdirSync(join(root, folder), { recursive: true });
    writeFileSync(
      join(root, folder, 'package.json'),
      JSON.stringify({ name: `@bunny-gala/game-${folder}`, type: 'module', exports: { '.': './logic.js', './logic': './logic.js' } }),
    );
    writeFileSync(join(root, folder, 'logic.js'), logicSource);
  }

  it.each([
    ['wrong-id', `export const logic = { gameId: 'other', random: 'none' };`, 'games/wrong-id：gameId 是 "other"'],
    ['no-private-view', `export const logic = { gameId: 'no-private-view', random: 'server' };`, 'games/no-private-view：random 是 "server" 卻沒有 privateView'],
    ['no-logic', `export const rules = {};`, 'games/no-logic：./logic.js 沒有匯出 logic'],
  ])('rejects %s with a clear message', async (folder, source, message) => {
    const root = newRoot();
    fakeGame(root, folder, source);
    await expect(loadGames(root)).rejects.toThrow(message);
  });

  it('names a game folder that has no package.json', async () => {
    const root = newRoot();
    mkdirSync(join(root, 'half-copied', 'src'), { recursive: true });
    await expect(loadGames(root)).rejects.toThrow('games/half-copied：少了 package.json');
  });

  it('names a game folder whose package.json is broken', async () => {
    const root = newRoot();
    mkdirSync(join(root, 'broken'), { recursive: true });
    writeFileSync(join(root, 'broken', 'package.json'), '{ nope');
    await expect(loadGames(root)).rejects.toThrow('games/broken：package.json 不是正確的 JSON');
  });

  it('skips folders starting with _', async () => {
    const root = newRoot();
    fakeGame(root, '_template', `export const rules = {};`);
    fakeGame(root, 'fine', `export const logic = { gameId: 'fine', random: 'none' };`);
    expect([...(await loadGames(root)).keys()]).toEqual(['fine']);
  });
});
