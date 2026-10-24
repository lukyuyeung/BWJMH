/** 測試用的工具：開一台練習伺服器、用練習玩家呼叫 API、坐上牌桌收訊息。 */
import { fileURLToPath } from 'node:url';
import WebSocket from 'ws';
import type { Timing } from '../platform/src/tables/table.js';
import { buildPracticeApp } from '../platform/src/server.js';
import type { ServerGame } from '../platform/src/games.js';
import { simulate } from '../platform/src/simulate.js';
import { balance, handRecords } from '../platform/src/tables/money.js';
import { expect } from 'vitest';

export const GAMES_DIR = fileURLToPath(new URL('../games', import.meta.url));

/** Quick bots and hands; a turn times out about 300 ms after it starts. */
export const FAST: Timing = { botMs: 2, graceMs: 300 - 30_000, betweenHandsMs: 10, heartbeatMs: 15_000, resumeMs: 400 };

export async function startKit(timing: Timing = FAST, gamesDir = GAMES_DIR): Promise<{ base: string; close: () => Promise<void> }> {
  const app = await buildPracticeApp({ gamesDir, timing });
  const base = await app.listen({ port: 0, host: '127.0.0.1' });
  return { base, close: () => app.close() };
}

export async function call(base: string, path: string, name: string | null, body?: unknown) {
  const res = await fetch(base + path, {
    method: body === undefined ? 'GET' : 'POST',
    headers: {
      ...(body === undefined ? {} : { 'content-type': 'application/json' }),
      ...(name ? { authorization: 'Bearer dev', 'x-dev-did': `did:privy:dev-${name}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return { status: res.status, body: (await res.json()) as Record<string, any> };
}

export type Msg = { seq: number; type: string; body: Record<string, any> };

/** One player's socket at a table, keeping every message it gets. */
export class Seat {
  messages: Msg[] = [];
  socket!: WebSocket;
  tableId = '';

  static async sit(
    base: string,
    name: string,
    gameId: string,
    { room = 'beginner', solo = false, options }: { room?: string; solo?: boolean; options?: Record<string, string> } = {},
  ): Promise<Seat> {
    const s = new Seat();
    const opened = await call(base, '/v1/casino/tables', name, { gameId, room, solo, ...(options ? { options } : {}) });
    if (opened.status !== 200) throw new Error(`${opened.status} ${JSON.stringify(opened.body)}`);
    s.tableId = opened.body.tableId;
    s.socket = new WebSocket(`${base.replace('http', 'ws')}/v1/casino/tables/${s.tableId}?ticket=${opened.body.ticket}`);
    s.socket.on('message', (d) => s.messages.push(JSON.parse(String(d)) as Msg));
    await new Promise((r) => s.socket.once('open', r));
    return s;
  }

  get states() {
    return this.messages.filter((m) => m.type === 'state').map((m) => m.body);
  }
  get last() {
    return this.states.at(-1);
  }
  send(type: string, body: unknown = {}) {
    this.socket.send(JSON.stringify({ v: 1, seq: 0, type, tableId: this.tableId, body }));
  }
  act(payload: unknown) {
    this.send('action', { payload });
  }
  close() {
    this.socket.close();
  }
}

export async function until(check: () => boolean, ms = 15_000): Promise<void> {
  const end = Date.now() + ms;
  while (!check()) {
    if (Date.now() > end) throw new Error('timed out waiting');
    await new Promise((r) => setTimeout(r, 5));
  }
}

const settledAt = (tableId: string) => handRecords().filter((h) => h.opening.tableId === tableId && h.status === 'settled');

/**
 * A person sits at their own table and never moves: the server plays them with fallback.
 * Checks the draw never reaches them and their balance matches the ledger.
 */
export async function expectIdlePlay(base: string, game: ServerGame, name: string): Promise<void> {
  const seat = await Seat.sit(base, name, game.gameId, { solo: true });
  // On the server an idle person is played by fallback (bots only fill empty seats).
  if (simulate(game, { hands: 5, players: 'fallback' }).played > 0) {
    // A one-seat table waits for the player to ask for the next hand, as its page does.
    for (let hands = 1; hands <= 3; hands++) {
      await until(() => settledAt(seat.tableId).length >= hands, 20_000);
      if (game.seats === 1) seat.send('next');
    }
  } else {
    // The fallback cannot open a hand here (a person must bet first): sit, look, leave; the hand is called off.
    await until(() => seat.states.length > 0);
  }
  seat.close();
  await until(() => handRecords().every((h) => h.opening.tableId !== seat.tableId || h.status !== 'open'), 20_000);

  // The server strips the draw from every ctx it sends; a view may still have its own field called draw.
  expect(seat.messages.filter((m: Msg) => m.body.ctx && 'draw' in m.body.ctx)).toEqual([]);
  const sent = JSON.stringify(seat.messages);
  for (const h of handRecords().filter((r) => r.opening.tableId === seat.tableId)) {
    const secret = (h.opening.draw as { seed?: string } | null)?.seed;
    if (secret) expect(sent).not.toContain(secret);
  }

  const moved = settledAt(seat.tableId).reduce((sum, h) => {
    const s = h.stakes.get(`p-${name}`);
    return sum + (s ? s.paid - s.staked : 0);
  }, 0);
  expect(await balance(`p-${name}`)).toBe(1_000_000 + moved);
}
