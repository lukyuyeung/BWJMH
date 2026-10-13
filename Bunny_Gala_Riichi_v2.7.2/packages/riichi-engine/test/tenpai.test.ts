import { describe, expect, it } from 'vitest';
import { createStandardWall, getWaits, type TileFace } from '../src/index.js';
function tiles(faces: TileFace[]){ const wall=createStandardWall(); const used=new Set<string>(); return faces.map(face=>{const t=wall.find(x=>x.face===face&&!used.has(x.id))!;used.add(t.id);return t;}); }
describe('tenpai and waits',()=>{
 it('finds a single wait',()=>{const h=tiles(['1m','2m','3m','4m','5m','6m','7p','8p','9p','E','E','E','C']);expect(getWaits(h)).toContain('C');});
 it('returns no waits for a non-tenpai hand',()=>{const h=tiles(['1m','1m','2m','4m','5m','7p','9p','1s','3s','5s','E','S','W']);expect(getWaits(h)).toHaveLength(0);});
});
