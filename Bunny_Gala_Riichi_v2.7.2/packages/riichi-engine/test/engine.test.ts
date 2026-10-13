import { describe, expect, it } from 'vitest';
import { createStandardWall, dealInitialHands, shuffleTiles } from '../src/index.js';

describe('standard wall', () => {
  it('contains exactly 136 physical tiles', () => {
    expect(createStandardWall()).toHaveLength(136);
  });

  it('contains exactly four copies of every face', () => {
    const counts = new Map<string, number>();
    for (const tile of createStandardWall()) counts.set(tile.face, (counts.get(tile.face) ?? 0) + 1);
    expect(counts.size).toBe(34);
    for (const count of counts.values()) expect(count).toBe(4);
  });

  it('gives every physical tile a unique id', () => {
    const wall = createStandardWall();
    expect(new Set(wall.map((tile) => tile.id)).size).toBe(136);
  });

  it('contains exactly three standard aka-dora red fives', () => {
    expect(createStandardWall().filter((tile) => tile.red)).toHaveLength(3);
    expect(createStandardWall().filter((tile) => tile.red).map(t=>t.face).sort()).toEqual(['5m','5p','5s']);
  });
});

describe('shuffle', () => {
  it('does not mutate or lose tiles', () => {
    const wall = createStandardWall();
    const before = wall.map((t) => t.id);
    let n = 0;
    const deterministic = (max: number) => (n++ * 17 + 3) % max;
    const shuffled = shuffleTiles(wall, deterministic);
    expect(wall.map((t) => t.id)).toEqual(before);
    expect(new Set(shuffled.map((t) => t.id))).toEqual(new Set(before));
    expect(shuffled).toHaveLength(136);
  });
});

describe('initial deal', () => {
  it('deals 14 to East, 13 to others, leaving 69 live-wall tiles plus a 14-tile dead wall', () => {
    const result = dealInitialHands(createStandardWall());
    expect(result.hands.east).toHaveLength(14);
    expect(result.hands.south).toHaveLength(13);
    expect(result.hands.west).toHaveLength(13);
    expect(result.hands.north).toHaveLength(13);
    expect(result.liveWall).toHaveLength(69);
    expect(result.deadWall.tiles).toHaveLength(14);
    expect(result.deadWall.rinshan).toHaveLength(4);
    expect(result.deadWall.doraIndicators).toHaveLength(5);
    expect(result.deadWall.revealedDoraCount).toBe(1);
  });

  it('does not duplicate or lose any physical tile', () => {
    const result = dealInitialHands(createStandardWall());
    const all = [...result.hands.east, ...result.hands.south, ...result.hands.west, ...result.hands.north, ...result.liveWall, ...result.deadWall.tiles];
    expect(all).toHaveLength(136);
    expect(new Set(all.map((t) => t.id)).size).toBe(136);
  });

  it('rejects malformed walls', () => {
    expect(() => dealInitialHands(createStandardWall().slice(0, 135))).toThrow(/136-tile wall/);
  });
});

import { createHandState, discardTile, drawTile, passClaim } from '../src/game.js';

describe('turn state machine', () => {
  it('starts with East holding 14 and required to discard', () => {
    const state = createHandState(dealInitialHands(createStandardWall()));
    expect(state.currentSeat).toBe('east');
    expect(state.phase).toBe('awaiting_discard');
    expect(state.hands.east).toHaveLength(14);
  });

  it('rotates East discard -> South draw -> South discard -> West draw', () => {
    const state = createHandState(dealInitialHands(createStandardWall()));
    discardTile(state, 'east', state.hands.east[0]!.id);
    expect(state.currentSeat).toBe('south');
    expect(state.phase).toBe('awaiting_draw');
    drawTile(state, 'south');
    expect(state.hands.south).toHaveLength(14);
    expect(state.phase).toBe('awaiting_discard');
    discardTile(state, 'south', state.hands.south[0]!.id);
    if(state.claim)for(const seat of ['east','south','west','north'] as const){if(state.claim&&!state.claim.passed.includes(seat)){const o=state.claim.options[seat];if(o.ron||o.pon||o.kan||o.chiSequences.length)passClaim(state,seat);}}
    expect(state.currentSeat).toBe('west');
    expect(state.phase).toBe('awaiting_draw');
  });

  it('rejects out-of-turn actions and tiles not held by the player', () => {
    const state = createHandState(dealInitialHands(createStandardWall()));
    expect(() => discardTile(state, 'south', state.hands.south[0]!.id)).toThrow(/east's turn/i);
    expect(() => discardTile(state, 'east', 'not-a-real-tile')).toThrow(/not in your hand/i);
    expect(() => drawTile(state, 'east')).toThrow(/Expected awaiting_discard/i);
  });
});

describe('dealer-aware dealing', () => {
  it('gives the configured dealer 14 tiles and all others 13', () => {
    const deal = dealInitialHands(createStandardWall(), 'south');
    expect(deal.hands.east).toHaveLength(13);
    expect(deal.hands.south).toHaveLength(14);
    expect(deal.hands.west).toHaveLength(13);
    expect(deal.hands.north).toHaveLength(13);
    const state = createHandState(deal, 'south', 'S');
    expect(state.currentSeat).toBe('south');
    expect(state.dealerSeat).toBe('south');
    expect(state.roundWind).toBe('S');
  });
});
