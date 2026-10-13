import {describe,it,expect} from 'vitest';
import {createStandardWall,type TileFace,type Tile} from '../src/tiles.js';
import {createHandState,discardTile,drawTile,passClaim,getClaimOptions,claimChi,claimPon,claimKan,declareAnkan,declareKakan,declareRon,declareTsumo,getPlayerWaits,isFuriten,declareRiichiAndDiscard,getRiichiDiscardIds,getTsumoEvaluation,getAnkanTileIds,getKakanTileIds,SEATS} from '../src/index.js';
import {dealInitialHands,type Seat} from '../src/deal.js';
import {evaluateWin} from '../src/yaku.js';
import {calculateStandardFu} from '../src/fu.js';
const faces=(s:string)=>s.split(' ') as TileFace[];
function tiles(s:string):Tile[]{const wall=createStandardWall();return faces(s).map(f=>{const i=wall.findIndex(t=>t.face===f);if(i<0)throw Error('Bad fixture '+f);return wall.splice(i,1)[0]!})}
function state(){return createHandState(dealInitialHands(createStandardWall()))}
const context={method:'ron' as const,seatWind:'S' as TileFace,roundWind:'E' as TileFace,closed:true};
const ids=(r:ReturnType<typeof evaluateWin>)=>r.yaku.map(y=>y.id);
function passAll(s:ReturnType<typeof state>){for(const seat of SEATS)if(s.claim){const o=getClaimOptions(s,seat);if(o)passClaim(s,seat)}}

describe('independent representative yaku fixtures',()=>{
 const cases:[string,string,string][]=[
 ['tanyao','2m 3m 4m 3p 4p 5p 4s 5s 6s 6m 7m 8m 2p 2p','8m'],
 ['pinfu','1m 2m 3m 4p 5p 6p 6s 7s 8s 2s 3s 4s 9m 9m','4s'],
 ['iipeikou','1m 2m 3m 1m 2m 3m 4p 5p 6p 7s 8s 9s E E','6p'],
 ['sanshoku_doujun','1m 2m 3m 1p 2p 3p 1s 2s 3s 7m 8m 9m E E','9m'],
 ['ittsu','1m 2m 3m 4m 5m 6m 7m 8m 9m 2p 3p 4p E E','4p'],
 ['toitoi','2m 2m 2m 3p 3p 3p 4s 4s 4s E E E P P','2m'],
 ['chiitoitsu','1m 1m 3m 3m 5p 5p 7p 7p 2s 2s 9s 9s E E','E'],
 ['honitsu','1m 2m 3m 4m 5m 6m 7m 8m 9m E E E P P','P'],
 ['chinitsu','1m 2m 3m 1m 2m 3m 4m 5m 6m 7m 8m 9m 5m 5m','6m'],
 ['honroutou','1m 1m 1m 9p 9p 9p E E E C C C P P','1m'],
 ['shousangen','P P P F F F C C 1m 2m 3m 7p 8p 9p','9p'],
 ['daisangen','P P P F F F C C C 1m 2m 3m E E','3m'],
 ['tsuuiisou','E E E S S S W W W N N N P P','P'],
 ['chinroutou','1m 1m 1m 9m 9m 9m 1p 1p 1p 9p 9p 9p 1s 1s','1s'],
 ['kokushi','1m 9m 1p 9p 1s 9s E S W N P F C C','C']];
 it.each(cases)('%s',(id,h,w)=>expect(ids(evaluateWin(tiles(h),{...context,winningFace:w as TileFace}))).toContain(id));
 it('counts double East Yakuhai twice',()=>{const ev=evaluateWin(tiles('E E E 1m 2m 3m 4p 5p 6p 7s 8s 9s P P'),{...context,seatWind:'E',winningFace:'P'});expect(ev.yaku.filter(y=>y.id==='yakuhai')).toHaveLength(2)});
 it('does not combine Pinfu with a triplet interpretation',()=>{const ev=evaluateWin(tiles('1m 1m 1m 2m 2m 2m 3m 3m 3m 4m 4m 4m 5m 5m'),{...context,winningFace:'5m'});expect(ids(ev)).toContain('suuankou');expect(ids(ev)).not.toContain('iipeikou')});
 it('chooses standard over seven pairs when it scores higher',()=>{const ev=evaluateWin(tiles('1m 1m 2m 2m 3m 3m 4m 4m 5m 5m 6m 6m 7m 7m'),{...context,winningFace:'7m'});expect(ev.shape).toBe('standard');expect(ev.han).toBeGreaterThanOrEqual(8)});
 it('preserves fixed open groups instead of reinterpreting them',()=>{const h=tiles('1m 2m 3m 1m 2m 3m 1m 2m 3m 4p 5p 6p E E');const m={type:'pon' as const,tiles:h.filter(t=>t.face==='1m'),calledTile:h[0]!,from:'east' as Seat,open:true};expect(evaluateWin(h,{...context,closed:false,melds:[m],winningFace:'6p'}).legal).toBe(false)});
 it('adds multiple yakuman and suppresses normal yaku',()=>{const ev=evaluateWin(tiles('P P P F F F C C C E E E N N'),{...context,winningFace:'N'});expect(ev.yakuman).toBe(3);expect(ev.han).toBe(0);expect(ev.yaku.every(y=>y.yakuman)).toBe(true)});
});

