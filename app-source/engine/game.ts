import type {PhysicalWall} from './physical-wall.js';
import type { InitialDeal, Seat } from './deal.js';
import { SEATS } from './deal.js';
import type { Tile, TileFace } from './tiles.js';
import { evaluateWin, type WinEvaluation } from './yaku.js';
import { ALL_TILE_FACES, getWaits } from './tenpai.js';
import { drawRinshan, revealKanDora, visibleDoraIndicators, visibleUraIndicators, countDora, type DeadWallState } from './deadwall.js';
import { calculateKnownFu, calculateScore, type ScoreResult } from './scoring.js';
import { decomposeStandardFaces } from './decomposition.js';
import { calculateStandardFu, type FuBreakdown } from './fu.js';

export type HandPhase='awaiting_discard'|'awaiting_draw'|'awaiting_claim'|'won'|'exhaustive_draw'|'abortive_draw';
export type MeldType='chi'|'pon'|'kan';
export interface Meld { type:MeldType; tiles:Tile[]; calledTile:Tile; from:Seat; open?:boolean }
export interface WinResult { winner:Seat; method:'tsumo'|'ron'; from?:Seat; winningTile:Tile; evaluation:WinEvaluation; dora:{indicatorDora:number;akaDora:number;uraDora:number;total:number}; fu?:FuBreakdown; score:ScoreResult }
export interface ClaimOptions { ron:boolean; pon:boolean; kan:boolean; chiSequences:TileFace[][] }
export interface ClaimState { discarder:Seat; tile:Tile; options:Record<Seat,ClaimOptions>; passed:Seat[]; kind?:'discard'|'chankan'; kakanSeat?:Seat; kakanMeldIndex?:number }
export interface PlayerRiichiState { declared:boolean; doubleRiichi?:boolean; declarationTurn?:number; temporaryFuriten:boolean; riichiFuriten:boolean; ippatsuEligible:boolean }
export type AbortiveReason='nine_terminals'|'four_winds'|'four_riichi'|'four_kans'|'triple_ron'|'bankruptcy';
export interface HandState { firstTurnYakumanEnabled?:boolean; kuikaeEnabled?:boolean;postRiichiAnkanEnabled?:boolean;doubleRiichiEnabled?:boolean; discardRestriction?:{seat:Seat;faces:TileFace[]}; abortiveEnabled?:boolean;abortiveReason?:AbortiveReason;physicalWall?:PhysicalWall; dealerSeat:Seat; roundWind:TileFace; lastDrawSeat?:Seat; discardedFaces:Record<Seat,TileFace[]>; lastDrawSource?:'live'|'rinshan'; lastDrawWasLastLive:boolean; lastDiscardWasLastLive:boolean; hands:Record<Seat,Tile[]>; melds:Record<Seat,Meld[]>; liveWall:Tile[]; deadWall:DeadWallState; discards:Record<Seat,Tile[]>; currentSeat:Seat; phase:HandPhase; turnNumber:number; claim?:ClaimState; result?:WinResult; results?:WinResult[]; riichi:Record<Seat,PlayerRiichiState> }
export class GameActionError extends Error { constructor(public readonly code:string,message:string){super(message)} }
const windFace:Record<Seat,TileFace>={east:'E',south:'S',west:'W',north:'N'};
export function getSeatWind(state:Pick<HandState,'dealerSeat'>,seat:Seat):TileFace{const dealerIndex=SEATS.indexOf(state.dealerSeat),seatIndex=SEATS.indexOf(seat),offset=(seatIndex-dealerIndex+4)%4;return (['E','S','W','N'] as TileFace[])[offset]!}
const blankRiichi=():PlayerRiichiState=>({declared:false,temporaryFuriten:false,riichiFuriten:false,ippatsuEligible:false});
const blankMelds=():Record<Seat,Meld[]>=>({east:[],south:[],west:[],north:[]});
export function createHandState(deal:InitialDeal,dealerSeat:Seat='east',roundWind:TileFace='E'):HandState{return{...(deal.physicalWall?{physicalWall:deal.physicalWall}:{}),dealerSeat,roundWind,lastDrawSeat:dealerSeat,discardedFaces:{east:[],south:[],west:[],north:[]},lastDrawWasLastLive:false,lastDiscardWasLastLive:false,hands:{east:[...deal.hands.east],south:[...deal.hands.south],west:[...deal.hands.west],north:[...deal.hands.north]},melds:blankMelds(),liveWall:[...deal.liveWall],deadWall:{...deal.deadWall,tiles:[...deal.deadWall.tiles],rinshan:[...deal.deadWall.rinshan],doraIndicators:[...deal.deadWall.doraIndicators],uraIndicators:[...deal.deadWall.uraIndicators]},discards:{east:[],south:[],west:[],north:[]},currentSeat:dealerSeat,phase:'awaiting_discard',turnNumber:1,riichi:{east:blankRiichi(),south:blankRiichi(),west:blankRiichi(),north:blankRiichi()}}}
export function nextSeat(seat:Seat):Seat{return SEATS[(SEATS.indexOf(seat)+1)%4]!}
export function drawTile(state:HandState,seat:Seat):Tile{requireTurn(state,seat,'awaiting_draw');if(!state.liveWall.length)throw new GameActionError('WALL_EMPTY','No tiles remain in the live wall.');const tile=state.liveWall.shift();if(!tile){throw new GameActionError('WALL_EMPTY','No tiles remain in the live wall.')}state.hands[seat].push(tile);state.riichi[seat].temporaryFuriten=false;state.lastDrawSeat=seat;state.lastDrawSource='live';state.lastDrawWasLastLive=state.liveWall.length===0;state.phase='awaiting_discard';return tile}
export function discardTile(state:HandState,seat:Seat,tileId:string):Tile{return performDiscard(state,seat,tileId)}
export function declareRiichiAndDiscard(state:HandState,seat:Seat,tileId:string):Tile{requireTurn(state,seat,'awaiting_discard');if(state.melds[seat].some(m=>m.open!==false))throw new GameActionError('OPEN_HAND','Riichi requires a closed hand.');if(state.riichi[seat].declared)throw new GameActionError('ALREADY_RIICHI','Riichi has already been declared.');if(state.liveWall.length<4)throw new GameActionError('RIICHI_TOO_LATE','Riichi cannot be declared with fewer than four live-wall tiles remaining.');const hand=state.hands[seat],idx=hand.findIndex(t=>t.id===tileId);if(idx<0)throw new GameActionError('TILE_NOT_IN_HAND','That tile is not in your hand.');if(waitsForHand(state,seat,hand.filter((_,i)=>i!==idx)).length===0)throw new GameActionError('NOT_TENPAI','Riichi requires tenpai after the discard.');state.riichi[seat].doubleRiichi=Boolean(state.doubleRiichiEnabled&&state.discardedFaces[seat].length===0&&SEATS.every(s=>state.melds[s].length===0));state.riichi[seat].declared=true;state.riichi[seat].declarationTurn=state.turnNumber;state.riichi[seat].ippatsuEligible=true;return performDiscard(state,seat,tileId)}
function performDiscard(state:HandState,seat:Seat,tileId:string):Tile{requireTurn(state,seat,'awaiting_discard');const original=state.hands[seat];if(state.discardRestriction?.seat===seat&&state.discardRestriction.faces.includes(original.find(t=>t.id===tileId)?.face as TileFace))throw new GameActionError('KUIKAE','This tile cannot be discarded immediately after the call.');if(state.riichi[seat].declared&&state.riichi[seat].declarationTurn!==state.turnNumber&&original[original.length-1]?.id!==tileId)throw new GameActionError('RIICHI_LOCKED','After Riichi only the drawn tile may be discarded.');if(!original.some(t=>t.id===tileId))throw new GameActionError('TILE_NOT_IN_HAND','That tile is not in your hand.');if(state.riichi[seat].ippatsuEligible&&state.riichi[seat].declarationTurn!==state.turnNumber)state.riichi[seat].ippatsuEligible=false;const hand=state.hands[seat],index=hand.findIndex(t=>t.id===tileId);if(index<0)throw new GameActionError('TILE_NOT_IN_HAND','That tile is not in your hand.');const[tile]=hand.splice(index,1);delete state.discardRestriction;state.discards[seat].push(tile!);state.discardedFaces[seat].push(tile!.face);delete state.lastDrawSeat;state.lastDiscardWasLastLive=state.lastDrawSource==='live'&&state.lastDrawWasLastLive;state.turnNumber+=1;const options=buildClaimOptions(state,seat,tile!);if(SEATS.some(s=>hasClaim(options[s]))){state.phase='awaiting_claim';state.claim={discarder:seat,tile:tile!,options,passed:[]};}else advanceAfterDiscard(state,seat);return tile!}
function buildClaimOptions(state:HandState,discarder:Seat,tile:Tile):Record<Seat,ClaimOptions>{const out={} as Record<Seat,ClaimOptions>;for(const s of SEATS){const none:ClaimOptions={ron:false,pon:false,kan:false,chiSequences:[]};if(s===discarder){out[s]=none;continue}const same=state.hands[s].filter(t=>t.face===tile.face).length;out[s]={ron:evaluateRon(state,s,tile).legal,pon:state.liveWall.length>0&&same>=2&&!state.riichi[s].declared,kan:state.liveWall.length>0&&state.deadWall.rinshan.length>0&&same>=3&&!state.riichi[s].declared,chiSequences:state.liveWall.length>0&&s===nextSeat(discarder)&&!state.riichi[s].declared?findChiSequences(state.hands[s],tile.face).filter(seq=>!state.kuikaeEnabled||chiLeavesLegalDiscard(state.hands[s],seq,tile.face)):[]};}return out}
function hasClaim(o:ClaimOptions){return o.ron||o.pon||o.kan||o.chiSequences.length>0}
export function getClaimOptions(state:HandState,seat:Seat):ClaimOptions|null{if(state.phase!=='awaiting_claim'||!state.claim||state.claim.passed.includes(seat))return null;const own=state.claim.options[seat];if(!own||!hasClaim(own))return null;const ronPending=SEATS.some(s=>s!==seat&&state.claim!.options[s].ron&&!state.claim!.passed.includes(s));const pkPending=SEATS.some(s=>s!==seat&&(state.claim!.options[s].pon||state.claim!.options[s].kan)&&!state.claim!.passed.includes(s));const order=[nextSeat(state.claim.discarder),nextSeat(nextSeat(state.claim.discarder)),nextSeat(nextSeat(nextSeat(state.claim.discarder)))];const ron=own.ron&&!order.slice(0,order.indexOf(seat)).some(s=>state.claim!.options[s].ron&&!state.claim!.passed.includes(s));return{...own,ron,pon:own.pon&&!ronPending,kan:own.kan&&!ronPending,chiSequences:(!ronPending&&!pkPending)?own.chiSequences:[]}}
export function passClaim(state:HandState,seat:Seat):void{if(state.phase!=='awaiting_claim'||!state.claim)throw new GameActionError('NO_CLAIM_WINDOW','There is no claim to pass.');const opt=state.claim.options[seat];if(!opt||!hasClaim(opt))throw new GameActionError('NOT_ELIGIBLE','You have no claim.');if(!state.claim.passed.includes(seat)){state.claim.passed.push(seat);if(opt.ron){if(state.riichi[seat].declared)state.riichi[seat].riichiFuriten=true;else state.riichi[seat].temporaryFuriten=true;}}if(SEATS.every(s=>s===state.claim!.discarder||state.claim!.passed.includes(s)||!hasClaim(state.claim!.options[s]))){const c=state.claim!;if(c.kind==='chankan'&&c.kakanSeat!==undefined&&c.kakanMeldIndex!==undefined)finalizeKakan(state,c.kakanSeat,c.kakanMeldIndex,c.tile);else advanceAfterDiscard(state,c.discarder)}}
export const passRon=passClaim;
export function claimPon(state:HandState,seat:Seat):void{claimMeld(state,seat,'pon')}
export function claimKan(state:HandState,seat:Seat):void{claimMeld(state,seat,'kan')}
export function claimChi(state:HandState,seat:Seat,faces:TileFace[]):void{const opt=requireClaimAvailable(state,seat);if(!opt.chiSequences.some(x=>sameFaces(x,faces)))throw new GameActionError('CHI_NOT_AVAILABLE','That Chi is not available.');const claim=state.claim!;const needed=[...faces];const calledIdx=needed.indexOf(claim.tile.face);if(calledIdx<0)throw new GameActionError('INVALID_CHI','Sequence must include the called tile.');needed.splice(calledIdx,1);const used=takeFaces(state.hands[seat],needed);finishMeld(state,seat,{type:'chi',tiles:[...used,claim.tile],calledTile:claim.tile,from:claim.discarder,open:true})}
function claimMeld(state:HandState,seat:Seat,type:'pon'|'kan'){const opt=requireClaimAvailable(state,seat);if(!opt[type])throw new GameActionError(type==='pon'?'PON_NOT_AVAILABLE':'KAN_NOT_AVAILABLE',`${type.toUpperCase()} is not available.`);const claim=state.claim!;const count=type==='pon'?2:3;const used=takeFaces(state.hands[seat],Array(count).fill(claim.tile.face));finishMeld(state,seat,{type,tiles:[...used,claim.tile],calledTile:claim.tile,from:claim.discarder,open:true});if(type==='kan'){const replacement=drawRinshan(state.deadWall); state.hands[seat].push(replacement); state.lastDrawSeat=seat;state.riichi[seat].temporaryFuriten=false;state.lastDrawSource='rinshan'; state.lastDrawWasLastLive=false; replenishDeadWall(state,replacement); revealKanDora(state.deadWall)}}
export function getAnkanTileIds(state:HandState,seat:Seat):string[]{
  if(state.phase!=='awaiting_discard'||state.currentSeat!==seat||state.lastDrawSeat!==seat||(state.deadWall.rinshan.length===0||state.liveWall.length===0))return[];
  const byFace=new Map<TileFace,Tile[]>(); for(const t of state.hands[seat]){const a=byFace.get(t.face)??[];a.push(t);byFace.set(t.face,a)}
  if(state.riichi[seat].declared){
    if(!state.postRiichiAnkanEnabled||state.lastDrawSeat!==seat)return[];
    const drawn=state.hands[seat].at(-1)!;
    return [...byFace.values()].filter(a=>a.length===4&&a[0]!.face===drawn.face&&riichiAnkanPreservesStructure(state,seat,drawn.face)).map(a=>a[0]!.id);
  }
  return [...byFace.values()].filter(a=>a.length===4).map(a=>a[0]!.id);
}
function riichiAnkanPreservesStructure(state:HandState,seat:Seat,face:TileFace):boolean{
 const before=state.hands[seat].slice(0,-1),waits=waitsForHand(state,seat,before);
 if(!waits.length||waits.includes(face))return false;
 const reduced=state.hands[seat].filter(t=>t.face!==face),ms=state.melds[seat];
 for(const wait of waits){const old=decomposeStandardFaces([...before.map(t=>t.face),wait],4-ms.length);
  if(!old.length||old.some(d=>!d.groups.some(g=>g.type==='triplet'&&g.faces[0]===face)))return false;
 }
 const physical=[...reduced,...ms.flatMap(m=>m.tiles),...state.hands[seat].filter(t=>t.face===face)];
 const after=ALL_TILE_FACES.filter(wait=>physical.filter(t=>t.face===wait).length<4&&decomposeStandardFaces([...reduced.map(t=>t.face),wait],3-ms.length).length>0);
 return waits.length===after.length&&waits.every(w=>after.includes(w));
}
export function getLegalDiscardIds(state:HandState,seat:Seat):string[]{
 if(state.currentSeat!==seat||state.phase!=='awaiting_discard')return[];
 const hand=state.hands[seat],locked=state.riichi[seat].declared&&state.riichi[seat].declarationTurn!==state.turnNumber;
 return hand.filter(t=>(!locked||t.id===hand.at(-1)?.id)&&!(state.discardRestriction?.seat===seat&&state.discardRestriction.faces.includes(t.face))).map(t=>t.id);
}
export function declareAnkan(state:HandState,seat:Seat,tileId:string):void{
  requireTurn(state,seat,'awaiting_discard'); const tile=state.hands[seat].find(t=>t.id===tileId); if(!tile||!getAnkanTileIds(state,seat).includes(tileId))throw new GameActionError('ANKAN_NOT_AVAILABLE','Closed Kan is not available.');
  const used=takeFaces(state.hands[seat],Array(4).fill(tile.face)); for(const s of SEATS)state.riichi[s].ippatsuEligible=false;
  state.melds[seat].push({type:'kan',tiles:used,calledTile:used[0]!,from:seat,open:false}); completeOwnKan(state,seat);
}
export function getKakanTileIds(state:HandState,seat:Seat):string[]{
  if(state.phase!=='awaiting_discard'||state.currentSeat!==seat||state.lastDrawSeat!==seat||(state.deadWall.rinshan.length===0||state.liveWall.length===0)||state.riichi[seat].declared)return[];
  const ponFaces=new Set(state.melds[seat].filter(m=>m.type==='pon'&&m.open!==false).map(m=>m.tiles[0]!.face)); return state.hands[seat].filter(t=>ponFaces.has(t.face)).map(t=>t.id);
}
export function declareKakan(state:HandState,seat:Seat,tileId:string):void{
  requireTurn(state,seat,'awaiting_discard'); const tile=state.hands[seat].find(t=>t.id===tileId); if(!tile||!getKakanTileIds(state,seat).includes(tileId))throw new GameActionError('KAKAN_NOT_AVAILABLE','Added Kan is not available.');
  const meldIndex=state.melds[seat].findIndex(m=>m.type==='pon'&&m.open!==false&&m.tiles[0]?.face===tile.face); if(meldIndex<0)throw new GameActionError('KAKAN_NOT_AVAILABLE','No matching Pon exists.');
  const options={} as Record<Seat,ClaimOptions>; for(const s of SEATS){const none:ClaimOptions={ron:false,pon:false,kan:false,chiSequences:[]};options[s]=s===seat?none:{...none,ron:evaluateRon(state,s,tile,true).legal};}
  if(SEATS.some(s=>options[s].ron)){state.phase='awaiting_claim';state.claim={discarder:seat,tile,options,passed:[],kind:'chankan',kakanSeat:seat,kakanMeldIndex:meldIndex};return;}
  finalizeKakan(state,seat,meldIndex,tile);
}
function finalizeKakan(state:HandState,seat:Seat,meldIndex:number,tile:Tile):void{
  const i=state.hands[seat].findIndex(t=>t.id===tile.id); if(i<0)throw new GameActionError('KAKAN_TILE_MISSING','Added Kan tile is missing.'); state.hands[seat].splice(i,1);
  const meld=state.melds[seat][meldIndex]; if(!meld||meld.type!=='pon')throw new GameActionError('KAKAN_MELD_MISSING','Pon to upgrade is missing.'); meld.type='kan';meld.tiles.push(tile);meld.open=true;
  for(const s of SEATS)state.riichi[s].ippatsuEligible=false; completeOwnKan(state,seat);
}
function replenishDeadWall(state:HandState,replacement:Tile):void{const i=state.deadWall.tiles.findIndex(t=>t.id===replacement.id);if(i>=0)state.deadWall.tiles.splice(i,1);const tile=state.liveWall.pop();if(tile)state.deadWall.tiles.push(tile);}
function completeOwnKan(state:HandState,seat:Seat):void{
  const replacement=drawRinshan(state.deadWall);state.hands[seat].push(replacement);state.lastDrawSeat=seat;state.riichi[seat].temporaryFuriten=false;state.lastDrawSource='rinshan';state.lastDrawWasLastLive=false;replenishDeadWall(state,replacement);revealKanDora(state.deadWall);delete state.claim;state.currentSeat=seat;state.phase='awaiting_discard';
}
function requireClaimAvailable(state:HandState,seat:Seat):ClaimOptions{const o=getClaimOptions(state,seat);if(!o)throw new GameActionError('CLAIM_NOT_AVAILABLE','This claim is not currently available because a higher-priority claim is pending or you are not eligible.');return o}
function finishMeld(state:HandState,seat:Seat,meld:Meld){delete state.lastDrawSeat;for(const s of SEATS)state.riichi[s].ippatsuEligible=false;const claim=state.claim!;if(claim.options[seat].ron){if(state.riichi[seat].declared)state.riichi[seat].riichiFuriten=true;else state.riichi[seat].temporaryFuriten=true;}const pile=state.discards[claim.discarder];if(pile[pile.length-1]?.id===claim.tile.id)pile.pop();if(state.kuikaeEnabled&&meld.type!=='kan'){
 const faces:TileFace[]=[meld.calledTile.face];
 if(meld.type==='chi'){const seq=meld.tiles.map(t=>t.face).sort(),called=meld.calledTile.face,n=Number(called[0]),suit=called[1];
  if(called===seq[0]&&n+3<=9)faces.push(`${n+3}${suit}` as TileFace);
  if(called===seq[2]&&n-3>=1)faces.push(`${n-3}${suit}` as TileFace);
 }
 state.discardRestriction={seat,faces};
 }
 state.melds[seat].push(meld);delete state.claim;state.currentSeat=seat;state.phase='awaiting_discard'}
