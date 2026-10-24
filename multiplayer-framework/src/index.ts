/**
 * What an outsourced Bunny Gala game implements.
 * The platform host calls this. Game code does not open sockets or move carrots.
 * Platform draft 0.17.
 *
 * Changes from 0.16 (see CHANGES-0.17.md):
 * - The host runs on the server. It keeps the draw, runs reduce, bot and fallback, times every
 *   turn, and works out stakes and payouts from liability() and result() itself.
 * - A game is two parts: GameLogic, which the server imports, and GameView, which the browser
 *   draws. The view receives privateView(state, seat), never the whole state or the draw.
 */

export type RoomId = "beginner" | "intermediate" | "advanced" | "god";

export interface SeatView {
  seat: number;
  bot: boolean;
  displayName: string;
  avatarUrl?: string;
  vip: number;
  title?: string;
  /**
   * Casual play, people only: the most this seat may lock in this hand
   * (the room's maxStake, or the player's whole balance if that is less).
   */
  stakeCap?: number;
}

/**
 * A table's limits, all set by the platform from the room's unit (see LIMITS.md). Games describe
 * their bets in these terms instead of keeping their own tables, so every game in a room scales
 * together when the room's unit changes.
 */
export interface TableLimits {
  /** The room's base stake. Everything below is a multiple of it. */
  unit: number;
  /** Smallest single bet. */
  minBet: number;
  /** Largest single bet. */
  maxBet: number;
  /** Most one seat may lock in one hand, all bets together. */
  maxStake: number;
}

export interface RoomLimit {
  id: RoomId;
  minBet: number;
  maxBet: number;
  /** Most one seat may lock in one hand. */
  maxStake: number;
  entry: number;
  allowed: boolean;
}

/** Shown to the view. Other players' carrot balances are not included. */
export interface SessionSnapshot {
  sandbox: boolean;
  carrots: number;
  rooms: RoomLimit[];
  player: {
    displayName: string;
    avatarUrl?: string;
    vip: number;
    title?: string;
  };
}

export interface RoundContext {
  mode: "casual" | "ranked";
  room: RoomId | null;
  seats: SeatView[];
  /** The seat this context is for. On the server, -1: logic must not depend on who is watching. */
  you: number;
  /**
   * PVE house banker. Always a bot, never replaced, never reserves carrots.
   * Null in casual PVP and in ranked matches, where a human may bank.
   */
  pveBanker: number | null;
  /** Ranked match chips left, by seat. Empty in casual play. */
  chips: number[];
  options: Record<string, unknown>;
  /** Hash published before this hand's bets are locked. */
  commit?: string;
  /** Filled only after the platform reveals the draw. Server only: it never reaches a browser. */
  draw?: number[];
  /** Hands already played at this table, from 0, so games can rotate the button or banker. */
  handNo: number;
  /** The room's limits. In ranked play there are no carrots, and these are zero. */
  limits: TableLimits;
}

/** What the view gets: the round context without the draw. */
export type ViewContext = Omit<RoundContext, "draw">;

export interface HandResult {
  /** Casual payout, including stake returned. Omit the PVE banker; the house pays from the platform ledger. */
  payouts: { seat: number; payout: number }[];
  /** Ranked chips left after this hand. */
  chips?: { seat: number; left: number }[];
  result: unknown;
}

export interface HostApi<A> {
  session(): SessionSnapshot;
  /** Call once, after the table art can be shown. */
  ready(): void;
  startCasual(room: RoomId): void;
  startRanked(ladder: "free" | "special"): void;
  act(action: A): void;
  /** Ask for GameLogic.extendMs more on your current turn. Once per turn. */
  extend(): void;
  setOptions(options: Record<string, unknown>): void;
  /**
   * While watching a hand you arrived during (ctx.you is -1): take this seat, which a bot is
   * playing. You are dealt in from the next hand.
   */
  takeSeat?(seat: number): void;
  /** Achievement facts. The platform decides the reward. */
  fact(name: string, payload?: unknown): void;
}

export interface GameView<V, A> {
  mount(el: HTMLElement, host: HostApi<A>): void;
  /** Draws what this seat may see: GameLogic.privateView of the latest state. */
  render(view: V, ctx: ViewContext): void;
  /** Platform UTC deadline, or null when nobody is on the clock. */
  deadline?(at: string | null): void;
  /**
   * Milliseconds of deal or play animation still on screen. The server's turn clock already
   * allows a few seconds for animation; a view may still report these for its own timing.
   */
  dealHold?(): number;
  motionHold?(): number;
  destroy?(): void;
}