describe('fu independent fixtures',()=>{
 const c={method:'ron' as const,closed:true,seatWind:'S' as TileFace,roundWind:'E' as TileFace,melds:[]};
 it.each([
 ['ryanmen','4s',30],['kanchan','3s',40],['penchan','3m',40],['tanki','9m',40]
 ] as const)('%s wait',(_label,w,fu)=>{expect(calculateStandardFu({...c,concealedFaces:faces('1m 2m 3m 4p 5p 6p 6s 7s 8s 2s 3s 4s 9m 9m'),winningFace:w})?.fu).toBe(fu)});
 it('Pinfu Tsumo is 20 and Pinfu Ron is 30',()=>{const h=tiles('1m 2m 3m 4p 5p 6p 6s 7s 8s 2s 3s 4s 9m 9m');for(const method of ['tsumo','ron'] as const){const ev=evaluateWin(h,{...context,method,winningFace:'4s'});expect(ev.fu?.fu).toBe(method==='tsumo'?20:30)}});
 it('double wind pair adds 4 fu',()=>{const r=calculateStandardFu({...c,seatWind:'E',concealedFaces:faces('1m 2m 3m 4p 5p 6p 6s 7s 8s 2s 3s 4s E E'),winningFace:'4s'});expect(r?.items.find(x=>x.label==='Value pair')?.fu).toBe(4)});
 it('Ron completed Shanpon triplet is open for fu',()=>{const r=calculateStandardFu({...c,concealedFaces:faces('2m 2m 2m 4p 5p 6p 6s 7s 8s 2s 3s 4s E E'),winningFace:'2m'});expect(r?.rawFu).toBe(34);expect(r?.waitType).toBe('shanpon')});
 it.each([['2m',true,8],['1m',true,16],['2m',false,16],['1m',false,32]] as const)('Kan %s open=%s has %d fu',(face,open,amount)=>{const ts=tiles(`${face} ${face} ${face} ${face}`);const r=calculateStandardFu({...c,closed:!open,concealedFaces:faces('4p 5p 6p 6s 7s 8s 2s 3s 4s E E'),winningFace:'4s',melds:[{type:'kan',tiles:ts,calledTile:ts[0]!,from:'east',open}]});expect(r?.items.find(x=>x.label.includes('kan'))?.fu).toBe(amount)});
});

