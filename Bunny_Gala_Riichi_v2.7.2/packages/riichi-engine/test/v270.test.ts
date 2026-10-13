import {describe,it,expect} from 'vitest';
import {createStandardWall,evaluateWin,dealInitialHands,createHandState,drawTile,discardTile,passClaim,SEATS,type TileFace,type Seat} from '../src/index.js';
const hand=(text:string)=>{const pool=createStandardWall();return text.split(' ').map(f=>pool.splice(pool.findIndex(t=>t.face===f),1)[0]!);};
const ev=(text:string,winningFace:TileFace,method:'ron'|'tsumo'='ron')=>evaluateWin(hand(text),{method,winningFace,seatWind:'S',roundWind:'E',closed:true});
describe('new yaku independent fixtures',()=>{
 it('Ron shanpon is Sanankou + Toitoi; Tsumo is Suuankou; Ron tanki is Suuankou',()=>{const h='2m 2m 2m 3p 3p 3p 4s 4s 4s E E E P P';const r=ev(h,'2m');expect(r.yaku.map(y=>y.id)).toEqual(expect.arrayContaining(['toitoi','sanankou']));expect(r.yakuman).toBe(0);expect(ev(h,'2m','tsumo').yaku.map(y=>y.id)).toContain('suuankou');expect(ev(h,'P').yaku.map(y=>y.id)).toContain('suuankou');});
 it('Ryanpeikou replaces Iipeikou and chooses highest standard decomposition',()=>{const r=ev('1m 2m 3m 1m 2m 3m 5p 6p 7p 5p 6p 7p E E','7p');expect(r.yaku.map(y=>y.id)).toContain('ryanpeikou');expect(r.yaku.map(y=>y.id)).not.toContain('iipeikou');});
 it.each([['chanta','1m 2m 3m 7p 8p 9p 1s 2s 3s E E E C C','3m'],['junchan','1m 2m 3m 7p 8p 9p 1s 2s 3s 9s 9s 9s 1p 1p','3m'],['chuuren','1m 1m 1m 2m 3m 4m 5m 6m 7m 8m 9m 9m 9m 5m','5m'],['sanshoku_doukou','2m 2m 2m 2p 2p 2p 2s 2s 2s 5m 6m 7m E E','7m'],['shousuushi','E E E S S S W W W 1p 2p 3p N N','3p'],['ryuuiisou','2s 2s 2s 3s 3s 3s 4s 4s 4s 6s 6s 6s F F','2s']] as const)('%s',(id,h,w)=>expect(ev(h,w).yaku.map(y=>y.id)).toContain(id));
 it('open Chanta loses one Han and cannot count closed-only yaku',()=>{const all=hand('1m 2m 3m 7p 8p 9p 1s 2s 3s E E E C C'),tiles=all.slice(0,3);const r=evaluateWin(all,{method:'ron',winningFace:'3s',seatWind:'S',closed:false,melds:[{type:'chi',tiles,calledTile:tiles[0]!,from:'north',open:true}]});expect(r.yaku.find(y=>y.id==='chanta')?.han).toBe(1);expect(r.yaku.map(y=>y.id)).not.toContain('menzen_tsumo');});
});
describe('dealer packet dealing and mutation guards',()=>{
 it.each(SEATS)('deals 4-tile packets starting at current dealer %s',(dealer)=>{const wall=createStandardWall(),d=dealInitialHands(wall,dealer);expect(d.hands[dealer].slice(0,4)).toEqual(wall.slice(0,4));expect(d.hands[dealer].at(-1)).toEqual(wall[52]);expect(d.liveWall[0]).toEqual(wall[53]);expect(d.hands[dealer]).toHaveLength(14);});
 it('empty-wall rejected draw has no mutation',()=>{const g=createHandState(dealInitialHands(createStandardWall()));g.phase='awaiting_draw';g.liveWall=[];const before=JSON.stringify(g);expect(()=>drawTile(g,'east')).toThrow();expect(JSON.stringify(g)).toBe(before);});
 it('four identical initial winds abort only after all Ron opportunities pass',()=>{const wall=createStandardWall(),g=createHandState(dealInitialHands(wall));g.abortiveEnabled=true;const winds=wall.filter(t=>t.face==='N');g.melds={east:[],south:[],west:[],north:[]};for(let i=0;i<3;i++){const s=SEATS[i]!;g.discardedFaces[s]=['N'];g.discards[s]=[winds[i]!];}g.currentSeat='north';g.hands.north=hand('N 1m 2m 4m 5m 7m 8m 1p 3p 5p 7p E S W');g.phase='awaiting_discard';discardTile(g,'north',g.hands.north[0]!.id);for(const s of SEATS)if(g.claim&&!g.claim.passed.includes(s)){const o=g.claim.options[s];if(o.ron||o.pon||o.kan||o.chiSequences.length)passClaim(g,s);}expect(g.abortiveReason).toBe('four_winds');expect(g.phase).toBe('abortive_draw');});
});

