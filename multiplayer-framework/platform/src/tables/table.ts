/**
 * One casino table, run entirely on the server (platform draft 0.17).
 *
 * The server keeps the draw, runs the game's reduce, bot and fallback, times every turn, locks
 * each seat's liability() on the ledger as it rises, and pays result() itself. Each person gets
 * only the game's privateView for their seat. Browsers send moves; nothing they send can change
 * a payout.
 */
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import type { WebSocket } from 'ws';
import type { RoomId, RoundContext, ViewContext } from '@bunny-gala/contract';
import type { ServerGame } from '../games.js';
import * as money from './money.js';
import { entryFor, minStake, stakeCap, tableLimits } from './limits.js';

const MAX_PAYLOAD = 8 * 1024;
const RANKED_CHIPS = 10_000;

export interface Player {
  userId: string;
  displayName: string;
  avatarUrl: string;
}

export interface Timing {
  /** How long a bot "thinks", so people can follow the table. */
  botMs: number;
  /** Extra time past turnMs before the server moves for you; covers the client's animations. */
  graceMs: number;
  /** The pause after a hand at a shared table. Unset: the game's restMs, or 5 s. */
  betweenHandsMs?: number;
  /** No message (pings included) for this long counts as a disconnect. */
  heartbeatMs: number;
  /** A disconnected seat that has not come back after this long leaves the table. */
  resumeMs: number;
}

export const DEFAULT_TIMING: Timing = {
  botMs: 900,
  graceMs: 4_000,
  heartbeatMs: 15_000,
  resumeMs: 30_000,
};

export interface TableSetup {
  mode: 'casual' | 'ranked';
  room: RoomId | null;
  /** One person and the bots ("VS Bunnies"): nobody else is ever seated here. */
  solo?: boolean;
  /** The lobby choices this table was opened with (GameLogic.tableOptions), already checked. */
  options?: Record<string, string>;
}