describe('turn, Riichi, Furiten and Kan regression',()=>{
 it('Riichi pays via server and locks discards in engine',()=>{const s=state();s.hands.east=tiles('1m 2m 3m 4p 5p 6p 7s 8s 9s E E E C 2p');const id=s.hands.east.at(-1)!.id;expect(getRiichiDiscardIds(s,'east')).toContain(id);declareRiichiAndDiscard(s,'east',id);passAll(s);s.currentSeat='east';s.phase='awaiting_draw';s.liveWall.unshift(tiles('3p')[0]!);drawTile(s,'east');expect(()=>discardTile(s,'east',s.hands.east[0]!.id)).toThrow(/drawn tile/);expect(s.riichi.east.ippatsuEligible).toBe(true);discardTile(s,'east',s.hands.east.at(-1)!.id);expect(s.riichi.east.ippatsuEligible).toBe(false)});
 it('open Tenpai and permanent Furiten include a called-away discard',()=>{const s=state();s.hands.south=tiles('1m 2m 3m 4p 5p 6p 7s 8s 9s C');const ts=tiles('P P P');s.melds.south=[{type:'pon',tiles:ts,calledTile:ts[0]!,from:'east',open:true}];expect(getPlayerWaits(s,'south')).toContain('C');s.discardedFaces.south.push('C');expect(isFuriten(s,'south')).toBe(true)});
 it.each([false,true])('passing Ron sets Furiten, Riichi=%s',(riichi)=>{const s=state();s.hands.south=tiles('1m 2m 3m 4p 5p 6p 7s 8s 9s E E E C');s.riichi.south.declared=riichi;s.hands.east=tiles('C 1p 2p 3p 4p 5p 6p 7p 8p 9p S W N P');discardTile(s,'east',s.hands.east[0]!.id);expect(getClaimOptions(s,'south')?.ron).toBe(true);passClaim(s,'south');expect(isFuriten(s,'south')).toBe(true);passAll(s);s.currentSeat='south';s.phase='awaiting_draw';drawTile(s,'south');expect(s.riichi.south.temporaryFuriten).toBe(false);expect(s.riichi.south.riichiFuriten).toBe(riichi)});
 it('Ankan remains closed, reveals Dora and draws Rinshan',()=>{const s=state();s.hands.east=tiles('2m 2m 2m 2m 4p 5p 6p 7s 8s 9s E E C C');const n=s.liveWall.length;declareAnkan(s,'east',getAnkanTileIds(s,'east')[0]!);expect(s.melds.east[0]?.open).toBe(false);expect(s.hands.east).toHaveLength(11);expect(s.deadWall.revealedDoraCount).toBe(2);expect(s.deadWall.rinshan).toHaveLength(3);expect(s.liveWall.length).toBe(n-1);expect(s.deadWall.tiles).toHaveLength(14);expect(s.lastDrawSource).toBe('rinshan')});
 function kakan(){const s=state();const ts=tiles('5m 5m 5m 5m');s.melds.east=[{type:'pon',tiles:ts.slice(0,3),calledTile:ts[0]!,from:'south',open:true}];s.hands.east=[ts[3]!,...tiles('1p 2p 3p 4p 5p 6p 7s 8s 9s E E').slice(0,10)];s.hands.south=tiles('1p 2p 3p 2p 3p 4p 6s 7s 8s C C 4m 6m');declareKakan(s,'east',ts[3]!.id);return s;}
 it('Kakan stays transactional until Chankan passes',()=>{const s=kakan();expect(s.phase).toBe('awaiting_claim');expect(s.melds.east[0]?.type).toBe('pon');expect(s.deadWall.revealedDoraCount).toBe(1);passAll(s);expect(s.melds.east[0]?.type).toBe('kan');expect(s.deadWall.revealedDoraCount).toBe(2);expect(s.lastDrawSource).toBe('rinshan')});
 it('Chankan wins without mutating the Pon',()=>{const s=kakan();declareRon(s,'south');expect(s.phase).toBe('won');expect(s.melds.east[0]?.type).toBe('pon');expect(s.result?.evaluation.yaku.some(y=>y.id==='chankan')).toBe(true);expect(s.deadWall.revealedDoraCount).toBe(1)});
 it('rejects Kan once replacement/live tiles are exhausted',()=>{const s=state();s.liveWall=[];s.hands.east=tiles('2m 2m 2m 2m 4p 5p 6p 7s 8s 9s E E C C');expect(getAnkanTileIds(s,'east')).toEqual([]);expect(()=>declareAnkan(s,'east',s.hands.east[0]!.id)).toThrow()});
 it('does not allow Tsumo after a call without a draw',()=>{const s=state();delete s.lastDrawSeat;expect(getTsumoEvaluation(s,'east')).toBeNull();expect(()=>declareTsumo(s,'east')).toThrow(/draw/)});
 it('settles final discard after all claims pass',()=>{const s=state();s.liveWall=[];discardTile(s,'east',s.hands.east[0]!.id);passAll(s);expect(s.phase).toBe('exhaustive_draw');expect(()=>drawTile(s,s.currentSeat)).toThrow(/ended/)});
 it('Kan fourth tile contributes indicator Dora',()=>{const s=state();const ms=tiles('2m 2m 2m 2m');s.melds.east=[{type:'kan',tiles:ms,calledTile:ms[0]!,from:'south',open:true}];s.hands.east=tiles('4p 5p 6p 7s 8s 9s E E E C C');s.deadWall.doraIndicators[0]=tiles('1m')[0]!;const r=declareTsumo(s,'east');expect(r.dora.indicatorDora).toBe(4)});
});

