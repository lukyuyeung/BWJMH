import {TABLE_SIZE} from './table-metrics.js';
/** Art-calibrated broad tabletop from the approved V11 empty plate; not a physical 60-degree lens. */
export function feltProjection(height:number){const w=1536,n=TABLE_SIZE,far=.56865,near=.9135,ratio=far/near,a=w*far/n,g=(ratio-1)/n,tx=w*(1-far)/2,b=(w*(1-near)/2*ratio-tx)/n;const ty=height*.1941,d=(height*.953*ratio-ty)/n,zW=0,zX=0,zY=-.30;return{a,b,g,d,tx,ty,zX,zY,zW,css:`matrix3d(${a},0,0,0,${b},${d},0,${g},${zX},${zY},1,${zW},${tx},${ty},0,1)`};}
export function feltScreenPoint(u:number,v:number,z:number,height:number){const p=feltProjection(height),q=1+p.g*v+p.zW*z;return{x:(p.a*u+p.b*v+p.zX*z+p.tx)/q,y:(p.d*v+p.zY*z+p.ty)/q};}
