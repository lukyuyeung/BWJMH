import {describe,it,expect} from 'vitest';
import {decomposeStandardFaces} from '../src/decomposition.js';
const f=(s:string)=>s.split(' ') as any;
describe('standard decomposition',()=>{
 it('finds four groups and a pair',()=>{const d=decomposeStandardFaces(f('1m 2m 3m 4m 5m 6m 2p 3p 4p 7s 7s 7s E E'));expect(d.length).toBeGreaterThan(0);expect(d[0]!.groups).toHaveLength(4);expect(d[0]!.pair).toBe('E')});
 it('supports fewer concealed groups when melds already exist',()=>expect(decomposeStandardFaces(f('1m 2m 3m 4p 5p 6p 7s 7s'),2).length).toBeGreaterThan(0));
});
