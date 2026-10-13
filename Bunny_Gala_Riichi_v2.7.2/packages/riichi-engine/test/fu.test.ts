import {describe,it,expect} from 'vitest';
import {calculateStandardFu} from '../src/fu.js';
const c=(s:string)=>s.trim().split(/\s+/) as any;
describe('fu engine',()=>{
 it('closed ron gets 10 fu and rounds',()=>{const r=calculateStandardFu({concealedFaces:c('2m 3m 4m 3p 4p 5p 4s 5s 6s 6m 6m 6m E E'),melds:[],winningFace:'4s',method:'ron',closed:true,seatWind:'S',roundWind:'E'});expect(r?.fu).toBe(40)});
 it('chiitoitsu is handled outside standard fu',()=>expect(calculateStandardFu({concealedFaces:c('1m 1m 2m 2m 3p 3p 4p 4p 5s 5s E E P P'),melds:[],winningFace:'P',method:'ron',closed:true,seatWind:'S',roundWind:'E'})).toBeNull());
});
