import { calculateShanten, improvingTiles, doraFromIndicator, SEATS, type Tile, type TileFace, type Seat } from '@bunny/riichi-engine';
import { visibleCounts } from './assistance.js';
import type { PlayerGameState } from './room.js';
export type BotDifficulty=import('./rules').RoomTier;
export const CHARACTER_BOT_PROFILE={yellow:'balanced',ninja:'aggressive',king:'balanced',wizard:'defensive'} as const;
export type BotProfile='aggressive'|'balanced'|'defensive';
export const BOT_PROFILES:Record<BotProfile,{defendAt:number;callTolerance:number;riichiUkeire:number;kanWall:number}>={aggressive:{defendAt:3,callTolerance:1,riichiUkeire:1,kanWall:10},balanced:{defendAt:1,callTolerance:0,riichiUkeire:3,kanWall:16},defensive:{defendAt:0,callTolerance:-1,riichiUkeire:5,kanWall:24}};
export type BotDecision = {type:'tsumo'|'ron'|'pass'|'draw'|'pon'|'kan'}|{type:'chi';faces:TileFace[]}|{type:'discard'|'riichi'|'ankan'|'kakan';tileId:string};
const simple=(f:TileFace)=>f.length===2&&Number(f[0])>1&&Number(f[0])<9;
/** Deterministic policy; exclusively consumes the player's private/public serialization. */
export function chooseBotAction(s:PlayerGameState,profile:BotProfile='balanced',difficulty:BotDifficulty='medium'):BotDecision|null {
 const strategy=BOT_PROFILES[profile],advanced=difficulty==='high'||difficulty==='master',master=difficulty==='master';
 const a=s.hand.actions,seat=s.you.seat,own=s.you.hand,faces=own.map(t=>t.face),melds=s.hand.melds[seat];
 const visible=visibleCounts(own,s.hand.discards,s.hand.melds,s.hand.doraIndicators);
 const threats=SEATS.filter(x=>x!==seat&&s.hand.riichi[x]);
 const seatWind=(['E','S','W','N'] as TileFace[])[(SEATS.indexOf(seat)-SEATS.indexOf(s.hand.match.dealer)+4)%4]!;
 const valueHonor=(f:TileFace)=>['P','F','C',seatWind,s.hand.match.roundWind==='east'?'E':'S'].includes(f);
 const hasYaku=(fs:TileFace[],ms=melds)=>{const all=[...fs,...ms.flatMap(m=>m.tiles.map(t=>t.face))];const suits=new Set(all.filter(f=>f.length===2).map(f=>f[1]));const flush=suits.size===1;return all.every(simple)||flush||ms.some(m=>m.type!=='chi'&&valueHonor(m.tiles[0]!.face))||fs.some(f=>valueHonor(f)&&fs.filter(x=>x===f).length>=3);};
 const basicRisk=(f:TileFace)=>threats.reduce((n,t)=>n+(s.hand.discards[t].some(x=>x.face===f)?0:f.length===1?Math.max(0,3-(visible.get(f)??0))*1.5:simple(f)?9:5),0);
 // High tier reads genbutsu, suji and visible walls; no hidden hands or live wall.
 const risk=(f:TileFace)=>{if(difficulty==='low')return 0;if(!advanced)return basicRisk(f);return threats.reduce((sum,t)=>{const river=s.hand.discards[t];if(river.some(x=>x.face===f))return sum;if(f.length===1)return sum+Math.max(0,3-(visible.get(f)??0))*1.5;const n=Number(f[0]),suit=f[1];let danger=simple(f)?9:5;const suji=[n-3,n+3].filter(x=>x>=1&&x<=9);if(suji.length&&suji.every(x=>river.some(v=>v.face===`${x}${suit}`)))danger*=.55;const blocked=[n-1,n+1].filter(x=>x>=1&&x<=9).some(x=>(visible.get(`${x}${suit}` as TileFace)??0)>=4);if(blocked)danger*=.65;return sum+danger;},0)};
 const dora=s.hand.doraIndicators.map(t=>doraFromIndicator(t.face));
 const tileValue=(t:Tile)=>Number(t.red)*2+dora.filter(f=>f===t.face).length*2;
 const rankDiscards=(tiles:Tile[],fixed:number,legal?:string[])=>tiles.filter(t=>!legal||legal.includes(t.id)).map(t=>{const rest=tiles.filter(x=>x.id!==t.id).map(x=>x.face);return {tile:t,rest,shanten:calculateShanten(rest,fixed),risk:risk(t.face),efficiency:0};}).sort((a,b)=>a.shanten-b.shanten||a.risk-b.risk||a.tile.id.localeCompare(b.tile.id));
 if(a.canTsumo)return{type:'tsumo'};if(a.canRon)return{type:'ron'};
 if(a.canPassClaim){
  if(a.canWinClaim&&!a.canRon)return null;
  if(!s.hand.claim)return{type:'pass'};
  const late=s.hand.wallRemaining<16;const finalRound=s.hand.match.handNumber===4&&(s.room.rules.matchLength==='tonpuusen'||s.hand.match.roundWind==='south');const leading=SEATS.every(x=>s.room.scores[seat]>=s.room.scores[x]);
  if(threats.length&&(profile!=='aggressive'||late||finalRound&&leading))return{type:'pass'};
  const called=s.hand.claim.tile;const baseline=calculateShanten(faces,melds.length);const choices:{decision:BotDecision;shanten:number;value:number}[]=[];
  const consider=(type:'chi'|'pon'|'kan',sequence:TileFace[])=>{const needed=[...sequence];needed.splice(needed.indexOf(called.face),1);const rest=[...own];for(const f of needed){const i=rest.findIndex(t=>t.face===f);if(i<0)return;rest.splice(i,1);}const ms=[...melds,{type,tiles:[...needed.map((face,i)=>({id:'preview'+i,face,copy:0 as const,red:false})),called],calledTile:called,from:s.hand.claim!.discarder,open:true}];if(!hasYaku(rest.map(t=>t.face),ms))return;const forbidden:TileFace[]=type==='kan'?[]:[called.face];if(type==='chi'){const n=Number(called.face[0]),suit=called.face[1];if(called.face===sequence[0]&&n+3<=9)forbidden.push(`${n+3}${suit}` as TileFace);if(called.face===sequence[2]&&n-3>=1)forbidden.push(`${n-3}${suit}` as TileFace);}const legal=rest.filter(t=>!forbidden.includes(t.face)).map(t=>t.id);const shanten=type==='kan'?calculateShanten(rest.map(t=>t.face),ms.length):rankDiscards(rest,ms.length,legal)[0]?.shanten??8;const value=(type!=='chi'&&valueHonor(called.face)?2:1)+(s.hand.yourDora.total>0?1:0)+(type==='kan'&&valueHonor(called.face)&&profile!=='defensive'?.35:0);if(shanten<baseline+(profile==='defensive'?0:strategy.callTolerance)||(shanten===baseline&&baseline>0&&value>=2&&profile!=='defensive'))choices.push({decision:type==='chi'?{type,faces:sequence}:{type},shanten,value});};
  for(const seq of a.chiSequences)consider('chi',seq);if(a.canPon)consider('pon',[called.face,called.face,called.face]);if(a.canKan&&s.hand.wallRemaining>strategy.kanWall)consider('kan',Array(4).fill(called.face));
  choices.sort((a,b)=>a.shanten-b.shanten||b.value-a.value);return choices[0]?.decision??{type:'pass'};
 }
 if(a.canDraw)return{type:'draw'};
 if(a.canDiscard){
  if(!threats.length&&s.hand.wallRemaining>strategy.kanWall){const baseline=calculateShanten(faces,melds.length);for(const id of [...a.ankanTileIds,...a.kakanTileIds]){const tile=own.find(t=>t.id===id)!;const closed=a.ankanTileIds.includes(id),rest=closed?own.filter(t=>t.face!==tile.face):own.filter(t=>t.id!==id);if(calculateShanten(rest.map(t=>t.face),melds.length+(closed?1:0))<=baseline)return{type:closed?'ankan':'kakan',tileId:id};}}
  const ranked=rankDiscards(own,melds.length,s.hand.discardTileIds);if(!ranked.length)return null;
  const finalRound=s.hand.match.handNumber===4,leading=SEATS.every(x=>s.room.scores[seat]>=s.room.scores[x]),late=s.hand.wallRemaining<20;
  const defendAt=master&&leading&&(finalRound||late)?0:strategy.defendAt;
  if(threats.length&&(ranked[0]!.shanten>=defendAt)){ranked.sort((a,b)=>a.risk-b.risk||a.shanten-b.shanten);return{type:'discard',tileId:ranked[0]!.tile.id};}
  const bestShanten=ranked[0]!.shanten;const candidates=ranked.filter(x=>x.shanten===bestShanten);for(const c of candidates)c.efficiency=difficulty==='low'?c.rest.reduce((n,f)=>n+c.rest.filter(x=>x===f).length,0):improvingTiles(c.rest,melds.length).reduce((n,f)=>n+Math.max(0,4-(visible.get(f)??0)),0);candidates.sort((a,b)=>(b.efficiency-(advanced?tileValue(b.tile)*1.5:0))-(a.efficiency-(advanced?tileValue(a.tile)*1.5:0))||a.risk-b.risk||Number(a.tile.red)-Number(b.tile.red)||a.tile.id.localeCompare(b.tile.id));if(master&&bestShanten>0&&candidates.length>1){
   // Bounded public-information one-draw search. At most2 candidates ×4 draws ×14 discards.
   const options=candidates.filter((c,i,all)=>all.findIndex(x=>x.tile.face===c.tile.face&&x.tile.red===c.tile.red)===i).slice(0,2),future=(rest:TileFace[])=>{const draws=improvingTiles(rest,melds.length).map(face=>({face,n:Math.max(0,4-(visible.get(face)??0))})).filter(x=>x.n).sort((a,b)=>b.n-a.n).slice(0,4);let total=0,weight=0;for(const {face,n} of draws){const next=[...rest,face];let shanten=9,shape=-Infinity;for(const drop of new Set(next)){const after=[...next];after.splice(after.indexOf(drop),1);const st=calculateShanten(after,melds.length),flex=after.reduce((v,f)=>v+after.filter(x=>x===f||f.length===2&&x[1]===f[1]&&Math.abs(Number(x[0])-Number(f[0]))<=2).length,0);if(st<shanten){shanten=st;shape=flex}else if(st===shanten)shape=Math.max(shape,flex)}total+=n*(shape-shanten*20);weight+=n}return weight?total/weight:0};const scores=new Map(options.map(c=>[c.tile.id,c.efficiency+future(c.rest)*.08-tileValue(c.tile)*1.5-c.risk*(leading&&finalRound?.6:.15)]));options.sort((a,b)=>scores.get(b.tile.id)!-scores.get(a.tile.id)!);candidates.splice(0,candidates.length,...options);
  }const best=candidates[0]!;
  // Do not lock a dangerous or nearly dead wait; preserve damaten when already valuable.
  if(a.riichiDiscardIds.includes(best.tile.id)&&best.efficiency>=strategy.riichiUkeire&&!threats.length&&s.hand.wallRemaining>=12&&!(hasYaku(best.rest)&&s.hand.yourDora.total>=3))return{type:'riichi',tileId:best.tile.id};
  return{type:'discard',tileId:best.tile.id};
 }
 return null;
}