function takeFaces(hand:Tile[],faces:TileFace[]):Tile[]{const used:Tile[]=[];for(const f of faces){const i=hand.findIndex(t=>t.face===f);if(i<0)throw new GameActionError('MISSING_MELD_TILE','Required meld tile is not in hand.');used.push(hand.splice(i,1)[0]!)}return used}
function chiLeavesLegalDiscard(hand:Tile[],sequence:TileFace[],called:TileFace):boolean{
 const remaining=hand.map(t=>t.face),needed=[...sequence];needed.splice(needed.indexOf(called),1);
 for(const face of needed){const i=remaining.indexOf(face);if(i<0)return false;remaining.splice(i,1);}
 const forbidden=[called],n=Number(called[0]),suit=called[1];
 if(called===sequence[0]&&n+3<=9)forbidden.push(`${n+3}${suit}` as TileFace);
 if(called===sequence[2]&&n-3>=1)forbidden.push(`${n-3}${suit}` as TileFace);
 return remaining.some(face=>!forbidden.includes(face));
}
function findChiSequences(hand:Tile[],face:TileFace):TileFace[][]{if(face.length!==2||!/[mps]$/.test(face))return[];const suit=face[1],n=Number(face[0]);const have=new Set(hand.map(t=>t.face));const out:TileFace[][]=[];for(const start of [n-2,n-1,n]){if(start<1||start>7)continue;const seq=[`${start}${suit}`,`${start+1}${suit}`,`${start+2}${suit}`] as TileFace[];if(seq.filter(f=>f!==face).every(f=>have.has(f)))out.push(seq)}return out}
function sameFaces(a:TileFace[],b:TileFace[]){return a.length===b.length&&a.every((x,i)=>x===b[i])}
function firstTurnWinContext(state:HandState,seat:Seat):{tenhou:boolean;chiihou:boolean}{
 const first=Boolean(state.firstTurnYakumanEnabled&&state.discardedFaces[seat].length===0&&SEATS.every(s=>state.melds[s].length===0));
 return {tenhou:first&&seat===state.dealerSeat&&SEATS.every(s=>state.discardedFaces[s].length===0),chiihou:first&&seat!==state.dealerSeat&&state.lastDrawSource==='live'};
}
export function declareTsumo(state:HandState,seat:Seat):WinResult{requireTurn(state,seat,'awaiting_discard');if(state.lastDrawSeat!==seat)throw new GameActionError('NO_DRAW','Tsumo requires a draw.');const all=tilesForWin(state,seat);if(all.length!==14)throw new GameActionError('INVALID_HAND_SIZE','Tsumo requires a complete hand.');const winningTile=state.hands[seat][state.hands[seat].length-1]!;const ev=evaluateWin(all,{method:'tsumo',bonusHan:bonusHanForWin(state,seat,undefined,true),...firstTurnWinContext(state,seat),winningFace:winningTile.face,seatWind:getSeatWind(state,seat),roundWind:state.roundWind,closed:state.melds[seat].every(m=>m.open===false),melds:state.melds[seat],riichi:state.riichi[seat].declared,doubleRiichi:state.riichi[seat].doubleRiichi,ippatsu:state.riichi[seat].ippatsuEligible,haitei:state.lastDrawSource==='live'&&state.lastDrawWasLastLive,rinshan:state.lastDrawSource==='rinshan'});if(!ev.legal)throw new GameActionError(ev.reason??'ILLEGAL_WIN','This hand cannot Tsumo.');const result=buildWinResult(state,seat,'tsumo',winningTile,ev);state.result=result;state.phase='won';return result}
/** Resolve accepted Ron intents together, independent of message arrival order. */
export function declareRons(state:HandState,seats:Seat[]):WinResult[]{
 if(state.phase!=='awaiting_claim'||!state.claim)throw new GameActionError('NO_CLAIM_WINDOW','There is no claim.');
 const claim=state.claim,order=[nextSeat(claim.discarder),nextSeat(nextSeat(claim.discarder)),nextSeat(nextSeat(nextSeat(claim.discarder)))];
 const winners=[...new Set(seats)].sort((a,b)=>order.indexOf(a)-order.indexOf(b));
 if(!winners.length||winners.some(s=>!claim.options[s].ron||claim.passed.includes(s)))throw new GameActionError('RON_NOT_AVAILABLE','Ron is not legal.');
 if(winners.length===3){state.phase='abortive_draw';state.abortiveReason='triple_ron';delete state.claim;return [];}
 const results=winners.map(seat=>{const ev=evaluateRon(state,seat,claim.tile,claim.kind==='chankan',true);if(!ev.legal)throw new GameActionError(ev.reason??'ILLEGAL_WIN','This hand cannot Ron.');return buildWinResult(state,seat,'ron',claim.tile,ev,claim.discarder)});
 state.result=results[0];state.results=results;state.phase='won';return results;
}
export function declareRon(state:HandState,seat:Seat):WinResult{const opt=getClaimOptions(state,seat);if(!opt?.ron)throw new GameActionError('RON_NOT_AVAILABLE','Ron is not available.');const order=[nextSeat(state.claim!.discarder),nextSeat(nextSeat(state.claim!.discarder)),nextSeat(nextSeat(nextSeat(state.claim!.discarder)))];if(order.slice(0,order.indexOf(seat)).some(s=>state.claim!.options[s].ron&&!state.claim!.passed.includes(s)))throw new GameActionError('RON_PRIORITY','A closer Ron claim is pending.');const tile=state.claim!.tile;const ev=evaluateRon(state,seat,tile,state.claim!.kind==='chankan',true);if(!ev.legal)throw new GameActionError(ev.reason??'ILLEGAL_WIN','This hand cannot Ron.');const result=buildWinResult(state,seat,'ron',tile,ev,state.claim!.discarder);state.result=result;state.phase='won';return result}

