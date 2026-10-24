/**
 * Every carrot limit at every table, in one place (LIMITS.md).
 *
 * Each room has one number, its unit. The platform's rules turn it into the table's limits, and
 * games describe their bets in those terms. Change a room's unit and every game in it scales.
 * The numbers here are placeholders until all the games are in and the economy is set.
 */
import type { RoomId, RoomLimit, TableLimits } from '@bunny-gala/contract';
import type { ServerGame } from '../games.js';

/** The rooms, cheapest first, and the base stake of each. */
export const ROOM_UNITS: Readonly<Record<RoomId, number>> = {
  beginner: 10,
  intermediate: 100,
  advanced: 1_000,
  god: 10_000,
};

/** How the unit becomes limits, the same for every room and every game. */
export const RULES = {
  /** Smallest single bet, in units. */
  minBetUnits: 1,
  /** Largest single bet, in units. */
  maxBetUnits: 100,
  /** Most one seat may lock in one hand, in units. */
  maxStakeUnits: 300,
} as const;

const ROOM_IDS = Object.keys(ROOM_UNITS) as RoomId[];

export function isRoomId(value: unknown): value is RoomId {
  return ROOM_IDS.includes(value as RoomId);
}

export function tableLimits(room: RoomId | null): TableLimits {
  if (!room) return { unit: 0, minBet: 0, maxBet: 0, maxStake: 0 };
  const unit = ROOM_UNITS[room];
  return { unit, minBet: unit * RULES.minBetUnits, maxBet: unit * RULES.maxBetUnits, maxStake: unit * RULES.maxStakeUnits };
}

/** The most a player with this balance may lock in one hand at these limits. */
export function stakeCap(limits: TableLimits, balance: number): number {
  return Math.min(limits.maxStake, Math.max(0, Math.floor(balance)));
}

/** The least a seat must be able to lock to play this game at these limits. */
export function minStake(game: ServerGame, limits: TableLimits): number {
  return game.minStake ? game.minStake(limits) : limits.minBet;
}

/** The balance needed to sit at this game in this room: enough to cover its minimum for one hand. */
export function entryFor(game: ServerGame, room: RoomId): number {
  return minStake(game, tableLimits(room));
}

/** The rooms as a player sees them for one game: its limits, what it takes to enter, and whether they can. */
export function roomsFor(game: ServerGame, balance: number): RoomLimit[] {
  return ROOM_IDS.map((id) => {
    const limits = tableLimits(id);
    const entry = entryFor(game, id);
    return { id, minBet: limits.minBet, maxBet: limits.maxBet, maxStake: limits.maxStake, entry, allowed: balance >= entry };
  });
}
