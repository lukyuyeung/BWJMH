import { describe, expect, it } from 'vitest';
import type { RoomLimit } from '@bunny-gala/contract';
import { needLabel, quickRoom } from '../web/lobby/lobby.js';

const room = (id: RoomLimit['id'], allowed: boolean, entry = 10): RoomLimit => ({ id, allowed, entry, minBet: 10, maxBet: 1000, maxStake: 3000 });

describe('lobby', () => {
  const rooms = [room('beginner', true), room('intermediate', true), room('advanced', false, 2000), room('god', false, 20000)];

  it('Quick Start goes back to the last room played', () => {
    expect(quickRoom(rooms, 'intermediate')).toBe('intermediate');
  });

  it('or to the cheapest room the player can enter', () => {
    expect(quickRoom(rooms, 'god')).toBe('beginner');
    expect(quickRoom(rooms, null)).toBe('beginner');
    expect(quickRoom([room('beginner', false), room('intermediate', true)], null)).toBe('intermediate');
  });

  it('or nowhere when no room is open', () => {
    expect(quickRoom([room('beginner', false)], null)).toBeNull();
  });

  it('labels a locked room with what it takes, like Poker', () => {
    expect(needLabel(20)).toBe('需要 20');
    expect(needLabel(2000)).toBe('需要 2K');
    expect(needLabel(20000)).toBe('需要 20K');
  });
});
