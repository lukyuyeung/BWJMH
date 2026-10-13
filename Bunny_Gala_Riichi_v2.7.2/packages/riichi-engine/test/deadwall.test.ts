import { describe,expect,it } from 'vitest';
import { createStandardWall, createDeadWall, doraFromIndicator, countDora } from '../src/index.js';
describe('dead wall and dora',()=>{
 it('creates 4 rinshan draws and starts with one visible dora indicator',()=>{const d=createDeadWall(createStandardWall().slice(0,14));expect(d.rinshan).toHaveLength(4);expect(d.revealedDoraCount).toBe(1)});
 it('wraps suited, wind, and dragon indicators correctly',()=>{expect(doraFromIndicator('9m')).toBe('1m');expect(doraFromIndicator('N')).toBe('E');expect(doraFromIndicator('C')).toBe('P')});
 it('counts indicator dora and aka dora separately',()=>{const w=createStandardWall();const red=w.find(t=>t.face==='5m'&&t.red)!;const normal=w.find(t=>t.face==='2m'&&!t.red)!;const indicator=w.find(t=>t.face==='1m')!;expect(countDora([red,normal],[indicator])).toEqual({indicatorDora:1,akaDora:1,total:2})});
});
