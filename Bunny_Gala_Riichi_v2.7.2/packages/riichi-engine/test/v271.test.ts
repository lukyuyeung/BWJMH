import {describe,it,expect} from 'vitest';
import {createStandardWall,dealInitialHands,createHandState,getAnkanTileIds,declareAnkan,declareRiichiAndDiscard,getPlayerWaits,getLegalDiscardIds,discardTile,claimChi,passClaim,getClaimOptions,evaluateWin,type Tile,type TileFace} from '../src/index.js';
const tiles=(text:string):Tile[]=>{const pool=createStandardWall();return text.split(' ').map(face=>pool.splice(pool.findIndex(t=>t.face===face),1)[0]!);};
const state=()=>createHandState(dealInitialHands(createStandardWall()));
describe('v2.7.1 additional rules',()=>{
 it('post-Riichi Ankan requires drawn fourth tile and preserves every decomposition',()=>{
  const g=state();g.postRiichiAnkanEnabled=true;g.riichi.east.declared=true;g.hands.east=tiles('E E E 1m 2m 3m 4p 5p 6p 7s 8s 9s C E');
  expect(getAnkanTileIds(g,'east')).toHaveLength(1);const waits=['C'];declareAnkan(g,'east',getAnkanTileIds(g,'east')[0]!);expect(g.melds.east[0]?.open).toBe(false);expect(g.riichi.east.declared).toBe(true);expect(g.riichi.east.ippatsuEligible).toBe(false);
  expect(g.hands.east).toHaveLength(11);expect(waits).toEqual(getPlayerWaits({...g,hands:{...g.hands,east:g.hands.east.slice(0,-1)}},'east'));
 });
 it('rejects identical waits when the pre-Kan hand also uses the tiles in sequences',()=>{
  const g=state();g.postRiichiAnkanEnabled=true;g.riichi.east.declared=true;g.hands.east=tiles('1m 1m 1m 2m 2m 2m 3m 3m 3m 4p 5p 6p C 1m');expect(getAnkanTileIds(g,'east')).toEqual([]);
 });
 it('rejects a held four-of-a-kind when the drawn tile is different, without mutation',()=>{const g=state();g.postRiichiAnkanEnabled=true;g.riichi.east.declared=true;g.hands.east=tiles('E E E E 1m 2m 3m 4p 5p 6p 7s 8s 9s C');const before=JSON.stringify(g);expect(getAnkanTileIds(g,'east')).toEqual([]);expect(()=>declareAnkan(g,'east',g.hands.east[0]!.id)).toThrow();expect(JSON.stringify(g)).toBe(before);});
 it.each([['3m',['3m','6m']],['5m',['5m','2m']],['4m',['4m']]] as [TileFace,TileFace[]][])('Chi %s prohibits immediate same/swap tiles and clears after legal discard',(called,blocked)=>{
  const g=state();g.kuikaeEnabled=true;g.currentSeat='north';g.hands.north=tiles(`${called} 1p 2p 4p 5p 7p 8p 1s 3s 5s E S W N`);g.hands.east=tiles('2m 3m 4m 5m 6m 7m 8m 9m 1p 4p E S W');g.riichi.south.riichiFuriten=true;g.riichi.west.riichiFuriten=true;discardTile(g,'north',g.hands.north[0]!.id);for(const seat of ['south','west'] as const)if(getClaimOptions(g,seat))passClaim(g,seat);claimChi(g,'east',['3m','4m','5m']);
  expect(g.discardRestriction?.faces).toEqual(blocked);const ids=getLegalDiscardIds(g,'east');for(const tile of g.hands.east)expect(ids.includes(tile.id)).toBe(!blocked.includes(tile.face));
  const forbidden=g.hands.east.find(t=>blocked.includes(t.face));if(forbidden){const before=JSON.stringify(g);expect(()=>discardTile(g,'east',forbidden.id)).toThrow(/immediately/);expect(JSON.stringify(g)).toBe(before);}discardTile(g,'east',ids[0]!);expect(g.discardRestriction).toBeUndefined();
 });
 it('double Riichi requires first own discard without a call and replaces ordinary Riichi',()=>{const g=state();g.doubleRiichiEnabled=true;g.hands.east=tiles('1m 2m 3m 4p 5p 6p 7s 8s 9s E E E C 2p');declareRiichiAndDiscard(g,'east',g.hands.east.at(-1)!.id);expect(g.riichi.east.doubleRiichi).toBe(true);const ev=evaluateWin(tiles('1m 2m 3m 4p 5p 6p 7s 8s 9s E E E C C'),{method:'ron',seatWind:'S',roundWind:'W',winningFace:'C',riichi:true,doubleRiichi:true});expect(ev.yaku.find(y=>y.id==='double_riichi')?.han).toBe(2);expect(ev.yaku.some(y=>y.id==='riichi')).toBe(false);});
 it('later own discard cannot become double Riichi',()=>{const g=state();g.doubleRiichiEnabled=true;g.discardedFaces.east=['9p'];g.hands.east=tiles('1m 2m 3m 4p 5p 6p 7s 8s 9s E E E C 2p');declareRiichiAndDiscard(g,'east',g.hands.east.at(-1)!.id);expect(g.riichi.east.doubleRiichi).toBe(false);});
});

