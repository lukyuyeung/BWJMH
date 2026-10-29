import type { TileFace } from './tiles.js';

export type Group = { type:'sequence'|'triplet'; faces:[TileFace,TileFace,TileFace] };
export interface StandardDecomposition { pair:TileFace; groups:Group[] }
const FACES:TileFace[]=['1m','2m','3m','4m','5m','6m','7m','8m','9m','1p','2p','3p','4p','5p','6p','7p','8p','9p','1s','2s','3s','4s','5s','6s','7s','8s','9s','E','S','W','N','P','F','C'];
const INDEX=new Map<TileFace,number>(FACES.map((f,i)=>[f,i]));

/** Enumerates standard concealed decompositions for the groups not already exposed as melds. */
export function decomposeStandardFaces(faces:readonly TileFace[], requiredGroups=4):StandardDecomposition[]{
  if(faces.length!==requiredGroups*3+2)return[];
  const c=Array(34).fill(0) as number[];
  for(const f of faces){const i=INDEX.get(f);if(i===undefined||(c[i]=c[i]!+1)>4)return[];}
  const out:StandardDecomposition[]=[];
  for(let p=0;p<34;p++){
    if(c[p]!<2)continue; const w=[...c];w[p]=w[p]!-2;
    collect(w,requiredGroups,[],groups=>out.push({pair:FACES[p]!,groups}));
  }
  return out;
}
function collect(c:number[],remaining:number,groups:Group[],emit:(g:Group[])=>void){
  const i=c.findIndex(n=>n>0);
  if(i<0){if(remaining===0)emit(groups);return} if(remaining<=0)return;
  if(c[i]!>=3){c[i]=c[i]!-3;collect(c,remaining-1,[...groups,{type:'triplet',faces:[FACES[i]!,FACES[i]!,FACES[i]!]}],emit);c[i]=c[i]!+3;}
  if(i<27&&i%9<=6&&c[i+1]!>0&&c[i+2]!>0){c[i]=c[i]!-1;c[i+1]=c[i+1]!-1;c[i+2]=c[i+2]!-1;collect(c,remaining-1,[...groups,{type:'sequence',faces:[FACES[i]!,FACES[i+1]!,FACES[i+2]!]}],emit);c[i]=c[i]!+1;c[i+1]=c[i+1]!+1;c[i+2]=c[i+2]!+1;}
}
export function isTerminalOrHonor(f:TileFace){return f.length===1||f[0]==='1'||f[0]==='9'}
export function isHonor(f:TileFace){return f.length===1}