/** The rules. The server imports this part, so it must not touch the DOM. */
export interface GameLogic<S = unknown, A = unknown, V = S> {
  gameId: string;
  /**
   * True for Cards, Tables, and Machines.
   * Host sets `ctx.pveBanker` and seats that bot before the hand.
   * Main Room games leave this false. The host sets `ctx.pveBanker` only when that table is running as PVE.
   */
  pve: boolean;
  /**
   * Player seats, not counting the PVE banker.
   * 1: one human against the banker bot.
   * 2 or more: humans share a table. Ranked matches put 4 players in `ctx.seats`.
   * Horse racing is not a GameModule.
   */
  seats: number;
  /**
   * `server`: the platform commits a seed before bets lock, then reveals `ctx.draw` to the logic only.
   * Logic must not call Math.random.
   * `none`: no hidden randomness.
   */
  random: "server" | "none";
  /** Turn length. Shared by every seat in a simultaneous bet. The server enforces it. */
  turnMs: number;
  /** Extra time a seat may ask for once per turn (HostApi.extend). 0 or absent: none. */
  extendMs?: number;
  create(ctx: RoundContext): S;
  reduce(state: S, action: A, ctx: RoundContext): S;
  /**
   * Seats that may act now.
   * Empty while waiting. One seat is a turn. Two or more bet together until the deadline.
   */
  actors(state: S): number[];
  /** True once cards, dice, or a result are visible. The host will not void after this. */
  dealt(state: S): boolean;
  /** True when logic is waiting for `ctx.draw`. */
  needsDraw(state: S): boolean;
  /** Non-null when this hand is over. A ranked match may continue. */
  result(state: S): HandResult | null;
  /**
   * Ranked only. True when the match should be placed.
   * A single hand ending is not enough: banker rotation and sit-outs continue until this is true.
   */
  matchOver(state: S, ctx: RoundContext): boolean;
  /** Required for the PVE banker and for any other bot seat. Runs on the server. */
  bot?(state: S, seat: number, ctx: RoundContext): A;
  /** Used when a seat's time runs out or it leaves. Simultaneous bets use a no-further-bet action. */
  fallback(state: S, seat: number, ctx: RoundContext): A;
  /**
   * Carrots that must be locked for this seat right now.
   * The host reserves any increase. After `dealt()`, the number may stay or rise, not fall.
   * Opening bets, raises, doubles, splits, and odds bets all go through here.
   * Ranked play returns 0. The PVE banker seat also returns 0.
   */
  liability(state: S, seat: number, ctx: RoundContext): number;
  /**
   * What one seat may see: its own cards, and everyone else's only once they are shown.
   * The server sends each seat only this. Required when `random` is `server`; without it the
   * host sends the whole state, which is only safe for games with nothing hidden.
   * `seat` is -1 for a spectator (someone who arrived mid-hand, or sat down during it): show
   * nobody's hidden cards. Their ctx.you is -1 too.
   */
  privateView?(state: S, seat: number, ctx: RoundContext): V;
  /** Rules panel text. */
  rules?: { title: string; body: string };
  /**
   * The biggest payout one hand can make, as a multiple of what the seat staked (stake included).
   * The platform treats anything above it as a bug in the game and caps it. Default: 41.
   */
  maxPayoutMultiple?: number;
  /**
   * The least a seat must be able to lock to play one hand at these limits (for example an
   * opening bet, or a minimum buy-in). The platform only lets players into rooms where they can
   * cover it. Default: one minBet.
   */
  minStake?(limits: TableLimits): number;
  /**
   * Choices a player makes in the lobby that shape the whole table, with the values allowed, for
   * example `{ variant: ['classic', 'ace'] }`. The table page reads them from its URL; the server
   * seats people only with others who chose the same, and the game reads them as ctx.options.
   * Players cannot change them at the table. Games with more than one seat ignore setOptions.
   */
  tableOptions?: Record<string, readonly string[]>;
  /**
   * What carries over to the next hand at this table (for example levels reached), merged into
   * ctx.options. Called once a hand is paid.
   */
  nextOptions?(state: S, options: Record<string, unknown>): Record<string, unknown>;
  /**
   * How long a shared table shows the result before dealing the next hand, in ms. Default 5000.
   * A player can ask for the next hand sooner (HostApi.startCasual while seated).
   */
  restMs?: number;
  /**
   * Moves take effect the moment they arrive, and a seat may move again and again in one turn
   * (for example dropping several chips, then "ready"). The turn ends once actors() lists none of
   * the people it was waiting for, or at the deadline, when the game's fallback moves are played
   * for whoever is still listed. Without it, each seat sends one move per turn and the moves are
   * applied together once everyone has moved.
   */
  liveTurns?: boolean;
}

/** A whole game: the logic, plus the view the browser mounts. */
export interface GameModule<S = unknown, A = unknown, V = S> extends GameLogic<S, A, V> {
  view: GameView<V, A>;
}
