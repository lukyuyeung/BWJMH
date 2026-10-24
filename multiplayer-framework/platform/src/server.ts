/**
 * 練習伺服器的 API：只有遊戲頁會用到的那幾條，行為跟正式伺服器（apps/server/src/app.ts）一樣。
 * 牌桌用的是正式的 tables/table.ts，帳本換成記憶體版（tables/money.ts），登入換成練習玩家（players.ts）。
 * 另外多了 /v1/dev/*，給 launcher 首頁列遊戲、看餘額、重設餘額。這個檔案不要改。
 */
import { randomBytes } from 'node:crypto';
import Fastify, { type FastifyInstance, type FastifyRequest } from 'fastify';
import websocket from '@fastify/websocket';
import { loadGames, type ServerGame } from './games.js';
import { allPlayers, playerById, playerFromHeaders, resetPlayer, START_CARROTS, type PracticePlayer } from './players.js';
import * as money from './tables/money.js';
import { entryFor, isRoomId, roomsFor } from './tables/limits.js';
import { DEFAULT_TIMING, Table, type Timing } from './tables/table.js';

class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

function fail(status: number, code: string, message: string): never {
  throw new ApiError(status, code, message);
}

export async function buildPracticeApp({ gamesDir, timing = DEFAULT_TIMING }: { gamesDir: string; timing?: Timing }): Promise<FastifyInstance> {
  const games = await loadGames(gamesDir);
  const gameById = (id: unknown): ServerGame | null => (typeof id === 'string' ? (games.get(id) ?? null) : null);

  const app = Fastify({ logger: false });
  await app.register(websocket);
  const tables = new Map<string, Table>();
  const tickets = new Map<string, { userId: string; tableId: string; exp: number }>();

  app.addHook('onClose', async () => {
    for (const table of tables.values()) table.shutdown();
  });

  app.setErrorHandler((err, _req, reply) => {
    if (err instanceof ApiError) return reply.status(err.status).send({ ok: false, code: err.code, message: err.message });
    console.error(err);
    return reply.status(500).send({ ok: false, code: 'INTERNAL', message: 'Something went wrong.' });
  });

  function caller(req: FastifyRequest): PracticePlayer {
    return playerFromHeaders(req.headers) ?? fail(401, 'NO_AUTH', '請在網址加上 ?name=你的名字（例如 ?name=alice）。');
  }

  app.get('/v1/me', async (req) => {
    const player = caller(req);
    return { ok: true, userId: player.id, displayName: player.displayName, avatarUrl: '', carrots: await money.balance(player.id) };
  });

  app.get('/v1/play-session', async (req) => {
    const player = caller(req);
    return { ok: true, userId: player.id, displayName: player.displayName, avatarUrl: '', carrots: await money.balance(player.id) };
  });

  app.get('/v1/casino/games', async (req) => {
    const player = caller(req);
    const carrots = await money.balance(player.id);
    return {
      ok: true,
      carrots,
      games: [...games.values()].map((g) => ({
        gameId: g.gameId,
        title: g.rules?.title ?? g.gameId,
        seats: g.seats,
        pve: g.pve,
        rooms: roomsFor(g, carrots),
      })),
    };
  });

  app.get<{ Params: { id: string } }>('/v1/casino/games/:id/rules', async (req) => {
    const game = gameById(req.params.id) ?? fail(404, 'NOT_FOUND', 'Unknown game.');
    return { ok: true, gameId: game.gameId, ...(game.rules ?? { title: game.gameId, body: '' }) };
  });

  function seatTicket(table: Table, player: PracticePlayer) {
    const ticket = randomBytes(18).toString('base64url');
    tickets.set(ticket, { userId: player.id, tableId: table.id, exp: Date.now() + 60_000 });
    return { ok: true, tableId: table.id, ticket };
  }

  function addTable(table: Table): Table {
    tables.set(table.id, table);
    table.onClose = () => tables.delete(table.id);
    return table;
  }

  app.post('/v1/casino/tables', async (req) => {
    const player = caller(req);
    const body = (req.body ?? {}) as { gameId?: unknown; room?: unknown; solo?: unknown; options?: unknown };
    const game = gameById(body.gameId) ?? fail(404, 'NOT_FOUND', 'Unknown game.');
    const room = isRoomId(body.room) ? body.room : 'beginner';
    if ((await money.balance(player.id)) < entryFor(game, room)) fail(400, 'ROOM_LOCKED', 'Not enough carrots to enter this room.');
    const solo = body.solo === true;
    // The game's lobby choices: each one allowed, or the game's first value.
    const sent = (body.options && typeof body.options === 'object' ? body.options : {}) as Record<string, unknown>;
    const options = Object.fromEntries(
      Object.entries(game.tableOptions ?? {}).map(([key, allowed]) => {
        const value = sent[key];
        return [key, typeof value === 'string' && allowed.includes(value) ? value : allowed[0]];
      }),
    );
    const sameOptions = (t: Table) => Object.entries(options).every(([key, value]) => t.setup.options?.[key] === value);
    const same = (t: Table) =>
      t.game === game && t.setup.mode === 'casual' && t.setup.room === room && Boolean(t.setup.solo) === solo && sameOptions(t);
    // Back to your own seat if you are already at such a table; a solo table is always your own.
    const yours = [...tables.values()].find((t) => same(t) && t.hasPlayer(player.id));
    const table =
      yours ??
      (solo ? null : [...tables.values()].find((t) => same(t) && t.hasFreeSeat())) ??
      addTable(new Table(game, { mode: 'casual', room, solo, options }, timing));
    return seatTicket(table, player);
  });

  app.post('/v1/casino/ranked', async (req) => {
    const player = caller(req);
    const game = gameById((req.body as { gameId?: unknown } | null)?.gameId) ?? fail(404, 'NOT_FOUND', 'Unknown game.');
    return seatTicket(addTable(new Table(game, { mode: 'ranked', room: null }, timing)), player);
  });

  app.get<{ Params: { id: string }; Querystring: { ticket?: string } }>(
    '/v1/casino/tables/:id',
    { websocket: true },
    async (socket, req) => {
      const table = tables.get(req.params.id);
      const grant = req.query.ticket ? tickets.get(req.query.ticket) : undefined;
      const valid = grant && grant.tableId === req.params.id && grant.exp > Date.now();
      const player = valid ? playerById(grant.userId) : null;
      if (!table || !player) {
        socket.close(table ? 4401 : 4403, table ? 'EXPIRED' : 'NOT_SEATED');
        return;
      }
      const seat = table.join({ userId: player.id, displayName: player.displayName, avatarUrl: '' }, await money.balance(player.id), socket);
      if (seat === null) return;
      socket.on('message', (raw) => {
        let message: { type?: unknown; body?: unknown };
        try {
          message = JSON.parse(String(raw)) as typeof message;
        } catch {
          return;
        }
        if (typeof message.type === 'string') table.receive(player.id, message.type, (message.body ?? {}) as Record<string, unknown>);
      });
      socket.on('close', () => table.disconnect(player.id, socket));
    },
  );

  // Practice only: what the launcher page shows.
  app.get('/v1/dev/games', async () => ({
    ok: true,
    games: [...games.values()].map((g) => ({
      gameId: g.gameId,
      title: g.rules?.title ?? g.gameId,
      seats: g.seats,
      pve: g.pve,
      tableOptions: g.tableOptions ?? {},
    })),
  }));

  app.get('/v1/dev/players', async () => ({
    ok: true,
    players: await Promise.all(allPlayers().map(async (p) => ({ name: p.name, carrots: await money.balance(p.id) }))),
  }));

  app.post<{ Params: { name: string } }>('/v1/dev/players/:name/reset', async (req) => {
    if (!/^[\w-]{1,24}$/.test(req.params.name)) fail(400, 'BAD_NAME', '名字只能用英文字母、數字、- 和 _，最多 24 個字。');
    const sent = (req.body as { carrots?: unknown } | null)?.carrots;
    const carrots = typeof sent === 'number' && Number.isFinite(sent) && sent >= 0 ? sent : START_CARROTS;
    const player = resetPlayer(req.params.name, carrots);
    return { ok: true, name: player.name, carrots: await money.balance(player.id) };
  });

  return app;
}
