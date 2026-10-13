import { ALL_TILE_FACES } from './tenpai.js';
import type { TileFace } from './tiles.js';
const cache=new Map<string,number>();
/** Exact standard shanten, with seven pairs and thirteen orphans for closed hands. */
export function calculateShanten(faces:readonly TileFace[],fixedMelds=0):number {
 const c=ALL_TILE_FACES.map(f=>faces.filter(x=>x===f).length);
 if(fixedMelds<0||fixedMelds>4||c.some(n=>n>4)||c.reduce((a,b)=>a+b,0)!==faces.length)throw new Error('Invalid shanten input');
 const key=fixedMelds+':'+c.join(''); const cached=cache.get(key);if(cached!==undefined)return cached;
 let best=8;
 const visit=(i:number,m:number,t:number,p:number):void=>{
  while(i<34&&c[i]===0)i++;
  if(i===34){best=Math.min(best,8-2*(m+fixedMelds)-Math.min(t,4-m-fixedMelds)-p);return;}
  const n=c[i]!;
  if(m+fixedMelds<4){
   if(n>=3){c[i]=n-3;visit(i,m+1,t,p);c[i]=n;}
   if(i<27&&i%9<7&&c[i+1]!>0&&c[i+2]!>0){c[i]=n-1;c[i+1]!--;c[i+2]!--;visit(i,m+1,t,p);c[i]=n;c[i+1]!++;c[i+2]!++;}
  }
  if(n>=2){c[i]=n-2;if(!p)visit(i,m,t,1);if(m+fixedMelds+t<4)visit(i,m,t+1,p);c[i]=n;}
  if(m+fixedMelds+t<4&&i<27){for(const d of [1,2])if(i%9+d<9&&c[i+d]!>0){c[i]=n-1;c[i+d]!--;visit(i,m,t+1,p);c[i]=n;c[i+d]!++;}}
  c[i]=n-1;visit(i,m,t,p);c[i]=n;
 };
 visit(0,0,0,0);
 if(fixedMelds===0){const distinct=c.filter(n=>n>0).length,pairs=c.filter(n=>n>=2).length;best=Math.min(best,6-pairs+Math.max(0,7-distinct));const orphan=[0,8,9,17,18,26,27,28,29,30,31,32,33];best=Math.min(best,13-orphan.filter(i=>c[i]!>0).length-(orphan.some(i=>c[i]!>=2)?1:0));}
 if(cache.size>50000)cache.clear();cache.set(key,best);return best;
}
/** Improving faces only; availability must be derived separately from public information. */
export function improvingTiles(faces:readonly TileFace[],fixedMelds=0):TileFace[]{const shanten=calculateShanten(faces,fixedMelds);return ALL_TILE_FACES.filter(f=>faces.filter(x=>x===f).length<4&&calculateShanten([...faces,f],fixedMelds)<shanten);}