describe('first-turn Yakuman',()=>{
 it('Tenhou on dealer initial complete hand, but never after a discard',async()=>{const {declareTsumo}=await import('../src/game.js');const g=state();g.firstTurnYakumanEnabled=true;g.hands.east=tiles('2m 3m 4m 3p 4p 5p 4s 5s 6s 6s 7s 8s 5p 5p');expect(declareTsumo(g,'east').evaluation.yaku.map(y=>y.id)).toEqual(['tenhou']);const late=state();late.firstTurnYakumanEnabled=true;late.discardedFaces.east=['9m'];late.hands.east=g.hands.east;expect(declareTsumo(late,'east').evaluation.yaku.some(y=>y.id==='tenhou')).toBe(false);});
 it('Chiihou on nondealer first live draw; calls cancel it',async()=>{const {declareTsumo}=await import('../src/game.js');const g=state();g.firstTurnYakumanEnabled=true;g.currentSeat='south';g.lastDrawSeat='south';g.lastDrawSource='live';g.hands.south=tiles('2m 3m 4m 3p 4p 5p 4s 5s 6s 6s 7s 8s 5p 5p');g.discardedFaces.east=['9m'];expect(declareTsumo(g,'south').evaluation.yaku.map(y=>y.id)).toEqual(['chiihou']);});
 it('stacks distinct heavenly/orphan Yakuman and never grants them on Ron',()=>{const hand=tiles('1m 9m 1p 9p 1s 9s E S W N P F C C');expect(evaluateWin(hand,{method:'tsumo',seatWind:'E',tenhou:true}).yakuman).toBe(2);expect(evaluateWin(hand,{method:'ron',seatWind:'E',tenhou:true}).yakuman).toBe(1);});
});

describe('own Kan needs a draw',()=>{
 it('held fourth tile cannot turn a just-called Pon into Kakan',async()=>{const {getKakanTileIds,claimPon}=await import('../src/game.js');const g=state();g.currentSeat='north';g.hands.east=tiles('5m 5m 5m E E E E 1m 2m 3m 4p 5p 6p');g.hands.north=tiles('5m 1p 2p 3p 4p 5p 6p 7p 8p 9p S W N C');g.riichi.south.temporaryFuriten=true;g.riichi.west.temporaryFuriten=true;discardTile(g,'north',g.hands.north[0]!.id);claimPon(g,'east');expect(g.hands.east.some(t=>t.face==='5m')).toBe(true);expect(getKakanTileIds(g,'east')).toEqual([]);expect(getAnkanTileIds(g,'east')).toEqual([]);});
});

describe('scoring interpretation includes bonuses and dealer payments',()=>{
 it.each([0,1,4])('chooses maximum payable value with %s bonus Han',async bonus=>{const {decomposeStandardFaces,possibleWaitTypes,detectAgari}=await import('../src/index.js');const examples=['1m 1m 2m 2m 3m 3m 4m 4m 5m 5m 6m 6m 7m 7m','2m 2m 2m 3m 3m 3m 4m 4m 4m 5p 6p 7p 5s 5s','1m 1m 1m 2m 2m 2m 3m 3m 3m 7p 8p 9p E E'];
 for(const text of examples)for(const wind of ['E','S'] as const){const hand=tiles(text),winning=hand.at(-1)!.face,ctx={method:'ron' as const,seatWind:wind,roundWind:'E' as const,winningFace:winning,bonusHan:bonus};const chosen=evaluateWin(hand,ctx),candidates=[];for(const d of decomposeStandardFaces(hand.map(t=>t.face)))for(const waitType of possibleWaitTypes(d,winning)){const ev=evaluateWin(hand,{...ctx,decomposition:d,waitType,shapeOverride:'standard'});if(ev.legal)candidates.push(ev);}if(detectAgari(hand).shape==='chiitoitsu')candidates.push(evaluateWin(hand,{...ctx,shapeOverride:'chiitoitsu'}));
 const value=(ev:typeof chosen)=>{const han=ev.han+bonus,fu=ev.shape==='chiitoitsu'?25:ev.fu?.fu??0;const base=ev.yakuman?8000*ev.yakuman:han>=13?8000:han>=11?6000:han>=8?4000:han>=6?3000:han>=5?2000:Math.min(2000,fu*2**(han+2));return Math.ceil(base*(wind==='E'?6:4)/100)*100;};expect(chosen.legal).toBe(true);expect(value(chosen)).toBe(Math.max(...candidates.map(value)));}
 });
});
