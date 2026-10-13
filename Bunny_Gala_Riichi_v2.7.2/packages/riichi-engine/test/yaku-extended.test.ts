import {describe,it,expect} from 'vitest';import {evaluateWin} from '../src/yaku.js';import type {Tile} from '../src/tiles.js';
const hand=(s:string)=>s.split(' ').map((face,i)=>({id:String(i),face,copy:0,red:false})) as Tile[];
const ids=(r:ReturnType<typeof evaluateWin>)=>r.yaku.map(x=>x.id);
describe('extended yaku',()=>{
 it('detects chinitsu',()=>expect(ids(evaluateWin(hand('1m 2m 3m 1m 2m 3m 4m 5m 6m 7m 8m 9m 5m 5m'),{method:'ron',seatWind:'S',closed:true}))).toContain('chinitsu'));
 it('detects toitoi',()=>expect(ids(evaluateWin(hand('2m 2m 2m 3p 3p 3p 4s 4s 4s E E E P P'),{method:'ron',seatWind:'S',closed:true}))).toContain('toitoi'));
 it('detects sanshoku doujun',()=>expect(ids(evaluateWin(hand('1m 2m 3m 1p 2p 3p 1s 2s 3s 7m 8m 9m E E'),{method:'ron',seatWind:'S',closed:true}))).toContain('sanshoku_doujun'));
});

// v2.5 safe tile-pattern yakuman are covered through evaluator integration in runtime QA.
