/**
 * 每一款放進 games/ 的遊戲都會自動跑這些測試（包括外包新做的）：
 * 規則模擬、在真的牌桌引擎上讓伺服器代打、多人桌的入座和斷線。
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { loadGames } from '../platform/src/games.js';
import { simulate } from '../platform/src/simulate.js';
import { handRecords } from '../platform/src/tables/money.js';
import { expectIdlePlay, GAMES_DIR, Seat, startKit, until } from './helpers.js';

const games = [...(await loadGames(GAMES_DIR)).values()];
let kit: Awaited<ReturnType<typeof startKit>>;

beforeAll(async () => {
  kit = await startKit();
});

afterAll(async () => {
  await kit.close();
});

const settledAt = (tableId: string) => handRecords().filter((h) => h.opening.tableId === tableId && h.status === 'settled');

describe.each(games.map((g) => [g.gameId, g] as const))('%s', (gameId, game) => {
  it('simulates 50 hands clean', () => {
    expect(simulate(game, { hands: 50 }).problems).toEqual([]);
  });

  it('plays for an idle player and never sends the draw', async () => {
    await expectIdlePlay(kit.base, game, `idle-${gameId}`);
  });

  it.runIf(game.seats >= 2)('seats a second person at the same table, and plays on when they drop', async () => {
    const alice = await Seat.sit(kit.base, `a-${gameId}`, gameId);
    const bob = await Seat.sit(kit.base, `b-${gameId}`, gameId);
    expect(bob.tableId).toBe(alice.tableId);

    // Mid-hand arrivals watch first (seat -1), then take a seat a bot is playing.
    const seated = () => bob.messages.filter((m) => m.type === 'seated').at(-1)?.body as { seat: number; seats: { seat: number; bot: boolean; banker: boolean }[] } | undefined;
    await until(() => seated() !== undefined);
    if (seated()!.seat === -1) {
      const target = seated()!.seats.find((s) => s.bot && !s.banker)!.seat;
      bob.send('sit', { seat: target });
      await until(() => seated()?.seat === target);
    }
    const aliceSees = () => alice.messages.filter((m) => m.type === 'seated').at(-1)?.body.seats as { displayName: string; bot: boolean }[];
    await until(() => aliceSees()?.some((s) => s.displayName === `b-${gameId}` && !s.bot));

    const before = settledAt(alice.tableId).length;
    bob.close();
    await until(() => settledAt(alice.tableId).length >= before + 2, 20_000);
    alice.close();
  });
});
