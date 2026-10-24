/**
 * 規則模擬：不開伺服器，讓機器人坐滿每個座位，用和牌桌引擎（tables/table.ts）一樣的方式打很多手，
 * 找出上了正式平台才會出事的寫法。npm run check 和 tests/games.test.ts 都用它。這個檔案不要改。
 */
import { isDeepStrictEqual } from 'node:util';
import type { RoomId, RoundContext } from '@bunny-gala/contract';
import type { ServerGame } from './games.js';
import { minStake, tableLimits } from './tables/limits.js';
import { drawFrom } from './tables/table.js';

export interface SimOptions {
  hands: number;
  room?: RoomId;
  /** The table's lobby choices (GameLogic.tableOptions). Unset ones take the game's first value. */
  options?: Record<string, string>;
  seed?: string;
  /**
   * Who plays the player seats: `bot` (default), or `fallback`, the way the server plays a person
   * who does not move. The banker is always the bot.
   */
  players?: 'bot' | 'fallback';
}

export interface SimReport {
  hands: number;
  /** Hands that reached a result. */
  played: number;
  /**
   * Hands bots could not open: before the deal, every move left the state as it was (for example a
   * one-seat game whose player must bet first). At a one-seat table the platform waits for the
   * person there, so that alone is not a problem; but nothing past the deal was checked.
   */
  waiting: number;
  problems: string[];
}

const MAX_PROBLEMS = 20;
const DEFAULT_MAX_PAYOUT_MULTIPLE = 41;

function deepFreeze<T>(value: T): T {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const inner of Object.values(value)) deepFreeze(inner);
  }
  return value;
}

/** Why this value would not survive being saved as JSON, or null. */
function jsonProblem(value: unknown, seen = new Set<unknown>()): string | null {
  if (value === null || value === undefined || typeof value === 'string' || typeof value === 'boolean') return null;
  if (typeof value === 'number') return Number.isFinite(value) ? null : `數字 ${value}`;
  if (typeof value !== 'object') return typeof value;
  if (seen.has(value)) return '循環參照';
  seen.add(value);
  const proto = Object.getPrototypeOf(value);
  if (!Array.isArray(value) && proto !== Object.prototype && proto !== null) return (proto?.constructor?.name as string) ?? '特殊物件';
  for (const inner of Object.values(value)) {
    const problem = jsonProblem(inner, seen);
    if (problem) return problem;
  }
  seen.delete(value);
  return null;
}

const isMutation = (err: unknown) =>
  err instanceof TypeError && /read.only|frozen|not extensible|Cannot (assign|add|delete|define)/i.test(err.message);
const message = (err: unknown) => (err instanceof Error ? err.message : String(err));

/** Thrown to stop the hand being simulated once a problem has been reported. */
class Stop extends Error {}