describe('explicit call scenarios and priority',()=>{
 function callState(){const s=state();s.hands.east=tiles('3m 1p 2p 3p 4p 5p 6p 7p 8p 9p E S W N');s.hands.south=tiles('1m 2m 4p 5p 6p 7s 8s 9s P F C E S');s.hands.west=tiles('1p 2p 4p 5p 7p 8p 1s 3s 5s 7s E S W');s.hands.north=tiles('1p 2p 4p 5p 7p 8p 1s 3s 5s 7s E S W');return s}
 it('Chi consumes two and removes the called physical discard',()=>{const s=callState();discardTile(s,'east','3m-0');expect(getClaimOptions(s,'south')?.chiSequences).toContainEqual(['1m','2m','3m']);claimChi(s,'south',['1m','2m','3m']);expect(s.melds.south[0]?.type).toBe('chi');expect(s.hands.south).toHaveLength(11);expect(s.discards.east).toHaveLength(0);expect(s.discardedFaces.east).toContain('3m');expect(s.currentSeat).toBe('south')});
 it('Open Kan consumes three, reveals Dora and gives a replacement',()=>{const s=callState();s.hands.south=tiles('3m 3m 3m 4p 5p 6p 7s 8s 9s P F C E');s.hands.south.filter(t=>t.face==='3m').forEach((t,i)=>t.id='3m-'+(i+1));discardTile(s,'east','3m-0');claimKan(s,'south');expect(s.melds.south[0]?.tiles).toHaveLength(4);expect(s.hands.south).toHaveLength(11);expect(s.deadWall.revealedDoraCount).toBe(2);expect(s.lastDrawSeat).toBe('south');expect(s.lastDrawSource).toBe('rinshan')});
 it('a call cancels every player Ippatsu',()=>{const s=callState();s.riichi.west.ippatsuEligible=true;discardTile(s,'east','3m-0');claimChi(s,'south',['1m','2m','3m']);expect(SEATS.every(x=>!s.riichi[x].ippatsuEligible)).toBe(true)});
 it('atamahane waits for the nearer Ron before accepting farther Ron',()=>{const s=callState();s.hands.east=tiles('C 1p 2p 3p 4p 5p 6p 7p 8p 9p S W N P');for(const seat of ['south','west'] as const)s.hands[seat]=tiles('1m 2m 3m 4p 5p 6p 7s 8s 9s E E E C');discardTile(s,'east','C-0');expect(getClaimOptions(s,'south')?.ron).toBe(true);expect(getClaimOptions(s,'west')?.ron).toBe(false);expect(()=>declareRon(s,'west')).toThrow();passClaim(s,'south');expect(getClaimOptions(s,'west')?.ron).toBe(true);declareRon(s,'west');expect(s.result?.winner).toBe('west')});
 it('a player may choose Chi over their own Pon',()=>{const s=callState();s.hands.south=tiles('1m 2m 3m 3m 4p 5p 6p 7s 8s 9s P F C');discardTile(s,'east','3m-0');expect(getClaimOptions(s,'south')?.pon).toBe(true);expect(getClaimOptions(s,'south')?.chiSequences).toContainEqual(['1m','2m','3m']);claimChi(s,'south',['1m','2m','3m']);expect(s.melds.south[0]?.type).toBe('chi')});
 it('closed Kan preserves Menzen and may declare Riichi with reduced concealed hand',()=>{const s=callState();const ts=tiles('2m 2m 2m 2m');s.melds.east=[{type:'kan',tiles:ts,calledTile:ts[0]!,from:'east',open:false}];s.hands.east=tiles('4p 5p 6p 7s 8s 9s E E E C 3p');expect(getRiichiDiscardIds(s,'east')).toContain(s.hands.east.at(-1)!.id);declareRiichiAndDiscard(s,'east',s.hands.east.at(-1)!.id);expect(s.riichi.east.declared).toBe(true)});
});

