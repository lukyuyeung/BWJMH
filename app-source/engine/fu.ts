import type { Meld } from './game.js';
import type { TileFace } from './tiles.js';
import type { WinMethod } from './yaku.js';
import { decomposeStandardFaces, isTerminalOrHonor, type StandardDecomposition } from './decomposition.js';

export type WaitType='ryanmen'|'kanchan'|'penchan'|'tanki'|'shanpon';
export interface FuBreakdown { fu:number; rawFu:number; items:{label:string;fu:number}[]; decomposition?:StandardDecomposition; waitType?:WaitType }
export interface StandardFuContext { concealedFaces:TileFace[]; melds:Meld[]; winningFace:TileFace; method:WinMethod; closed:boolean; seatWind:TileFace; roundWind:TileFace; pinfu?:boolean; decomposition?:StandardDecomposition; waitType?:WaitType }
const round10=(n:number)=>Math.ceil(n/10)*10;

export function calculateStandardFu(ctx:StandardFuContext):FuBreakdown|null{
  const decomps=ctx.decomposition?[ctx.decomposition]:decomposeStandardFaces(ctx.concealedFaces,4-ctx.melds.length); if(!decomps.length)return null;
  const candidates:FuBreakdown[]=[];
  for(const d of decomps){
    for(const wait of ctx.waitType?[ctx.waitType]:possibleWaitTypes(d,ctx.winningFace)) {
      if(ctx.pinfu&&(wait!=='ryanmen'||!d.groups.every(g=>g.type==='sequence')))continue;
      candidates.push(score(d,wait,ctx));
    }
  }
  if(!candidates.length)return null;
  // The same hand can have multiple interpretations; choose the highest legal fu result.
  return candidates.sort((a,b)=>b.fu-a.fu)[0]!;
}
function score(d:StandardDecomposition,wait:WaitType,ctx:StandardFuContext):FuBreakdown{
  if(ctx.pinfu&&ctx.method==='tsumo')return{fu:20,rawFu:20,items:[{label:'Pinfu tsumo',fu:20}],decomposition:d,waitType:wait};
  const items:{label:string;fu:number}[]=[{label:'Base fu',fu:20}]; let raw=20;
  if(ctx.closed&&ctx.method==='ron'){raw+=10;items.push({label:'Closed ron',fu:10})}
  if(ctx.method==='tsumo'){raw+=2;items.push({label:'Tsumo',fu:2})}
  const pairFu=(['P','F','C'] as TileFace[]).includes(d.pair)?2:0;
  let pf=pairFu;if(d.pair===ctx.seatWind)pf+=2;if(d.pair===ctx.roundWind)pf+=2;
  if(pf){raw+=pf;items.push({label:'Value pair',fu:pf})}
  for(const g of d.groups)if(g.type==='triplet'){const term=isTerminalOrHonor(g.faces[0]);let v=term?8:4; // concealed triplet
    if(ctx.method==='ron'&&g.faces[0]===ctx.winningFace&&wait==='shanpon')v=term?4:2;
    raw+=v;items.push({label:`${term?'Terminal/honor':'Simple'} ${v>=4?'triplet':'triplet'}`,fu:v});}
  for(const m of ctx.melds){if(m.type==='chi')continue;const term=isTerminalOrHonor(m.tiles[0]!.face);const open=m.open!==false;const v=m.type==='kan'?(open?(term?16:8):(term?32:16)):(term?4:2);raw+=v;items.push({label:`${open?'Open':'Closed'} ${m.type}`,fu:v});}
  if(wait==='kanchan'||wait==='penchan'||wait==='tanki'){raw+=2;items.push({label:`${wait} wait`,fu:2})}
  // Open ron with otherwise 20 fu is rounded to 30 fu in standard rules.
  if(!ctx.closed&&ctx.method==='ron'&&raw===20)raw=30;
  return{fu:round10(raw),rawFu:raw,items,decomposition:d,waitType:wait};
}
export function possibleWaitTypes(d:StandardDecomposition,w:TileFace):WaitType[]{
  const out=new Set<WaitType>(); if(d.pair===w)out.add('tanki');
  for(const g of d.groups){if(!g.faces.includes(w))continue;if(g.type==='triplet'){out.add('shanpon');continue}
    const n=Number(w[0]),start=Number(g.faces[0][0]); if(n===start+1)out.add('kanchan'); else if((start===1&&n===3)||(start===7&&n===7))out.add('penchan'); else out.add('ryanmen');}
  return [...out];
}
