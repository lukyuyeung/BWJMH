/**
 * The browser side of a server-run table (apps/server, draft 0.17). The server runs the hand;
 * this sends the player's moves and passes on each view it gets back. It never sees the draw or
 * anyone else's hidden cards.
 *
 * `playGame` is the table page for a game drawn with a GameView: it signs in with the page's play
 * token, mounts the view, and sits down in the room its lobby picked. Games with their own client
 * (Hold'em) use `TableClient` directly.
 */
import type { GameModule, HostApi, RoomId, RoomLimit, SessionSnapshot, ViewContext } from './index.js';
import { onLobbyExit, playHeaders, roomFromUrl, tellParent, type AuthHeaders } from './shell.js';

export const ROOMS: readonly RoomId[] = ['beginner', 'intermediate', 'advanced', 'god'];

export interface Connection {
  /** Sign-in headers, asked for before every request. */
  auth(): Promise<AuthHeaders>;
  /** The API's origin. Default: this page's. */
  base?: string;
}

export class ApiError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/** One call to the Bunny Gala API. */
export async function callApi<T>(conn: Connection, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${conn.base ?? location.origin}${path}`, {
    method: body === undefined ? 'GET' : 'POST',
    headers: { ...(body === undefined ? {} : { 'Content-Type': 'application/json' }), ...(await conn.auth()) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = (await res.json().catch(() => ({}))) as T & { code?: string; message?: string };
  if (!res.ok) throw new ApiError(data.code ?? 'HTTP', data.message ?? `Request failed (${res.status})`, res.status);
  return data;
}

export interface SeatInfo {
  seat: number;
  bot: boolean;
  banker: boolean;
  displayName: string;
}

export interface TableEvents<V> {
  /** What this seat may see now, its carrots off the table, and its turn's deadline. */
  state?(view: V, ctx: ViewContext, carrots: number, deadline: string | null): void;
  /** Seated, waiting to be dealt in from the next hand. */
  waiting?(): void;
  /** Who sits where. `seat` is yours, or -1 while you are only watching. */
  seated?(seat: number, seats: SeatInfo[]): void;
  /** The hand was called off and every stake given back. */
  void?(carrots: number): void;
  error?(code: string, message: string): void;
  /** The table is gone for good: left, refused, or could not reconnect. */
  closed?(reason: string): void;
}

type Wire = { v: 1; seq: number; type: string; tableId: string; body: Record<string, unknown> };

/** Closed by the server on purpose; reconnecting would not help. */
const FINAL_CLOSE = new Set([1000, 4401, 4403]);

export class TableClient<V = unknown, A = unknown> {
  private socket: WebSocket | null = null;
  private tableId = '';
  private lastSeq = 0;
  private retries = 0;
  private ping: ReturnType<typeof setInterval> | undefined;
  private gone = false;
  private options: Record<string, unknown> | null = null;

  private constructor(
    readonly gameId: string,
    readonly room: RoomId,
    private readonly conn: Connection,
    private readonly events: TableEvents<V>,
    private readonly solo: boolean,
    private readonly tableOptions: Record<string, string>,
  ) {}

  /**
   * Sits down at a casual table of this game and room (your own seat, if you already have one).
   * `solo`: a table of your own with bots in every other seat. `options`: the game's lobby choices
   * (GameLogic.tableOptions); you are seated with people who chose the same.
   */
  static async sit<V, A>(
    gameId: string,
    room: RoomId,
    conn: Connection,
    events: TableEvents<V>,
    { solo = false, options = {} }: { solo?: boolean; options?: Record<string, string> } = {},
  ): Promise<TableClient<V, A>> {
    const table = new TableClient<V, A>(gameId, room, conn, events, solo, options);
    await table.connect();
    return table;
  }

  act(action: A): void {
    this.send('action', { payload: action });
  }

  /** Asks for the game's one-time extra time on this turn. */
  extend(): void {
    this.send('extend', {});
  }

  setOptions(options: Record<string, unknown>): void {
    this.options = options;
    this.send('options', { options });
  }

  /**
   * Takes a seat a bot is playing (while watching a hand you arrived during), or moves to one
   * between hands. You are dealt in from the next hand. The server answers with `seated`.
   */
  takeSeat(seat: number): void {
    this.send('sit', { seat });
  }

  /** Asks for the next hand now instead of waiting out the pause between hands. */
  next(): void {
    this.send('next', {});
  }

  /** Leaves the table. A hand in progress plays on with the game's fallback moves. */
  leave(): void {
    this.gone = true;
    this.send('leave', {});
    clearInterval(this.ping);
    this.socket?.close(1000);
  }

  /** Asks for a seat and a fresh ticket (tickets last a minute), then opens the socket. */
  private async connect(): Promise<void> {
    const { tableId, ticket } = await callApi<{ tableId: string; ticket: string }>(this.conn, '/v1/casino/tables', {
      gameId: this.gameId,
      room: this.room,
      ...(this.solo ? { solo: true } : {}),
      ...(Object.keys(this.tableOptions).length ? { options: this.tableOptions } : {}),
    });
    const origin = (this.conn.base ?? location.origin).replace(/^http/, 'ws');
    const socket = new WebSocket(`${origin}/v1/casino/tables/${tableId}?ticket=${encodeURIComponent(ticket)}`);
    this.socket = socket;
    if (tableId !== this.tableId) this.lastSeq = 0;
    this.tableId = tableId;
    socket.onmessage = (event) => this.onWire(JSON.parse(String(event.data)) as Wire);
    socket.onclose = (event) => {
      clearInterval(this.ping);
      if (this.gone || socket !== this.socket) return;
      if (FINAL_CLOSE.has(event.code)) {
        this.gone = true;
        this.events.closed?.(event.reason || 'CLOSED');
        return;
      }
      // Dropped: back to the same seat, which the server holds for 30 seconds.
      if (this.retries++ < 10) setTimeout(() => void this.connect().catch(() => undefined), 1000 * Math.min(this.retries, 3));
      else {
        this.gone = true;
        this.events.closed?.('RESUME_FAILED');
      }
    };
    await new Promise<void>((resolve, reject) => {
      socket.onopen = () => {
        this.retries = 0;
        if (this.options) this.send('options', { options: this.options });
        resolve();
      };
      socket.onerror = () => reject(new Error('Could not reach the table.'));
    });
    clearInterval(this.ping);
    this.ping = setInterval(() => this.send('ping', {}), 5000);
  }

  private send(type: string, body: unknown): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ v: 1, seq: 0, type, tableId: this.tableId, body }));
    }
  }

  private onWire(message: Wire): void {
    if (message.seq > 0) {
      if (message.seq <= this.lastSeq) return;
      this.lastSeq = message.seq;
    }
    const body = message.body;
    switch (message.type) {
      case 'state':
        this.events.state?.(body.view as V, body.ctx as ViewContext, Number(body.carrots), (body.deadline as string | null) ?? null);
        break;
      case 'waiting':
        this.events.waiting?.();
        break;
      case 'seated':
        this.events.seated?.(Number(body.seat), body.seats as SeatInfo[]);
        break;
      case 'void':
        this.events.void?.(Number(body.carrots));
        break;
      case 'error':
        this.events.error?.(String(body.code), String(body.message ?? body.code));
        break;
    }
  }
}

/** GET /v1/me, in the old gateway's shape. */
interface Me {
  displayName: string;
  avatarUrl: string;
  carrots: number;
}
interface Catalog {
  carrots: number;
  games: { gameId: string; rooms: RoomLimit[] }[];
}

/** Signs in with the page's play token (or `?name=` in development). */
export const playConnection: Connection = { auth: async () => playHeaders() };

/** The game's lobby choices from the table page's URL (`?variant=ace`), as the lobby passed them. */
function optionsFromUrl(allowed: Record<string, readonly string[]> = {}): Record<string, string> {
  const params = new URLSearchParams(location.search);
  const picked: Record<string, string> = {};
  for (const [key, values] of Object.entries(allowed)) {
    const value = params.get(key);
    if (value && values.includes(value)) picked[key] = value;
  }
  return picked;
}

/**
 * The table page for a game drawn with a GameView, opened by its lobby with `?room=`.
 * Mounts the view in `el` and sits down in that room. `autoStart: false` is for a view that
 * has its own room picker: it sits down by calling host.startCasual(room) itself.
 */
export async function playGame<S, A, V>(
  game: GameModule<S, A, V>,
  el: HTMLElement,
  conn: Connection = playConnection,
  { autoStart = true }: { autoStart?: boolean } = {},
): Promise<void> {
  const fail = (code: string, message: string) => tellParent({ type: 'carrot-error', code, message });
  let me: Me;
  let catalog: Catalog;
  try {
    [me, catalog] = await Promise.all([callApi<Me>(conn, '/v1/me'), callApi<Catalog>(conn, '/v1/casino/games')]);
  } catch (err) {
    fail(err instanceof ApiError ? err.code : 'OFFLINE', err instanceof Error ? err.message : String(err));
    return;
  }
  const session: SessionSnapshot = {
    sandbox: false,
    carrots: me.carrots,
    rooms: catalog.games.find((g) => g.gameId === game.gameId)?.rooms ?? [],
    player: { displayName: me.displayName, avatarUrl: me.avatarUrl, vip: 0 },
  };
  const setCarrots = (carrots: number) => {
    if (!Number.isFinite(carrots) || carrots === session.carrots) return;
    session.carrots = carrots;
    tellParent({ type: 'carrot-carrots', carrots });
  };

  let table: TableClient<V, A> | null = null;
  let opening = false;
  const host: HostApi<A> = {
    session: () => ({ ...session, rooms: [...session.rooms] }),
    ready: () => tellParent({ type: 'carrot-ready' }),
    startCasual: (room) => {
      // Already seated in this room: this asks for the next hand. Another room: leave this table first.
      if (table && table.room === room) return table.next();
      if (table) {
        table.leave();
        table = null;
      }
      if (opening) return;
      opening = true;
      TableClient.sit<V, A>(game.gameId, room, conn, {
        state: (view, ctx, carrots, deadline) => {
          setCarrots(carrots);
          game.view.render(view, ctx);
          game.view.deadline?.(deadline);
        },
        void: setCarrots,
        error: fail,
        closed: (reason) => {
          table = null;
          if (reason !== 'CLOSED') fail(reason, reason === 'RESUME_FAILED' ? 'Lost the connection to the table.' : 'You left the table.');
        },
      }, { options: optionsFromUrl(game.tableOptions) })
        .then((opened) => (table = opened))
        .catch((err) => fail(err instanceof ApiError ? err.code : 'OFFLINE', err instanceof Error ? err.message : String(err)))
        .finally(() => (opening = false));
    },
    startRanked: () => fail('NOT_OPEN', 'Ranked play is not open yet.'),
    act: (action) => table?.act(action),
    extend: () => table?.extend(),
    setOptions: (options) => table?.setOptions(options),
    takeSeat: (seat) => table?.takeSeat(seat),
    // Achievements are not wired to rewards yet.
    fact: () => undefined,
  };

  onLobbyExit(() => {
    table?.leave();
    table = null;
    game.view.destroy?.();
  });
  window.addEventListener('pagehide', () => table?.leave());
  game.view.mount(el, host);
  if (autoStart) host.startCasual(roomFromUrl(ROOMS, 'beginner'));
}
