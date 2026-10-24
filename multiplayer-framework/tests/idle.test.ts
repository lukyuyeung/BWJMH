/**
 * The shared idle-player check must not fail games that are fine on the platform:
 * a one-seat game whose fallback plays the hand (the table waits for `next` between hands),
 * and a view that happens to have a field called `draw` (a draw pile, say).
 */
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, beforeAll, it } from 'vitest';
import { loadGames } from '../platform/src/games.js';
import { expectIdlePlay, GAMES_DIR, startKit } from './helpers.js';

const fixtures = fileURLToPath(new URL('./.fixtures-idle', import.meta.url));
let kit: Awaited<ReturnType<typeof startKit>>;

beforeAll(async () => {
  rmSync(fixtures, { recursive: true, force: true });
  mkdirSync(fixtures, { recursive: true });
  const dir = join(fixtures, 'auto-bet');
  cpSync(join(GAMES_DIR, '_template'), dir, { recursive: true });
  const edit = (file: string, from: string, to: string) => {
    const path = join(dir, file);
    writeFileSync(path, readFileSync(path, 'utf8').replace(from, to));
  };
  edit('package.json', 'game-template', 'game-auto-bet');
  edit('src/game.ts', "gameId: 'template'", "gameId: 'auto-bet'");
  edit('src/game.ts', 'privateView: (state) => state,', "privateView: (state) => ({ ...state, draw: 'pile' }),");
  edit('src/logic.ts', "export function fallback(): Action {\n  return { type: 'wait' };", "export function fallback(state: State): Action {\n  return state.phase === 'bet' ? { type: 'bet', amount: state.minBet } : { type: 'wait' };");
  kit = await startKit(undefined, fixtures);
});

afterAll(async () => {
  await kit?.close();
  rmSync(fixtures, { recursive: true, force: true });
});

it('a one-seat game whose fallback plays, with a view field named draw, passes the idle check', async () => {
  const game = (await loadGames(fixtures)).get('auto-bet')!;
  await expectIdlePlay(kit.base, game, 'idle-auto-bet');
});