export function simulate(game: ServerGame, { hands, room = 'beginner', options = {}, seed = 'kit', players: playedBy = 'bot' }: SimOptions): SimReport {
  const problems: string[] = [];
  let played = 0;
  let waiting = 0;
  const say = (problem: string) => {
    if (problems.length < MAX_PROBLEMS && !problems.includes(problem)) problems.push(problem);
  };
  if (game.random === 'server' && !game.privateView) say('random 為 server 但沒有 privateView');

  const tableOptions = Object.fromEntries(
    Object.entries(game.tableOptions ?? {}).map(([key, allowed]) => [key, allowed.includes(options[key]) ? options[key] : allowed[0]]),
  );
  const banker = game.pve;
  const seatCount = game.seats + (banker ? 1 : 0);
  const players = Array.from({ length: seatCount }, (_, i) => i).filter((i) => !(banker && i === 0));
  const maxMultiple = game.maxPayoutMultiple ?? DEFAULT_MAX_PAYOUT_MULTIPLE;
  const limits = tableLimits(room);
  const entry = minStake(game, limits);
  let carried: Record<string, unknown> = {};

  const realRandom = Math.random;
  let usedRandom = false;
  Math.random = () => {
    usedRandom = true;
    throw new Error('Math.random');
  };
  try {
    for (let handNo = 0; handNo < hands && problems.length < MAX_PROBLEMS; handNo++) {
      const label = `第 ${handNo + 1} 手`;
      const ctx: RoundContext = {
        mode: 'casual',
        room,
        seats: Array.from({ length: seatCount }, (_, seat) => ({ seat, bot: true, displayName: banker && seat === 0 ? 'Banker' : 'Bunny', vip: 0 })),
        you: players.length === 1 ? players[0] : -1,
        pveBanker: banker ? 0 : null,
        chips: [],
        options: { ...carried, ...tableOptions, tableId: 'simulate' },
        handNo,
        limits,
      };
      const handSeed = `${seed}:${handNo}`;
      let draws = 0;
      /** What the table has locked for each seat: it locks after create() and after each move, never at a draw. */
      const locked = new Map<number, number>();

      /** Runs one of the game's functions, reporting what goes wrong as a problem. */
      const call = <T>(what: string, fn: () => T): T => {
        try {
          return fn();
        } catch (err) {
          if (err instanceof Stop) throw err;
          if (usedRandom) say(`${label}：用了 Math.random（亂數只能用 ctx.draw）`);
          else if (isMutation(err)) say(`${label}：${what} 改了傳入的 state（要回傳新的物件）`);
          else say(`${label}：${what} 丟出錯誤：${message(err)}`);
          throw new Stop();
        }
      };

      /** Every state is frozen as soon as it exists, so any function that writes to it is caught. */
      const accept = (state: unknown, lockNow: boolean, opening = false): unknown => {
        const json = jsonProblem(state);
        if (json) {
          say(`${label}：state 不能轉成 JSON（${json}）`);
          throw new Stop();
        }
        deepFreeze(state);
        if (game.privateView) for (const seat of [...ctx.seats.map((s) => s.seat), -1]) call('privateView', () => game.privateView!(state, seat, ctx));
        for (const seat of players) {
          const need = call('liability', () => game.liability(state, seat, ctx));
          const before = locked.get(seat) ?? 0;
          if (!Number.isInteger(need) || need < 0) {
            say(`${label}：座位 ${seat} 的 liability ${need} 不是 0 或正整數（帳本只收整數紅蘿蔔）`);
            throw new Stop();
          }
          if (need > limits.maxStake) say(`${label}：座位 ${seat} 的 liability ${need} 超過房間上限 maxStake ${limits.maxStake}（平台會拒絕這一步）`);
          if (opening && need > entry) say(`${label}：座位 ${seat} 開局要鎖 ${need}，比 minStake ${entry} 多（餘額剛好夠進房間的人會被拒絕）`);
          if (call('dealt', () => game.dealt(state)) && need < before) say(`${label}：座位 ${seat} 在 dealt() 之後 liability 從 ${before} 降到 ${need}`);
          if (lockNow) locked.set(seat, Math.max(before, need));
          else if (need > before) say(`${label}：座位 ${seat} 的 liability 在 draw 時從 ${before} 升到 ${need}（平台只在玩家動作之後鎖紅蘿蔔，這部分不會被扣）`);
        }
        return state;
      };

      try {
        let state = accept(call('create', () => game.create(ctx)), true, true);
        let finished = false;
        let stalled = false;
        for (let guard = 0; guard < 2000; guard++) {
          if (call('result', () => game.result(state))) {
            finished = true;
            break;
          }
          if (call('needsDraw', () => game.needsDraw(state))) {
            ctx.draw = game.random === 'server' ? drawFrom(handSeed, draws++) : [];
            state = accept(call('reduce', () => game.reduce(state, { type: 'draw' }, ctx)), false);
            continue;
          }
          const actors = call('actors', () => game.actors(state));
          if (actors.length === 0) {
            say(`${label}：沒有人可以動，也沒有結果`);
            throw new Stop();
          }
          const before = state;
          for (const seat of actors) {
            const useBot = game.bot && (playedBy === 'bot' || (banker && seat === 0));
            const action = call(useBot ? 'bot' : 'fallback', () => (useBot ? game.bot!(state, seat, ctx) : game.fallback(state, seat, ctx)));
            state = accept(call('reduce', () => game.reduce(state, action, ctx)), true);
          }
          if (!game.dealt(state) && isDeepStrictEqual(state, before)) {
            stalled = true;
            break;
          }
        }
        if (stalled) {
          waiting++;
          continue;
        }
        if (!finished) {
          say(`${label}：2000 步內沒有結束`);
          break;
        }

        played++;
        const result = game.result(state)!;
        let paid = 0;
        for (const { seat, payout } of result.payouts) {
          if (banker && seat === 0) continue;
          const stake = locked.get(seat) ?? 0;
          if (payout > stake * maxMultiple) say(`${label}：座位 ${seat} 派彩 ${payout} 超過押注 ${stake} × maxPayoutMultiple ${maxMultiple}`);
          paid += payout;
        }
        const totalStaked = [...locked.values()].reduce((sum, v) => sum + v, 0);
        if (!game.pve && paid !== totalStaked) say(`${label}：pve 為 false 但派彩總和 ${paid} 不等於押注總和 ${totalStaked}`);
        if (!isDeepStrictEqual(result, JSON.parse(JSON.stringify(result)))) say(`${label}：result 不能轉成 JSON`);
        if (game.nextOptions) carried = call('nextOptions', () => game.nextOptions!(state, ctx.options));
      } catch (err) {
        if (err instanceof Stop) break;
        throw err;
      }
    }
  } finally {
    Math.random = realRandom;
  }

  // At a shared table the server's bots play every empty seat, so bots that cannot open a hand stall it there too.
  if (playedBy === 'bot' && waiting > 0) {
    if (game.seats > 1) say('多人桌的空位由機器人坐，機器人卻不會開局：bot() 要能把每一手打下去');
    else if (played > 0) say(`有 ${waiting} 手機器人打不下去，但也有手打完了：bot() 不是每次都會動`);
  }
  return { hands, played, waiting, problems };
}
