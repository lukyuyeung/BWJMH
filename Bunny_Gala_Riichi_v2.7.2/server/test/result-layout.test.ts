import {describe,it,expect} from 'vitest';
import {sortResultTiles,sortResultMelds} from '../../client/src/result-layout.js';
import {yakuExamples,exampleGroups} from '../../client/src/yaku-examples.js';
import {detectAgariFaces,type TileFace} from '@bunny/riichi-engine';
describe('illustrated yaku and real result ordering',()=>{
 it('sorts the real winning inventory without dropping red tiles or changing IDs',()=>{
  const input=[{id:'won',face:'5p',red:true},{id:'honor',face:'C',red:false},{id:'one',face:'1m',red:false},{id:'five',face:'5p',red:false}];const snapshot=JSON.stringify(input);
  expect(sortResultTiles(input).map(t=>t.id)).toEqual(['one','won','five','honor']);expect(JSON.stringify(input)).toBe(snapshot);
 });
 it('keeps called tile, source and four physical kan tiles intact when sorting melds',()=>{
  const kan={type:'kan',from:'south',calledTile:{id:'called'},tiles:[{face:'C'},{face:'C'},{face:'C'},{face:'C'}]};const chi={type:'chi',from:'west',calledTile:{id:'chi-called'},tiles:[{face:'2m'},{face:'1m'},{face:'3m'}]};
  const sorted=sortResultMelds([kan,chi]);expect(sorted).toEqual([chi,kan]);expect(sorted[1]).toBe(kan);expect(sorted[1]!.tiles).toHaveLength(4);expect(sorted[1]!.calledTile.id).toBe('called');expect(sorted[1]!.from).toBe('south');
 });
 it('gives all 38 supported yaku valid illustrated winning shapes (kans counted as groups)',()=>{
  expect(Object.keys(yakuExamples)).toHaveLength(38);
  for(const [name,pattern] of Object.entries(yakuExamples)){
   const groups=exampleGroups(pattern);const normalized=groups.flatMap(g=>g.length===4&&new Set(g).size===1?g.slice(0,3):g) as TileFace[];
   expect(detectAgariFaces(normalized).winning,name).toBe(true);
  }
 });
});