function buildWinResult(state:HandState,seat:Seat,method:'tsumo'|'ron',winningTile:Tile,ev:WinEvaluation,from?:Seat):WinResult{
  const own=[...state.hands[seat]]; if(method==='ron')own.push(winningTile);
  const all=[...own,...state.melds[seat].flatMap(m=>m.tiles.slice(0,3))];
  const physical=[...own,...state.melds[seat].flatMap(m=>m.tiles)];
  const visible=countDora(physical,visibleDoraIndicators(state.deadWall));
  const ura=state.riichi[seat].declared?countDora(physical,visibleUraIndicators(state.deadWall)).indicatorDora:0;
  const dora={indicatorDora:visible.indicatorDora,akaDora:visible.akaDora,uraDora:ura,total:visible.total+ura};
  let fu:FuBreakdown|undefined; let fuValue=0;
  if(ev.shape==='standard'){
    fu=ev.fu??calculateStandardFu({concealedFaces:own.map(t=>t.face),melds:state.melds[seat],winningFace:winningTile.face,method,closed:state.melds[seat].every(m=>m.open===false),seatWind:getSeatWind(state,seat),roundWind:state.roundWind,pinfu:ev.yaku.some(y=>y.id==='pinfu')})??undefined;
    if(!fu)throw new GameActionError('FU_UNRESOLVED','Could not resolve fu for this winning hand.'); fuValue=fu.fu;
  } else fuValue=calculateKnownFu({shape:ev.shape!,method,closed:state.melds[seat].every(m=>m.open===false)})??0;
  const totalHan=ev.yakuman?0:ev.han+dora.total;
  const score=calculateScore(totalHan,fuValue,seat===state.dealerSeat,method,ev.yakuman);
  return {winner:seat,method,...(from?{from}:{}),winningTile,evaluation:ev,dora,...(fu?{fu}:{}),score};
}

