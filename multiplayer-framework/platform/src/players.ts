/**
 * 練習玩家。遊戲頁網址帶 ?name=alice 時，@bunny-gala/contract/shell 的 playHeaders() 會送出
 * `Authorization: Bearer dev` 和 `x-dev-did: did:privy:dev-alice`，正式伺服器的開發模式也是這樣認人。
 * 第一次出現的名字自動建立，帶 START_CARROTS 根紅蘿蔔。這個檔案不要改。
 */
import { setBalance } from './tables/money.js';

export const START_CARROTS = 1_000_000;

export interface PracticePlayer {
  id: string;
  did: string;
  name: string;
  displayName: string;
}

const players = new Map<string, PracticePlayer>();

function header(headers: Record<string, string | string[] | undefined>, name: string): string | undefined {
  const value = headers[name];
  return Array.isArray(value) ? value[0] : value;
}

function create(name: string): PracticePlayer {
  const player = { id: `p-${name}`, did: `did:privy:dev-${name}`, name, displayName: name };
  players.set(name, player);
  setBalance(player.id, START_CARROTS);
  return player;
}

/** The practice player these request headers sign in as, or null. */
export function playerFromHeaders(headers: Record<string, string | string[] | undefined>): PracticePlayer | null {
  const auth = header(headers, 'authorization');
  if (auth !== 'Bearer dev' && auth !== 'dev') return null;
  const name = /^did:privy:dev-([\w-]{1,24})$/.exec(header(headers, 'x-dev-did') ?? '')?.[1];
  if (!name) return null;
  return players.get(name) ?? create(name);
}

export function playerById(id: string): PracticePlayer | null {
  return [...players.values()].find((p) => p.id === id) ?? null;
}

export function allPlayers(): PracticePlayer[] {
  return [...players.values()];
}

/** Sets a practice player's carrots (creating them if needed). */
export function resetPlayer(name: string, carrots = START_CARROTS): PracticePlayer {
  const player = players.get(name) ?? create(name);
  setBalance(player.id, carrots);
  return player;
}
