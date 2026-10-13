import { describe, expect, it } from 'vitest';
import { detectAgariFaces, type TileFace } from '../src/index.js';
const f = (s: string) => s.split(' ') as TileFace[];
describe('agari shape detection', () => {
  it('accepts standard 4 melds + pair', () => expect(detectAgariFaces(f('1m 2m 3m 4m 5m 6m 7p 8p 9p E E E C C'))).toEqual({winning:true,shape:'standard'}));
  it('accepts seven pairs', () => expect(detectAgariFaces(f('1m 1m 3m 3m 5p 5p 7p 7p 2s 2s 9s 9s E E'))).toEqual({winning:true,shape:'chiitoitsu'}));
  it('accepts thirteen orphans', () => expect(detectAgariFaces(f('1m 9m 1p 9p 1s 9s E S W N P F C C'))).toEqual({winning:true,shape:'kokushi'}));
  it('rejects an incomplete hand', () => expect(detectAgariFaces(f('1m 2m 3m 4m 5m 6m 7p 8p 9p E E C C N')).winning).toBe(false));
  it('rejects impossible five copies', () => expect(detectAgariFaces(f('1m 1m 1m 1m 1m 2m 3m 4m 2p 3p 4p E E E')).winning).toBe(false));
});
