import { describe, expect, it } from 'vitest';
import { getSeatWind } from '../src/game.js';

describe('v2 dealer-relative seat wind',()=>{
  it('rotates winds without moving player identities',()=>{
    expect(getSeatWind({dealerSeat:'south'},'south')).toBe('E');
    expect(getSeatWind({dealerSeat:'south'},'west')).toBe('S');
    expect(getSeatWind({dealerSeat:'south'},'north')).toBe('W');
    expect(getSeatWind({dealerSeat:'south'},'east')).toBe('N');
  });
});