describe('Fu items and Ura gating',()=>{
 it.each([['2m',4],['1m',8],['P',8]] as const)('concealed %s triplet adds %d fu',(face,amount)=>{const r=calculateStandardFu({concealedFaces:faces(`${face} ${face} ${face} 4p 5p 6p 6s 7s 8s 2s 3s 4s 9p 9p`),melds:[],winningFace:'4s',method:'tsumo',closed:true,seatWind:'S',roundWind:'E'});expect(r?.items.find(x=>x.label.includes('triplet'))?.fu).toBe(amount);expect(r?.items.find(x=>x.label==='Tsumo')?.fu).toBe(2);expect(r?.fu).toBe(Math.ceil((22+amount)/10)*10)});
 it.each([['2m',2],['1m',4],['P',4]] as const)('open %s triplet adds %d fu',(face,amount)=>{const ts=tiles(`${face} ${face} ${face}`);const r=calculateStandardFu({concealedFaces:faces('4p 5p 6p 6s 7s 8s 2s 3s 4s 9p 9p'),melds:[{type:'pon',tiles:ts,calledTile:ts[0]!,from:'east',open:true}],winningFace:'4s',method:'ron',closed:false,seatWind:'S',roundWind:'E'});expect(r?.items.find(x=>x.label==='Open pon')?.fu).toBe(amount);expect(r?.items.some(x=>x.label==='Closed ron')).toBe(false)});
 it.each([['C',2],['S',2],['E',2],['N',0]] as const)('%s pair adds %d fu',(pair,amount)=>{const r=calculateStandardFu({concealedFaces:faces(`1m 2m 3m 4p 5p 6p 6s 7s 8s 2s 3s 4s ${pair} ${pair}`),melds:[],winningFace:'4s',method:'ron',closed:true,seatWind:'S',roundWind:'E'});expect(r?.items.find(x=>x.label==='Value pair')?.fu??0).toBe(amount)});
 it('open otherwise-20-Fu Ron becomes 30 Fu',()=>{const ts=tiles('1m 2m 3m');const r=calculateStandardFu({concealedFaces:faces('4p 5p 6p 6s 7s 8s 2s 3s 4s 9p 9p'),melds:[{type:'chi',tiles:ts,calledTile:ts[0]!,from:'east',open:true}],winningFace:'4s',method:'ron',closed:false,seatWind:'S',roundWind:'E'});expect(r?.rawFu).toBe(30);expect(r?.fu).toBe(30)});
 it.each([false,true])('Ura bonus requires Riichi=%s',(riichi)=>{const s=state();s.hands.east=tiles('2m 2m 2m 4p 5p 6p 7s 8s 9s E E E C C');s.deadWall.uraIndicators[0]=tiles('1m')[0]!;s.riichi.east.declared=riichi;const r=declareTsumo(s,'east');expect(r.dora.uraDora).toBe(riichi?3:0)});
});