export function getTsumoEvaluation(state:HandState,seat:Seat):WinEvaluation|null{if(state.phase!=='awaiting_discard'||state.currentSeat!==seat||state.lastDrawSeat!==seat)return null;const all=tilesForWin(state,seat);if(all.length!==14)return null;const winningTile=state.hands[seat][state.hands[seat].length-1]!;return evaluateWin(all,{method:'tsumo',bonusHan:bonusHanForWin(state,seat),...firstTurnWinContext(state,seat),winningFace:winningTile.face,seatWind:getSeatWind(state,seat),roundWind:state.roundWind,closed:state.melds[seat].every(m=>m.open===false),melds:state.melds[seat],riichi:state.riichi[seat].declared,doubleRiichi:state.riichi[seat].doubleRiichi,ippatsu:state.riichi[seat].ippatsuEligible,haitei:state.lastDrawSource==='live'&&state.lastDrawWasLastLive,rinshan:state.lastDrawSource==='rinshan'})}
export function getRiichiDiscardIds(state:HandState,seat:Seat):string[]{if(state.melds[seat].some(m=>m.open!==false)||state.phase!=='awaiting_discard'||state.currentSeat!==seat||state.riichi[seat].declared||state.liveWall.length<4)return[];return state.hands[seat].filter((_,i)=>waitsForHand(state,seat,state.hands[seat].filter((__,j)=>j!==i)).length>0).map(t=>t.id)}
function waitsForHand(state:HandState,seat:Seat,hand:Tile[]):TileFace[]{const ms=state.melds[seat];if(!ms.length)return getWaits(hand);if(hand.length!==(4-ms.length)*3+1)return[];const all=[...hand,...ms.flatMap(m=>m.tiles)];return ALL_TILE_FACES.filter(face=>all.filter(t=>t.face===face).length<4&&decomposeStandardFaces([...hand.map(t=>t.face),face],4-ms.length).length>0);}
export function getPlayerWaits(state:HandState,seat:Seat):TileFace[]{return waitsForHand(state,seat,state.hands[seat])}
export function isPermanentFuriten(state:HandState,seat:Seat):boolean{const waits=new Set(getPlayerWaits(state,seat));return state.discardedFaces[seat].some(f=>waits.has(f))||state.discards[seat].some(t=>waits.has(t.face))}
export function isFuriten(state:HandState,seat:Seat):boolean{return isPermanentFuriten(state,seat)||state.riichi[seat].temporaryFuriten||state.riichi[seat].riichiFuriten}
function evaluateRon(state:HandState,seat:Seat,tile:Tile,chankan=false,confirmed=false):WinEvaluation{if(isFuriten(state,seat))return{legal:false,yaku:[],han:0,yakuman:0,reason:'FURITEN'};const all=[...state.hands[seat],tile,...state.melds[seat].flatMap(m=>m.tiles.slice(0,3))];return evaluateWin(all,{method:'ron',bonusHan:bonusHanForWin(state,seat,tile,confirmed),winningFace:tile.face,seatWind:getSeatWind(state,seat),roundWind:state.roundWind,closed:state.melds[seat].every(m=>m.open===false),melds:state.melds[seat],riichi:state.riichi[seat].declared,doubleRiichi:state.riichi[seat].doubleRiichi,ippatsu:state.riichi[seat].ippatsuEligible,houtei:!chankan&&state.lastDiscardWasLastLive,chankan})}
function bonusHanForWin(state:HandState,seat:Seat,claimed?:Tile,confirmed=false):number{
 const physical=[...state.hands[seat],...(claimed?[claimed]:[]),...state.melds[seat].flatMap(m=>m.tiles)];
 return countDora(physical,visibleDoraIndicators(state.deadWall)).total+(confirmed&&state.riichi[seat].declared?countDora(physical,visibleUraIndicators(state.deadWall)).indicatorDora:0);
}
function tilesForWin(state:HandState,seat:Seat):Tile[]{return [...state.hands[seat],...state.melds[seat].flatMap(m=>m.tiles.slice(0,3))]}
function advanceAfterDiscard(state:HandState,discarder:Seat){if(state.abortiveEnabled){
 const noCalls=SEATS.every(s=>state.melds[s].length===0),first=SEATS.map(s=>state.discardedFaces[s]);
 const winds=['E','S','W','N'];const kans=SEATS.flatMap(s=>state.melds[s].filter(m=>m.type==='kan').map(()=>s));
 const reason:AbortiveReason|undefined=noCalls&&first.every(h=>h.length===1)&&winds.includes(first[0]![0]!)&&first.every(h=>h[0]===first[0]![0])?'four_winds':SEATS.every(s=>state.riichi[s].declared)?'four_riichi':kans.length===4&&new Set(kans).size>1?'four_kans':undefined;
 if(reason){state.phase='abortive_draw';state.abortiveReason=reason;delete state.claim;return;}
}delete state.claim;state.currentSeat=nextSeat(discarder);state.phase=state.liveWall.length===0?'exhaustive_draw':'awaiting_draw'}
function requireTurn(state:HandState,seat:Seat,phase:HandPhase){if(state.phase==='won'||state.phase==='exhaustive_draw'||state.phase==='abortive_draw')throw new GameActionError('HAND_ENDED','This hand has ended.');if(state.currentSeat!==seat)throw new GameActionError('NOT_YOUR_TURN',`It is ${state.currentSeat}'s turn.`);if(state.phase!==phase)throw new GameActionError('WRONG_ACTION_PHASE',`Expected ${state.phase}.`)}

export function getVisibleDora(state:HandState):Tile[]{return visibleDoraIndicators(state.deadWall)}
export function getBonusDoraForSeat(state:HandState,seat:Seat){const tiles=[...state.hands[seat],...state.melds[seat].flatMap(m=>m.tiles)];return countDora(tiles,getVisibleDora(state));}

export function canDeclareNineTerminals(state:HandState,seat:Seat):boolean{return Boolean(state.abortiveEnabled&&state.phase==='awaiting_discard'&&state.currentSeat===seat&&state.discardedFaces[seat].length===0&&SEATS.every(s=>state.melds[s].length===0)&&SEATS.reduce((n,s)=>n+state.discardedFaces[s].length,0)<4&&new Set(state.hands[seat].filter(t=>t.face.length===1||t.face[0]==='1'||t.face[0]==='9').map(t=>t.face)).size>=9);}
export function declareNineTerminals(state:HandState,seat:Seat):void{requireTurn(state,seat,'awaiting_discard');if(!canDeclareNineTerminals(state,seat))throw new GameActionError('ABORTIVE_NOT_AVAILABLE','Nine terminals is not available.');state.phase='abortive_draw';state.abortiveReason='nine_terminals';delete state.lastDrawSeat;}
