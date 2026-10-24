/**
 * 練習用的紅蘿蔔帳本，全部放在記憶體裡，伺服器重啟就歸零。
 *
 * 和正式伺服器的 money.ts（PostgreSQL 帳本）匯出一樣的函式、一樣的規則：只鎖還沒鎖的差額、
 * 超過房間上限或餘額就拒絕、派彩依 maxPayoutMultiple 封頂、一手只結算一次、作廢就退回本金。
 * 正式帳本會失敗的地方這裡也失敗：紅蘿蔔不是整數（LEDGER_ZERO）、state 不能存成 JSON。
 * 牌桌引擎遇到這些錯誤會作廢這一手、退回押注，跟正式環境一樣。
 * table.ts 不用改一個字就能用它。這個檔案不要改。
 */

/** A payout above this many times the stake is treated as a bug in the game and capped. */
export const DEFAULT_MAX_PAYOUT_MULTIPLE = 41;

export interface HandOpening {
  tableId: string;
  gameId: string;
  mode: 'casual' | 'ranked';
  room: string | null;
  handNo: number;
  commit: string | null;
  /** What the commit hides: the hand's seed. Kept for audit; never sent to a player. */
  draw: unknown;
}

export type Refusal = { refused: 'INSUFFICIENT' | 'LIMIT'; message: string };

export interface HandRecord {
  id: string;
  opening: HandOpening;
  status: 'open' | 'settled' | 'void';
  stakes: Map<string, { seat: number; staked: number; paid: number }>;
  state: unknown;
}

const balances = new Map<string, number>();
const hands = new Map<string, HandRecord>();
let nextHand = 1;

export function setBalance(userId: string, carrots: number): void {
  balances.set(userId, Math.max(0, Math.floor(carrots)));
}

/** Every hand since the server started, oldest first (for tests and the check script). */
export function handRecords(): HandRecord[] {
  return [...hands.values()];
}

/** Forgets every balance and hand (tests only). */
export function resetLedger(): void {
  balances.clear();
  hands.clear();
  nextHand = 1;
}

/** Production writes every move as a ledger entry, which must be a whole number. */
function ledgerAmount(delta: number): number {
  if (!Number.isInteger(delta) || delta === 0) throw new Error('LEDGER_ZERO: Ledger delta must be a non-zero whole number');
  return delta;
}

function openHandRecord(handId: string): HandRecord | null {
  const hand = hands.get(handId);
  return hand && hand.status === 'open' ? hand : null;
}

export async function openHand(h: HandOpening): Promise<string> {
  // Production stores the draw as JSON.
  if (h.draw !== null) JSON.stringify(h.draw);
  const id = `hand-${nextHand++}`;
  hands.set(id, { id, opening: h, status: 'open', stakes: new Map(), state: null });
  return id;
}

/**
 * Locks `need` carrots in total for this player in this hand, taking only what is not locked yet.
 * Refuses if it would pass `cap` (the room's limit for one hand) or their balance.
 */
export async function lock(
  handId: string,
  _gameId: string,
  userId: string,
  seat: number,
  need: number,
  cap: number,
): Promise<{ carrots: number } | Refusal> {
  const hand = hands.get(handId);
  if (!hand) throw new Error(`Unknown hand ${handId}`);
  const stake = hand.stakes.get(userId) ?? { seat, staked: 0, paid: 0 };
  hand.stakes.set(userId, stake);
  const carrots = balances.get(userId) ?? 0;
  if (need <= stake.staked) return { carrots };
  if (need > cap) return { refused: 'LIMIT', message: "That stake is over this room's limit for one hand." };
  const more = ledgerAmount(need - stake.staked);
  if (more > carrots) return { refused: 'INSUFFICIENT', message: 'Not enough carrots.' };
  balances.set(userId, carrots - more);
  stake.staked = need;
  return { carrots: carrots - more };
}

/** Pays a finished hand. Players with no payout lose what they staked. Returns everyone's new balance. */
export async function settle(
  handId: string,
  gameId: string,
  payouts: { userId: string; payout: number }[],
  state: unknown,
  maxMultiple = DEFAULT_MAX_PAYOUT_MULTIPLE,
): Promise<Map<string, number>> {
  const hand = openHandRecord(handId);
  const result = new Map<string, number>();
  if (!hand) return result;
  // Production saves the final state in the same transaction: if it is not JSON, nothing is paid.
  JSON.stringify(state);
  const paid = new Map<string, number>();
  for (const [userId, stake] of hand.stakes) {
    const owed = payouts.filter((p) => p.userId === userId).reduce((sum, p) => sum + p.payout, 0);
    const cap = stake.staked * maxMultiple;
    if (owed > cap) console.error(`[hand ${handId}] ${gameId} paid ${owed} on a ${stake.staked} stake; capped`);
    const amount = Math.max(0, Math.min(Math.floor(owed), cap));
    if (!Number.isFinite(amount)) throw new Error(`[hand ${handId}] ${gameId} paid ${owed}: not a number`);
    if (amount > 0) ledgerAmount(amount);
    paid.set(userId, amount);
  }
  for (const [userId, stake] of hand.stakes) {
    stake.paid = paid.get(userId)!;
    balances.set(userId, (balances.get(userId) ?? 0) + stake.paid);
    result.set(userId, balances.get(userId)!);
  }
  hand.status = 'settled';
  hand.state = state;
  return result;
}

/** Gives back every stake of a hand that did not finish. Safe to call twice. */
export async function voidHand(handId: string, _gameId: string): Promise<Map<string, number>> {
  const hand = openHandRecord(handId);
  const result = new Map<string, number>();
  if (!hand) return result;
  for (const [userId, stake] of hand.stakes) {
    balances.set(userId, (balances.get(userId) ?? 0) + stake.staked);
    result.set(userId, balances.get(userId)!);
  }
  hand.status = 'void';
  return result;
}

/** Keeps the hand's latest state. */
export async function saveState(handId: string, state: unknown): Promise<void> {
  const hand = hands.get(handId);
  // Production saves it as JSON: a state that cannot be saved fails the hand there too.
  JSON.stringify(state);
  if (hand) hand.state = state;
}

/** Gives back the stakes of every hand still open. */
export async function refundUnfinishedHands(): Promise<number> {
  const open = handRecords().filter((h) => h.status === 'open');
  for (const h of open) await voidHand(h.id, h.opening.gameId);
  return open.length;
}

export async function balance(userId: string): Promise<number> {
  return balances.get(userId) ?? 0;
}