describe('four-Riichi/four-Kan abortive resolution',()=>{
 const resolve=(g:ReturnType<typeof createHandState>)=>{for(const seat of SEATS)if(g.claim&&!g.claim.passed.includes(seat)){const o=g.claim.options[seat];if(o.ron||o.pon||o.kan||o.chiSequences.length)passClaim(g,seat);}};
 it('four Riichi aborts after reactions, and disabled policy never aborts',()=>{for(const enabled of [false,true]){const g=createHandState(dealInitialHands(createStandardWall()));g.abortiveEnabled=enabled;for(const seat of SEATS)g.riichi[seat].declared=true;g.riichi.east.declarationTurn=g.turnNumber;discardTile(g,'east',g.hands.east.at(-1)!.id);resolve(g);expect(g.abortiveReason).toBe(enabled?'four_riichi':undefined);}});
 it.each([false,true])('four Kans with sameOwner=%s preserve physical tiles and use correct abort policy',(sameOwner)=>{
  const pool=createStandardWall();const take=(face:TileFace,n:number)=>Array.from({length:n},()=>pool.splice(pool.findIndex(t=>t.face===face),1)[0]!);
  const g=createHandState(dealInitialHands(createStandardWall()));g.abortiveEnabled=true;g.melds={east:[],south:[],west:[],north:[]};
  for(let i=0;i<4;i++){const seat=sameOwner?'east':SEATS[i]!,tiles=take(`${i+1}m` as TileFace,4);g.melds[seat].push({type:'kan',tiles,calledTile:tiles[0]!,from:SEATS[(i+3)%4]!,open:true});}
  for(const seat of SEATS){g.hands[seat]=[];const n=13-3*g.melds[seat].length+(seat==='east'?1:0);for(let j=0;j<n;j++)g.hands[seat].push(pool.shift()!);}
  g.deadWall.tiles=pool.splice(-14);g.liveWall=pool;g.deadWall.rinshan=[];g.currentSeat='east';g.phase='awaiting_discard';
  discardTile(g,'east',g.hands.east.at(-1)!.id);resolve(g);expect(g.abortiveReason).toBe(sameOwner?undefined:'four_kans');
  const all=[...Object.values(g.hands).flat(),...Object.values(g.melds).flatMap(ms=>ms.flatMap(m=>m.tiles)),...Object.values(g.discards).flat(),...g.liveWall,...g.deadWall.tiles];expect(new Set(all.map(t=>t.id)).size).toBe(136);
 });
 it('three/four fixed Kans are recognized without losing fourth physical copies',()=>{
  for(const count of [3,4]){const pool=createStandardWall(),melds=Array.from({length:count},(_,i)=>{const face=`${i+1}m` as TileFace;const tiles=pool.filter(t=>t.face===face);for(const t of tiles)pool.splice(pool.indexOf(t),1);return {type:'kan' as const,tiles,calledTile:tiles[0]!,from:'north' as Seat,open:true};});const own=count===4?hand('5p 5p'):hand('7p 8p 9p 5p 5p');const all=[...own,...melds.flatMap(m=>m.tiles.slice(0,3))];const r=evaluateWin(all,{method:'ron',winningFace:count===4?'5p':'9p',seatWind:'S',roundWind:'E',closed:false,melds});expect(r.yaku.map(y=>y.id)).toContain(count===4?'suukantsu':'sankantsu');}
 });
});
