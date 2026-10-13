import { describe, expect, it } from 'vitest';
import { evaluateWin, type Tile, type TileFace } from '../src/index.js';
const tiles=(faces:TileFace[]):Tile[]=>faces.map((face,i)=>({id:`${face}-${i}`,face,copy:(i%4) as 0|1|2|3,red:false}));
describe('MVP yaku evaluation',()=>{
 it('allows closed tsumo as a yaku',()=>{const h=tiles(['1m','2m','3m','2m','3m','4m','4p','5p','6p','6s','7s','8s','E','E']);const r=evaluateWin(h,{method:'tsumo',seatWind:'S',roundWind:'E',closed:true});expect(r.legal).toBe(true);expect(r.yaku.some(y=>y.id==='menzen_tsumo')).toBe(true)});
 it('rejects a ron shape with no yaku',()=>{const h=tiles(['1m','2m','3m','2m','3m','4m','4p','5p','6p','6s','7s','8s','9m','9m']);const r=evaluateWin(h,{method:'ron',seatWind:'S',roundWind:'E',closed:true});expect(r.legal).toBe(false);expect(r.reason).toBe('NO_YAKU')});
 it('recognizes chiitoitsu',()=>{const h=tiles(['2m','2m','3m','3m','4p','4p','5p','5p','6s','6s','7s','7s','E','E']);const r=evaluateWin(h,{method:'ron',seatWind:'S',roundWind:'E',closed:true});expect(r.legal).toBe(true);expect(r.yaku.some(y=>y.id==='chiitoitsu')).toBe(true)});
 it('recognizes kokushi as yakuman',()=>{const h=tiles(['1m','9m','1p','9p','1s','9s','E','S','W','N','P','F','C','C']);const r=evaluateWin(h,{method:'ron',seatWind:'S',roundWind:'E',closed:true});expect(r.yakuman).toBe(1);expect(r.legal).toBe(true)});
});

describe('situational yaku',()=>{
 const winning=tiles(['1m','2m','3m','2m','3m','4m','4p','5p','6p','6s','7s','8s','E','E']);
 it('recognizes ippatsu only together with riichi context',()=>{
  const r=evaluateWin(winning,{method:'ron',seatWind:'S',roundWind:'E',closed:true,riichi:true,ippatsu:true});
  expect(r.yaku.some(y=>y.id==='ippatsu')).toBe(true);
 });
 it('recognizes haitei, houtei and rinshan from explicit server event context',()=>{
  expect(evaluateWin(winning,{method:'tsumo',seatWind:'S',closed:true,haitei:true}).yaku.some(y=>y.id==='haitei')).toBe(true);
  expect(evaluateWin(winning,{method:'ron',seatWind:'S',closed:true,houtei:true}).yaku.some(y=>y.id==='houtei')).toBe(true);
  expect(evaluateWin(winning,{method:'tsumo',seatWind:'S',closed:true,rinshan:true}).yaku.some(y=>y.id==='rinshan_kaihou')).toBe(true);
 });
});
