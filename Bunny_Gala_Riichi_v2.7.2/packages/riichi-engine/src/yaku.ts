import type { Tile, TileFace } from './tiles.js';
import type { Meld } from './game.js';
import { calculateStandardFu, possibleWaitTypes, type FuBreakdown, type WaitType } from './fu.js';
import { calculateScore } from './scoring.js';
import type { StandardDecomposition } from './decomposition.js';
import { detectAgari } from './agari.js';
import { decomposeStandardFaces, isTerminalOrHonor } from './decomposition.js';

export type WinMethod = 'tsumo' | 'ron';
export type YakuId = 'tenhou'|'chiihou'|'riichi'|'double_riichi'|'menzen_tsumo'|'tanyao'|'yakuhai'|'chiitoitsu'|'kokushi'|'toitoi'|'iipeikou'|'sanshoku_doujun'|'ittsu'|'honitsu'|'chinitsu'|'honroutou'|'ippatsu'|'haitei'|'houtei'|'rinshan_kaihou'|'chankan'|'pinfu'|'daisangen'|'tsuuiisou'|'chinroutou'|'shousangen'|'sanankou'|'suuankou'|'ryanpeikou'|'chanta'|'junchan'|'chuuren'|'sanshoku_doukou'|'sankantsu'|'suukantsu'|'shousuushi'|'daisuushi'|'ryuuiisou';
export interface Yaku { id:YakuId; name:string; han:number; yakuman?:number }
export interface WinContext { method:WinMethod; bonusHan?:number;seatWind:TileFace; roundWind?:TileFace; winningFace?:TileFace; closed?:boolean; tenhou?:boolean;chiihou?:boolean;riichi?:boolean; doubleRiichi?:boolean|undefined; ippatsu?:boolean; haitei?:boolean; houtei?:boolean; rinshan?:boolean; chankan?:boolean; melds?:Meld[]; decomposition?:StandardDecomposition; waitType?:WaitType; shapeOverride?:'standard'|'chiitoitsu' }
export interface WinEvaluation { legal:boolean; shape?:'standard'|'chiitoitsu'|'kokushi'; yaku:Yaku[]; han:number; yakuman:number; reason?:string; fu?:FuBreakdown }
const HONORS=new Set<TileFace>(['E','S','W','N','P','F','C']); const TERMINALS=new Set<TileFace>(['1m','9m','1p','9p','1s','9s']);
export function evaluateWin(tiles:readonly Tile[],ctx:WinContext):WinEvaluation{
 const heavenly:Yaku[]=(ctx.method==='tsumo'&&ctx.closed!==false)?ctx.tenhou?[{id:'tenhou',name:'Tenhou',han:0,yakuman:1}]:ctx.chiihou?[{id:'chiihou',name:'Chiihou',han:0,yakuman:1}]:[]:[];
 const melds=ctx.melds??[];
 const facesAll=tiles.map(t=>t.face); const concealed=[...facesAll];
 for(const m of melds)for(const t of m.tiles.slice(0,3)){const i=concealed.indexOf(t.face);if(i<0)return{legal:false,yaku:[],han:0,yakuman:0,reason:'INVALID_MELDS'};concealed.splice(i,1);}
 if(melds.length===0&&detectAgari(tiles).shape==='kokushi')return{legal:true,shape:'kokushi',yaku:[{id:'kokushi',name:'Kokushi Musou',han:0,yakuman:1},...heavenly],han:0,yakuman:1+heavenly.length};
 if(!ctx.decomposition&&!ctx.shapeOverride){
  const candidates:WinEvaluation[]=[];
  for(const d of decomposeStandardFaces(concealed,4-melds.length)){
   for(const wait of ctx.winningFace?possibleWaitTypes(d,ctx.winningFace):['ryanmen'] as WaitType[]){
    const ev=evaluateWin(tiles,{...ctx,decomposition:d,waitType:wait,shapeOverride:'standard'});
    if(ev.legal)candidates.push(ev);
   }
  }
  const special=detectAgari(tiles);
  if(melds.length===0&&special.shape&&special.shape!=='standard')candidates.push(evaluateWin(tiles,{...ctx,shapeOverride:special.shape==='chiitoitsu'?'chiitoitsu':undefined} as WinContext));
  if(candidates.length){const value=(e:WinEvaluation)=>calculateScore(e.han+(ctx.bonusHan??0),e.fu?.fu??(e.shape==='chiitoitsu'?25:0),ctx.seatWind==='E',ctx.method,e.yakuman).payment.total;return candidates.sort((a,b)=>value(b)-value(a)||b.han-a.han)[0]!;}
  return {legal:false,yaku:[],han:0,yakuman:0,reason:detectAgari(tiles).winning?'NO_YAKU':'NOT_AGARI'};
 }
 const agari=ctx.shapeOverride?{winning:true,shape:ctx.shapeOverride}:detectAgari(tiles);if(!agari.winning||!agari.shape)return{legal:false,yaku:[],han:0,yakuman:0,reason:'NOT_AGARI'};
 if(agari.shape==='kokushi')return{legal:true,shape:agari.shape,yaku:[{id:'kokushi',name:'Kokushi Musou',han:0,yakuman:1},...heavenly],han:0,yakuman:1+heavenly.length};
 const y:Yaku[]=[...heavenly];const closed=ctx.closed!==false;const faces=tiles.map(t=>t.face);
 if(closed&&ctx.riichi)y.push(ctx.doubleRiichi?{id:'double_riichi',name:'Double Riichi',han:2}:{id:'riichi',name:'Riichi',han:1}); if(closed&&ctx.method==='tsumo')y.push({id:'menzen_tsumo',name:'Menzen Tsumo',han:1});
 if(closed&&ctx.riichi&&ctx.ippatsu)y.push({id:'ippatsu',name:'Ippatsu',han:1});
 if(ctx.method==='tsumo'&&ctx.haitei)y.push({id:'haitei',name:'Haitei Raoyue',han:1});
 if(ctx.method==='ron'&&ctx.houtei)y.push({id:'houtei',name:'Houtei Raoyui',han:1});
 if(ctx.method==='tsumo'&&ctx.rinshan)y.push({id:'rinshan_kaihou',name:'Rinshan Kaihou',han:1});
 if(ctx.method==='ron'&&ctx.chankan)y.push({id:'chankan',name:'Chankan',han:1});
 if(agari.shape==='chiitoitsu')y.push({id:'chiitoitsu',name:'Chiitoitsu',han:2});
 if(faces.every(f=>!HONORS.has(f)&&!TERMINALS.has(f)))y.push({id:'tanyao',name:'Tanyao',han:1});
 const suits=new Set(faces.filter(f=>f.length===2).map(f=>f[1]));const hasHonor=faces.some(f=>HONORS.has(f));
 if(suits.size===1){if(hasHonor)y.push({id:'honitsu',name:'Honitsu',han:closed?3:2});else y.push({id:'chinitsu',name:'Chinitsu',han:closed?6:5});}
 if(faces.every(isTerminalOrHonor))y.push({id:'honroutou',name:'Honroutou',han:2});
 const faceCounts=new Map<TileFace,number>();for(const f of faces)faceCounts.set(f,(faceCounts.get(f)??0)+1);
 const dragonTriples=(['P','F','C'] as TileFace[]).filter(f=>(faceCounts.get(f)??0)>=3).length;
 if(dragonTriples===3)y.push({id:'daisangen',name:'Daisangen',han:0,yakuman:1});
 if(faces.every(f=>HONORS.has(f)))y.push({id:'tsuuiisou',name:'Tsuuiisou',han:0,yakuman:1});
 if(faces.every(f=>TERMINALS.has(f)))y.push({id:'chinroutou',name:'Chinroutou',han:0,yakuman:1});
 if(agari.shape==='standard'){
  const counts=new Map<TileFace,number>();for(const t of tiles)counts.set(t.face,(counts.get(t.face)??0)+1);if(dragonTriples===2&&(['P','F','C'] as TileFace[]).some(f=>(counts.get(f)??0)===2))y.push({id:'shousangen',name:'Shousangen',han:2});const values:TileFace[]=['P','F','C',ctx.seatWind];if(ctx.roundWind)values.push(ctx.roundWind);for(const f of values)if((counts.get(f)??0)>=3)y.push({id:'yakuhai',name:'Yakuhai',han:1});
  const ds=ctx.decomposition?[{pair:ctx.decomposition.pair,groups:[...ctx.decomposition.groups,...melds.map(m=>({type:m.type==='chi'?'sequence' as const:'triplet' as const,faces:m.tiles.slice(0,3).map(t=>t.face).sort() as [TileFace,TileFace,TileFace]}))]}]:decomposeStandardFaces(faces,4);
  const winningFace=ctx.winningFace;if(closed&&winningFace&&ctx.waitType==='ryanmen'&&ds.some(d=>isPinfuDecomposition(d,winningFace,ctx.seatWind,ctx.roundWind)))y.push({id:'pinfu',name:'Pinfu',han:1});
  if(ds.some(d=>d.groups.every(g=>g.type==='triplet')))y.push({id:'toitoi',name:'Toitoi',han:2});
  const sequencePairs=ds.map(d=>{const counts=new Map<string,number>();for(const g of d.groups.filter(g=>g.type==='sequence')){const key=g.faces.join(',');counts.set(key,(counts.get(key)??0)+1);}return [...counts.values()].reduce((n,c)=>n+Math.floor(c/2),0);});
  if(closed&&sequencePairs.some(n=>n>=2))y.push({id:'ryanpeikou',name:'Ryanpeikou',han:3});else if(closed&&sequencePairs.some(n=>n>=1))y.push({id:'iipeikou',name:'Iipeikou',han:1});
  const concealedTriplets=(ctx.decomposition?.groups.filter(g=>g.type==='triplet'&&!(ctx.method==='ron'&&ctx.waitType==='shanpon'&&g.faces[0]===ctx.winningFace)).length??0)+melds.filter(m=>m.type==='kan'&&m.open===false).length;
  if(concealedTriplets===4&&(ctx.method==='tsumo'||ctx.winningFace&&ctx.waitType==='tanki'))y.push({id:'suuankou',name:'Suuankou',han:0,yakuman:1});else if(concealedTriplets>=3)y.push({id:'sanankou',name:'Sanankou',han:2});
  if(ds.some(d=>d.groups.some(g=>g.type==='sequence')&&isTerminalOrHonor(d.pair)&&d.groups.every(g=>g.faces.some(isTerminalOrHonor))))y.push(hasHonor?{id:'chanta',name:'Chanta',han:closed?2:1}:{id:'junchan',name:'Junchan',han:closed?3:2});
  if(ds.some(d=>[1,2,3,4,5,6,7,8,9].some(n=>['m','p','s'].every(s=>d.groups.some(g=>g.type==='triplet'&&g.faces[0]===`${n}${s}`)))))y.push({id:'sanshoku_doukou',name:'Sanshoku Doukou',han:2});
  const kans=melds.filter(m=>m.type==='kan').length;if(kans===4)y.push({id:'suukantsu',name:'Suukantsu',han:0,yakuman:1});else if(kans===3)y.push({id:'sankantsu',name:'Sankantsu',han:2});
  const windTriples=(['E','S','W','N'] as TileFace[]).filter(f=>(faceCounts.get(f)??0)>=3).length;
  if(windTriples===4)y.push({id:'daisuushi',name:'Daisuushi',han:0,yakuman:1});else if(windTriples===3&&(['E','S','W','N'] as TileFace[]).some(f=>(faceCounts.get(f)??0)===2))y.push({id:'shousuushi',name:'Shousuushi',han:0,yakuman:1});
  if(faces.every(f=>['2s','3s','4s','6s','8s','F'].includes(f)))y.push({id:'ryuuiisou',name:'Ryuuiisou',han:0,yakuman:1});
  if(closed&&!melds.length&&suits.size===1&&!hasHonor){const suit=[...suits][0];if([1,2,3,4,5,6,7,8,9].every(n=>(faceCounts.get(`${n}${suit}` as TileFace)??0)>=(n===1||n===9?3:1)))y.push({id:'chuuren',name:'Chuuren Poutou',han:0,yakuman:1});}

  if(ds.some(d=>hasSanshoku(d.groups)))y.push({id:'sanshoku_doujun',name:'Sanshoku Doujun',han:closed?2:1});
  if(ds.some(d=>hasIttsu(d.groups)))y.push({id:'ittsu',name:'Ittsu',han:closed?2:1});
 }
 const yakuman=y.reduce((n,x)=>n+(x.yakuman??0),0);const scored=yakuman?y.filter(x=>x.yakuman):y;const han=scored.reduce((n,x)=>n+x.han,0);if(!han&&!yakuman)return{legal:false,shape:agari.shape,yaku:[],han:0,yakuman:0,reason:'NO_YAKU'};const fu=agari.shape==='standard'&&ctx.winningFace?calculateStandardFu({concealedFaces:concealed,melds,winningFace:ctx.winningFace,method:ctx.method,closed,seatWind:ctx.seatWind,roundWind:ctx.roundWind??'E',pinfu:scored.some(x=>x.id==='pinfu'),...(ctx.decomposition?{decomposition:ctx.decomposition}:{}),...(ctx.waitType?{waitType:ctx.waitType}:{})}):null;return{legal:true,shape:agari.shape,yaku:scored,han,yakuman,...(fu?{fu}:{})};
}
function hasSanshoku(gs:{type:string;faces:TileFace[]}[]){for(let n=1;n<=7;n++)if(['m','p','s'].every(s=>gs.some(g=>g.type==='sequence'&&g.faces[0]===`${n}${s}`)))return true;return false}
function hasIttsu(gs:{type:string;faces:TileFace[]}[]){return ['m','p','s'].some(s=>[1,4,7].every(n=>gs.some(g=>g.type==='sequence'&&g.faces[0]===`${n}${s}`)))}

function isPinfuDecomposition(d:any,w:TileFace,seat:TileFace,round:TileFace|undefined):boolean{if(!d.groups.every((g:any)=>g.type==='sequence'))return false;if((['P','F','C',seat,round].filter(Boolean) as TileFace[]).includes(d.pair))return false;return d.groups.some((g:any)=>{if(g.type!=='sequence'||!g.faces.includes(w))return false;const n=Number(w[0]),start=Number(g.faces[0][0]);return n!==start+1&&!((start===1&&n===3)||(start===7&&n===7));});}