interface Seat {
  /** PVE house banker: always a bot, never replaced, never stakes. */
  banker: boolean;
  player: Player | null;
  socket: WebSocket | null;
  lastSeen: number;
  disconnectedAt: number | null;
  /** Leaving: played by fallback until the hand ends, then the seat frees up. */
  leaving: boolean;
  /** The player's balance as last seen on the ledger. */
  carrots: number;
  /** Most this seat may stake in the current hand (a share of its balance when the hand began). */
  cap: number;
  /** Ranked Match Chips. */
  chips: number;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Draw number `k` of a hand: 16 values from 0 to 51 (a deck's worth), taken from SHA-256 of the
 * seed and k without modulo bias. Anyone holding the revealed seed can recompute every draw.
 */
export function drawFrom(seed: string, k: number): number[] {
  const values: number[] = [];
  for (let block = 0; values.length < 16; block++) {
    for (const byte of createHash('sha256').update(`${seed}:${k}:${block}`).digest()) {
      // 208 = 4 × 52: bytes above it would make low values likelier.
      if (byte < 208 && values.length < 16) values.push(byte % 52);
    }
  }
  return values;
}

export class Table {
  readonly id = randomUUID();
  private readonly createdAt = Date.now();
  private readonly seats: Seat[];
  private seq = 0;
  private state: unknown = null;
  /** The server's own context. It holds the draw, so it is never sent. */
  private ctx: RoundContext | null = null;
  private handId: string | null = null;
  /**
   * This hand's secret seed. Its hash is published as ctx.commit before any stake is locked; every
   * draw the hand needs comes from it (see drawFrom), so a slot's free spins each get their own.
   */
  private secretSeed: string | null = null;
  private drawsUsed = 0;
  private handNo = 0;
  private running = false;
  private closed = false;
  /** The server is shutting down: stop between moves and touch nothing more. */
  private stopped = false;
  /** close() has run: the registry has been told, once. */
  private ended = false;
  private options: Record<string, unknown> = {};
  /** What the last hand passed to the next (GameLogic.nextOptions). */
  private carried: Record<string, unknown> = {};
  private turn: {
    seats: number[];
    got: Map<number, unknown>;
    deadline: number;
    extended: Set<number>;
    timer: ReturnType<typeof setTimeout>;
    resolve: (got: Map<number, unknown>) => void;
  } | null = null;
  private nextHand: (() => void) | null = null;
  private readonly heartbeat: ReturnType<typeof setInterval>;
  /**
   * People watching a hand they arrived in the middle of, before they pick a seat. They see
   * the game's spectator view (privateView with seat -1): nobody's hidden cards.
   */
  private readonly watchers = new Map<string, { player: Player; socket: WebSocket; carrots: number; lastSeen: number }>();
  /** Called once nobody is left, or a ranked match is over. */
  onClose: (() => void) | null = null;

  constructor(
    readonly game: ServerGame,
    readonly setup: TableSetup,
    private readonly timing: Timing = DEFAULT_TIMING,
  ) {
    const players = setup.mode === 'ranked' ? 4 : game.seats;
    const banker = game.pve && setup.mode === 'casual';
    this.seats = [...(banker ? [this.emptySeat(true)] : []), ...Array.from({ length: players }, () => this.emptySeat(false))];
    this.heartbeat = setInterval(() => this.checkHeartbeats(), 1000);
    this.heartbeat.unref();
  }

  private emptySeat(banker: boolean): Seat {
    return { banker, player: null, socket: null, lastSeen: 0, disconnectedAt: null, leaving: false, carrots: 0, cap: 0, chips: RANKED_CHIPS };
  }

  /** People still at the table. */
  get humans(): number {
    return this.seats.filter((s) => s.player && !s.leaving).length;
  }

  /** A seat another person could take. Solo tables have none. */
  hasFreeSeat(): boolean {
    return !this.closed && !this.setup.solo && this.seats.some((s) => !s.banker && !s.player);
  }

  hasPlayer(userId: string): boolean {
    return this.watchers.has(userId) || this.seats.some((s) => s.player?.userId === userId && !s.leaving);
  }

  /**
   * Arriving mid-hand at a shared table, people watch and pick their own seat (`sit`) instead of
   * being put in the first free one. Solo tables and one-seat games seat them straight away.
   */
  private watchFirst(): boolean {
    return this.setup.mode === 'casual' && !this.setup.solo && this.game.seats > 1 && Boolean(this.game.privateView) && this.state !== null;
  }

  /**
   * Seats a player, or puts them back in their seat; or, mid-hand at a shared table, lets them watch
   * (returns -1). Closes the socket with a code if it cannot.
   */
  join(player: Player, carrots: number, socket: WebSocket): number | null {
    let seat = this.seats.findIndex((s) => s.player?.userId === player.userId);
    if (seat < 0) {
      const room = this.setup.room;
      if (this.setup.mode === 'casual' && room && carrots < entryFor(this.game, room)) {
        this.refuse(socket, 'ROOM_LOCKED', 'Not enough carrots to enter this room.');
        return null;
      }
      if (!this.closed && (this.watchers.has(player.userId) || this.watchFirst())) {
        this.watchers.get(player.userId)?.socket.close(4409, 'REPLACED');
        this.watchers.set(player.userId, { player, socket, carrots, lastSeen: Date.now() });
        this.broadcastSeats();
        this.sendWatcher(player.userId);
        return -1;
      }
      const taken = this.setup.solo && this.seats.some((s) => s.player);
      seat = this.closed || taken ? -1 : this.seats.findIndex((s) => !s.banker && !s.player);
      if (seat < 0) {
        this.refuse(socket, 'NOT_SEATED', 'This table is full.');
        return null;
      }
      this.seats[seat].player = player;
    }
    const mine = this.seats[seat];
    mine.socket?.close(4409, 'REPLACED');
    Object.assign(mine, { socket, leaving: false, disconnectedAt: null, lastSeen: Date.now(), carrots });
    this.broadcastSeats();
    if (this.state !== null) this.sendState(seat);
    if (!this.isInHand(seat)) this.send(seat, 'waiting', {});
    if (!this.running) void this.run();
    return seat;
  }

  /**
   * A watcher takes a seat (any seat a bot is playing), or a seated player who is not in the hand
   * moves to another. They are dealt in from the next hand.
   */
  private sit(userId: string, target: unknown): void {
    const watcher = this.watchers.get(userId);
    const from = this.seats.findIndex((s) => s.player?.userId === userId);
    const say = (code: string, message: string) => {
      if (watcher) this.sendTo(watcher.socket, 'error', { code, message });
      else if (from >= 0) this.error(from, code, message);
    };
    if (!watcher && (from < 0 || this.isInHand(from) || this.seats[from].leaving)) return say('NOT_NOW', 'You can change seats between hands.');
    const to = typeof target === 'number' && Number.isInteger(target) ? target : -1;
    const seat = this.seats[to];
    if (this.closed || !seat || seat.banker || seat.player) return say('SEAT_TAKEN', 'That seat is taken.');
    if (watcher) {
      this.watchers.delete(userId);
      seat.player = watcher.player;
      Object.assign(seat, { socket: watcher.socket, lastSeen: Date.now(), carrots: watcher.carrots, disconnectedAt: null, leaving: false });
    } else {
      const old = this.seats[from];
      this.seats[to] = { ...old };
      this.seats[from] = this.emptySeat(old.banker);
    }
    this.broadcastSeats();
    if (this.state !== null) this.sendState(to);
    this.send(to, 'waiting', {});
    if (!this.running) void this.run();
  }

  /** A message from a seated player's socket. */
  receive(userId: string, type: string, body: Record<string, unknown>): void {
    const watcher = this.watchers.get(userId);
    if (watcher) {
      watcher.lastSeen = Date.now();
      if (type === 'ping') this.sendTo(watcher.socket, 'pong', {});
      else if (type === 'sit') this.sit(userId, body.seat);
      else if (type === 'leave') this.unwatch(userId, 'LEFT');
      return;
    }
    const seat = this.seats.findIndex((s) => s.player?.userId === userId);
    if (seat < 0) return;
    this.seats[seat].lastSeen = Date.now();
    switch (type) {
      case 'ping':
        this.send(seat, 'pong', {});
        break;
      case 'action':
        this.onAction(seat, body.payload);
        break;
      case 'extend': {
        const turn = this.turn;
        const extra = this.game.extendMs ?? 0;
        if (!turn?.seats.includes(seat) || turn.got.has(seat) || turn.extended.has(seat) || extra <= 0) return;
        turn.extended.add(seat);
        this.armTurn(turn.deadline + extra);
        this.publish();
        break;
      }
      case 'options':
        // The next hand reads these as ctx.options. Only for one-seat games: at a shared table one
        // player must not change the game for the others.
        if (this.game.seats === 1 && body.options && typeof body.options === 'object' && JSON.stringify(body.options).length <= MAX_PAYLOAD) {
          this.options = body.options as Record<string, unknown>;
        }
        break;
      case 'next':
        this.nextHand?.();
        break;
      case 'sit':
        this.sit(userId, body.seat);
        break;
      case 'leave':
        this.leave(seat);
        break;
    }
  }

  private onAction(seat: number, sent: unknown): void {
    if (JSON.stringify(sent ?? {}).length > MAX_PAYLOAD) return this.error(seat, 'PAYLOAD_TOO_LARGE', 'That move is too large.');
    // A move that names a seat is always the sender's: nobody plays for someone else.
    const payload = sent && typeof sent === 'object' && !Array.isArray(sent) && 'seat' in sent ? { ...sent, seat } : sent;
    if (this.game.liveTurns) return this.onLiveAction(seat, payload);
    const turn = this.turn;
    if (!turn?.seats.includes(seat) || turn.got.has(seat)) return this.error(seat, 'NOT_YOUR_TURN', 'It is not your turn.');
    // A move the game ignores is refused here, so the turn stays open for a real one.
    let moved = false;
    try {
      moved = this.game.reduce(this.state, payload, this.ctx!) !== this.state;
    } catch {
      moved = false;
    }
    if (!moved) return this.error(seat, 'ILLEGAL_MOVE', 'That move is not allowed now.');
    turn.got.set(seat, payload);
    this.finishTurnIfDone();
  }

  /** Live turns (GameLogic.liveTurns): one move at a time, applied as it arrives. */
  private live: Promise<void> = Promise.resolve();

  private onLiveAction(seat: number, payload: unknown): void {
    this.live = this.live.then(async () => {
      const turn = this.turn;
      if (!turn?.seats.includes(seat) || !this.game.actors(this.state).includes(seat)) {
        return this.error(seat, 'NOT_YOUR_TURN', 'It is not your turn.');
      }
      let moved = false;
      try {
        moved = this.game.reduce(this.state, payload, this.ctx!) !== this.state;
      } catch {
        moved = false;
      }
      if (!moved) return this.error(seat, 'ILLEGAL_MOVE', 'That move is not allowed now.');
      await this.apply(seat, payload);
      if (this.turn !== turn) return;
      if (!this.game.result(this.state)) await this.step();
      this.finishLiveTurnIfDone();
    });
  }

  /** A live turn is over once none of the seats it waited for are still to move. */
  private finishLiveTurnIfDone(): void {
    const turn = this.turn;
    if (!turn) return;
    const still = this.game.actors(this.state);
    if (turn.seats.some((seat) => still.includes(seat))) return;
    clearTimeout(turn.timer);
    this.turn = null;
    turn.resolve(new Map());
  }

  /** The deadline of a live turn: fallback moves for whoever has not finished. */
  private async closeLiveTurn(turn: NonNullable<Table['turn']>): Promise<void> {
    for (let guard = 0; guard < 50 && this.turn === turn; guard++) {
      const late = turn.seats.filter((seat) => this.game.actors(this.state).includes(seat));
      if (!late.length) break;
      for (const seat of late) await this.apply(seat, this.game.fallback(this.state, seat, this.ctx!));
    }
    if (this.turn !== turn) return;
    clearTimeout(turn.timer);
    this.turn = null;
    turn.resolve(new Map());
  }

  /** The socket closed. The seat is kept for the resume window, then the player leaves. */
  disconnect(userId: string, socket: WebSocket): void {
    // Watchers hold no seat: they just go (coming back, they watch again).
    if (this.watchers.get(userId)?.socket === socket) return this.unwatch(userId, null);
    const mine = this.seats.find((s) => s.player?.userId === userId);
    if (!mine || mine.socket !== socket) return;
    mine.socket = null;
    mine.disconnectedAt = Date.now();
  }

  private unwatch(userId: string, reason: string | null): void {
    const watcher = this.watchers.get(userId);
    if (!watcher) return;
    this.watchers.delete(userId);
    if (reason) watcher.socket.close(1000, reason);
    if (!this.running && this.humans === 0 && this.watchers.size === 0) this.close();
  }

  private checkHeartbeats(): void {
    const now = Date.now();
    for (const [userId, w] of this.watchers) if (now - w.lastSeen > this.timing.heartbeatMs) this.unwatch(userId, 'HEARTBEAT');
    // Handed out but never sat at (the player never connected): nobody will come back to it.
    if (!this.running && this.humans === 0 && this.watchers.size === 0 && now - this.createdAt > this.timing.resumeMs) return this.close();
    this.seats.forEach((s, seat) => {
      if (!s.player || s.leaving) return;
      if (s.socket && now - s.lastSeen > this.timing.heartbeatMs) {
        s.socket.close(4410, 'HEARTBEAT');
        s.socket = null;
        s.disconnectedAt = now;
      }
      if (s.disconnectedAt && now - s.disconnectedAt > this.timing.resumeMs) this.leave(seat);
    });
  }

  private leave(seat: number): void {
    const mine = this.seats[seat];
    if (!mine.player || mine.leaving) return;
    mine.leaving = true;
    this.nextHand?.();
    mine.socket?.close(1000, 'LEFT');
    mine.socket = null;
    // Ranked: leaving puts you last.
    if (this.setup.mode === 'ranked') mine.chips = -1;
    if (!this.isInHand(seat)) return this.freeSeat(seat);
    const turn = this.turn;
    if (turn?.seats.includes(seat) && this.game.liveTurns) {
      // Live turn: play the leaver's fallback moves until they are done.
      this.live = this.live.then(async () => {
        for (let guard = 0; guard < 50 && this.turn === turn && this.game.actors(this.state).includes(seat); guard++) {
          await this.apply(seat, this.game.fallback(this.state, seat, this.ctx!));
        }
        if (this.turn === turn) {
          if (!this.game.result(this.state)) await this.step();
          this.finishLiveTurnIfDone();
        }
      });
    } else if (turn?.seats.includes(seat) && !turn.got.has(seat)) {
      turn.got.set(seat, this.game.fallback(this.state, seat, this.ctx!));
      this.finishTurnIfDone();
    }
  }

  private freeSeat(seat: number): void {
    const chips = this.seats[seat].chips;
    this.seats[seat] = this.emptySeat(this.seats[seat].banker);
    // In ranked, a bot takes over the seat's chips.
    if (this.setup.mode === 'ranked') this.seats[seat].chips = Math.max(0, chips);
    this.broadcastSeats();
  }

  /** True when this seat is a person dealt into the hand being played. */
  private isInHand(seat: number): boolean {
    return Boolean(this.state !== null && this.ctx && !this.ctx.seats[seat].bot);
  }

  /**
   * Stops the table for a server shutdown. A hand in progress is left open in the database and
   * refunded when the server starts again.
   */
  shutdown(): void {
    this.stopped = true;
    for (const s of this.seats) s.socket?.close(1012, 'RESTARTING');
    for (const w of this.watchers.values()) w.socket.close(1012, 'RESTARTING');
    if (this.turn) {
      clearTimeout(this.turn.timer);
      this.turn.resolve(new Map());
      this.turn = null;
    }
    this.nextHand?.();
    this.close();
  }

  private async run(): Promise<void> {
    this.running = true;
    try {
      while (this.humans > 0 && !this.closed && !this.stopped) {
        await this.playHand().catch(async (err) => {
          if (this.stopped) return;
          console.error(`[table ${this.id}] hand failed; refunding`, err);
          await this.abortHand();
        });
        if (this.stopped) break;
        this.seats.forEach((s, seat) => {
          if (s.leaving) this.freeSeat(seat);
        });
        if (this.humans === 0 || this.closed) break;
        // One player against the house reads the result and starts the next hand; shared tables keep time.
        if (this.game.seats === 1 && this.setup.mode === 'casual') await this.waitForNextHand();
        else await sleep(this.timing.betweenHandsMs ?? this.game.restMs ?? 5_000);
      }
    } finally {
      this.running = false;
      // People still watching keep the table open; it starts again when one of them sits.
      if ((this.humans === 0 && this.watchers.size === 0) || this.closed) this.close();
    }
  }

  private waitForNextHand(): Promise<void> {
    return new Promise((resolve) => {
      this.nextHand = () => {
        this.nextHand = null;
        resolve();
      };
    });
  }

  private close(): void {
    if (this.ended) return;
    this.ended = true;
    clearInterval(this.heartbeat);
    this.closed = true;
    this.onClose?.();
  }

  /** The context for a new hand: people in their seats, bots everywhere else. */
  private newContext(): RoundContext {
    const players = this.seats.filter((s) => !s.banker);
    const limits = this.setup.mode === 'casual' ? tableLimits(this.setup.room) : tableLimits(null);
    return {
      mode: this.setup.mode,
      room: this.setup.room,
      seats: this.seats.map((s, seat) => {
        const human = Boolean(s.player && !s.leaving);
        return {
          seat,
          bot: !human,
          displayName: s.banker ? 'Banker' : human ? s.player!.displayName : 'Bunny',
          avatarUrl: human ? s.player!.avatarUrl : undefined,
          vip: 0,
          stakeCap: human && this.setup.mode === 'casual' ? s.cap : undefined,
        };
      }),
      // A one-seat game plays for that seat; otherwise logic must not depend on who is watching.
      you: players.length === 1 ? this.seats.findIndex((s) => !s.banker) : -1,
      pveBanker: this.seats[0]?.banker ? 0 : null,
      chips: this.setup.mode === 'ranked' ? this.seats.map((s) => Math.max(0, s.chips)) : [],
      options: { ...this.options, ...this.carried, ...this.setup.options, tableId: this.id },
      handNo: this.handNo,
      limits,
    };
  }

  private humanSeats(): number[] {
    return this.ctx ? this.ctx.seats.filter((s) => !s.bot).map((s) => s.seat) : [];
  }

  private async playHand(): Promise<void> {
    const game = this.game;
    // Balances first: each person's stake cap for this hand comes from what they hold now.
    const limits = tableLimits(this.setup.mode === 'casual' ? this.setup.room : null);
    for (const [seat, s] of this.seats.entries()) {
      if (!s.player || s.leaving) continue;
      s.carrots = await money.balance(s.player.userId);
      s.cap = stakeCap(limits, s.carrots);
      // Too little left to play a hand here: give up the seat rather than sit out every hand.
      if (this.setup.mode === 'casual' && s.cap < minStake(game, limits)) {
        this.error(seat, 'NOT_ENOUGH_CARROTS', 'Not enough carrots left for this table.');
        this.leave(seat);
      }
    }
    if (this.humans === 0) return;
    const ctx = this.newContext();
    if (game.random === 'server') {
      this.secretSeed = randomBytes(32).toString('hex');
      this.drawsUsed = 0;
      ctx.commit = createHash('sha256').update(this.secretSeed).digest('hex');
    }
    this.handId = await money.openHand({
      tableId: this.id,
      gameId: game.gameId,
      mode: this.setup.mode,
      room: this.setup.room,
      handNo: this.handNo,
      commit: ctx.commit ?? null,
      draw: this.secretSeed ? { seed: this.secretSeed } : null,
    });
    this.ctx = ctx;
    this.state = game.create(ctx);
    // Opening stakes. Anyone who cannot cover theirs sits this hand out.
    for (const seat of this.humanSeats()) {
      const refused = await this.lock(seat, game.liability(this.state, seat, ctx));
      if (refused) {
        this.error(seat, refused.refused, refused.message);
        ctx.seats[seat].bot = true;
        this.leave(seat);
      }
    }
    if (this.humanSeats().length === 0) return this.abortHand();
    this.publish();

    for (let guard = 0; guard < 2000; guard++) {
      if (this.stopped) return;
      if (game.result(this.state)) break;
      if (game.needsDraw(this.state)) {
        ctx.draw = this.secretSeed ? drawFrom(this.secretSeed, this.drawsUsed++) : [];
        this.state = game.reduce(this.state, { type: 'draw' }, ctx);
        // A draw that ends the hand is shown once it is paid (payHand).
        if (!game.result(this.state)) await this.step();
        continue;
      }
      const actors = game.actors(this.state);
      if (actors.length === 0) break;
      // Everyone left before anything was shown: give the stakes back.
      if (this.humans === 0 && !game.dealt(this.state)) return this.abortHand();

      const bots = actors.filter((seat) => ctx.seats[seat].bot);
      if (bots.length) {
        await sleep(this.timing.botMs);
        for (const seat of bots) await this.apply(seat, game.bot?.(this.state, seat, ctx) ?? game.fallback(this.state, seat, ctx));
        // A finished hand is shown once it is paid (payHand), so the result arrives with the new balance.
        if (!game.result(this.state)) await this.step();
        continue;
      }
      const moves = await this.collect(actors);
      if (this.stopped) return;
      // Live turns applied each move as it came (onLiveAction).
      if (!game.liveTurns) for (const seat of actors) await this.apply(seat, moves.get(seat) ?? game.fallback(this.state, seat, ctx));
      if (!game.result(this.state)) await this.step();
    }
    const result = game.result(this.state);
    if (!result) return this.abortHand();
    await this.payHand(result);
  }

  /** Saves the state and shows it. */
  private async step(): Promise<void> {
    if (this.handId) await money.saveState(this.handId, this.state);
    this.publish();
  }

  /**
   * Applies one move. A person's move that would lock more carrots than they can stake is refused,
   * and they move again.
   */
  private async apply(seat: number, action: unknown): Promise<void> {
    const ctx = this.ctx!;
    const next = this.game.reduce(this.state, action, ctx);
    if (!ctx.seats[seat].bot) {
      const refused = await this.lock(seat, this.game.liability(next, seat, ctx));
      if (refused) return this.error(seat, refused.refused, refused.message);
    }
    this.state = next;
    // Another seat's move can raise someone else's stake too; take what it can.
    for (const other of this.humanSeats()) {
      if (other !== seat) await this.lock(other, this.game.liability(this.state, other, ctx));
    }
  }

  /** Locks a seat's liability on the ledger. Returns the refusal if it cannot be covered. */
  private async lock(seat: number, need: number): Promise<money.Refusal | null> {
    if (this.setup.mode === 'ranked' || need <= 0) return null;
    const s = this.seats[seat];
    if (!s.player || !this.handId) return null;
    const done = await money.lock(this.handId, this.game.gameId, s.player.userId, seat, need, s.cap);
    if ('refused' in done) return done;
    s.carrots = done.carrots;
    return null;
  }

  private async payHand(result: NonNullable<ReturnType<ServerGame['result']>>): Promise<void> {
    const ctx = this.ctx!;
    if (this.setup.mode === 'casual') {
      const payouts = result.payouts
        .filter(({ seat }) => this.seats[seat]?.player && !ctx.seats[seat].bot)
        .map(({ seat, payout }) => ({ userId: this.seats[seat].player!.userId, payout }));
      const balances = await money.settle(this.handId!, this.game.gameId, payouts, this.state, this.game.maxPayoutMultiple);
      if (this.game.nextOptions) this.carried = this.game.nextOptions(this.state, ctx.options);
      for (const s of this.seats) if (s.player && balances.has(s.player.userId)) s.carrots = balances.get(s.player.userId)!;
    } else {
      for (const { seat, left } of result.chips ?? []) if (this.seats[seat] && this.seats[seat].chips >= 0) this.seats[seat].chips = left;
      await money.settle(this.handId!, this.game.gameId, [], this.state);
    }
    this.publish();
    if (this.setup.mode === 'ranked' && this.game.matchOver(this.state, ctx)) {
      const placements = this.seats
        .map((s, seat) => ({ seat, chips: s.chips, displayName: ctx.seats[seat].displayName }))
        .sort((a, b) => b.chips - a.chips)
        .map((p, i) => ({ ...p, place: i + 1, chips: Math.max(0, p.chips) }));
      this.broadcast('matchOver', { placements });
      this.closed = true;
    }
    this.endHand();
  }

  /** Ends a hand that cannot finish: every stake goes back. */
  private async abortHand(): Promise<void> {
    if (this.handId) {
      const balances = await money.voidHand(this.handId, this.game.gameId);
      for (const seat of this.humanSeats()) {
        const s = this.seats[seat];
        if (s.player && balances.has(s.player.userId)) s.carrots = balances.get(s.player.userId)!;
        this.send(seat, 'void', { carrots: s.carrots });
      }
    }
    this.endHand();
  }

  private endHand(): void {
    if (this.turn) clearTimeout(this.turn.timer);
    this.turn = null;
    this.handNo++;
    this.state = null;
    this.ctx = null;
    this.handId = null;
    this.secretSeed = null;
  }

  /** Waits for these seats to move, or for the deadline. */
  private collect(seats: number[]): Promise<Map<number, unknown>> {
    return new Promise((resolve) => {
      this.turn = { seats, got: new Map(), deadline: 0, extended: new Set(), timer: setTimeout(() => {}, 0), resolve };
      for (const seat of seats) {
        if (this.seats[seat].leaving) this.turn.got.set(seat, this.game.fallback(this.state, seat, this.ctx!));
      }
      this.armTurn(Date.now() + this.game.turnMs + this.timing.graceMs);
      this.publish();
      if (this.game.liveTurns) {
        // Seats that are leaving play their fallback moves until they are done.
        const turn = this.turn;
        this.live = this.live.then(async () => {
          for (let guard = 0; guard < 50 && this.turn === turn; guard++) {
            const leaving = seats.filter((seat) => this.seats[seat].leaving && this.game.actors(this.state).includes(seat));
            if (!leaving.length) break;
            for (const seat of leaving) await this.apply(seat, this.game.fallback(this.state, seat, this.ctx!));
          }
          this.finishLiveTurnIfDone();
        });
      } else this.finishTurnIfDone();
    });
  }

  private armTurn(deadline: number): void {
    const turn = this.turn!;
    clearTimeout(turn.timer);
    turn.deadline = deadline;
    turn.timer = setTimeout(() => {
      if (this.game.liveTurns) {
        this.live = this.live.then(() => this.closeLiveTurn(turn));
        return;
      }
      for (const seat of turn.seats) if (!turn.got.has(seat)) turn.got.set(seat, this.game.fallback(this.state, seat, this.ctx!));
      this.finishTurnIfDone();
    }, Math.max(0, deadline - Date.now()));
  }

  private finishTurnIfDone(): void {
    const turn = this.turn;
    if (!turn || !turn.seats.every((seat) => turn.got.has(seat))) return;
    clearTimeout(turn.timer);
    this.turn = null;
    turn.resolve(turn.got);
  }

  /** Sends every person at the table their view: their own if they are in the hand, else a spectator's. */
  private publish(): void {
    this.seats.forEach((s, seat) => {
      if (s.player && !s.leaving) this.sendState(seat);
    });
    for (const userId of this.watchers.keys()) this.sendWatcher(userId);
  }

  private sendState(seat: number): void {
    const s = this.seats[seat];
    if (!s.socket || this.state === null || !this.ctx) return;
    // Seated but not dealt into this hand (they sat down during it): they watch it.
    const viewer = this.isInHand(seat) ? seat : -1;
    const { draw: _secret, ...rest } = this.ctx;
    const ctx: ViewContext = { ...rest, you: viewer };
    const waiting = this.turn?.seats.includes(seat) && !this.turn.got.has(seat);
    this.send(seat, 'state', {
      view: this.view(viewer),
      ctx,
      carrots: s.carrots,
      deadline: waiting ? new Date(this.turn!.deadline).toISOString() : null,
    });
  }

  private sendWatcher(userId: string): void {
    const w = this.watchers.get(userId);
    if (!w || this.state === null || !this.ctx) return;
    const { draw: _secret, ...rest } = this.ctx;
    this.sendTo(w.socket, 'state', { view: this.view(-1), ctx: { ...rest, you: -1 }, carrots: w.carrots, deadline: null });
  }

  /** The game's view for a seat, or for a spectator (-1). */
  private view(seat: number): unknown {
    return this.game.privateView ? this.game.privateView(this.state, seat, this.ctx!) : this.state;
  }

  private broadcastSeats(): void {
    const seats = this.seats.map((s, seat) => ({
      seat,
      bot: !s.player || s.leaving,
      banker: s.banker,
      displayName: s.banker ? 'Banker' : s.player && !s.leaving ? s.player.displayName : 'Bunny',
    }));
    this.seats.forEach((_, seat) => this.send(seat, 'seated', { seat, seats }));
    for (const w of this.watchers.values()) this.sendTo(w.socket, 'seated', { seat: -1, seats });
  }

  private broadcast(type: string, body: unknown): void {
    this.seats.forEach((_, seat) => this.send(seat, type, body));
  }

  private error(seat: number, code: string, message: string): void {
    this.send(seat, 'error', { code, message, traceId: randomUUID().slice(0, 8) });
  }

  private refuse(socket: WebSocket, code: string, message: string): void {
    socket.send(JSON.stringify({ v: 1, seq: 0, type: 'error', tableId: this.id, body: { code, message } }));
    socket.close(4403, code);
  }

  private send(seat: number, type: string, body: unknown): void {
    const socket = this.seats[seat]?.socket;
    if (socket) this.sendTo(socket, type, body);
  }

  private sendTo(socket: WebSocket, type: string, body: unknown): void {
    if (socket.readyState !== socket.OPEN) return;
    socket.send(JSON.stringify({ v: 1, seq: type === 'pong' ? 0 : ++this.seq, type, tableId: this.id, body }));
  }
}
