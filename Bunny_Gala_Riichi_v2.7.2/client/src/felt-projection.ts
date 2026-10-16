import {TABLE_SIZE,TABLE_VIEW} from './table-metrics.js';
/** Exact pinhole camera shared by CSS hit targets, tile meshes and backdrop.
 * Eye: (center,-center-distance*cos(elevation),distance*sin(elevation)).
 * Target: (center,-center,0). Unlike the old art-fitted matrix, this really is 60°. */
export function feltProjection(height:number){
 const w=1536,c=TABLE_SIZE/2,e=TABLE_VIEW.elevation;
 const f=height/(2*Math.tan(TABLE_VIEW.verticalFov*Math.PI/360));
 const k=TABLE_VIEW.distance+c*Math.cos(e),g=-Math.cos(e)/k;
 const a=f/k,b=w/2*g,tx=w/2-f*c/k;
 const d=height/2*g+f*Math.sin(e)/k,ty=height/2-f*c*Math.sin(e)/k;
 const zW=-Math.sin(e)/k,zX=w/2*zW,zY=height/2*zW-f*Math.cos(e)/k;
 return{a,b,g,d,tx,ty,zX,zY,zW,css:`matrix3d(${a},0,0,0,${b},${d},0,${g},${zX},${zY},1,${zW},${tx},${ty},0,1)`};
}
export function feltScreenPoint(u:number,v:number,z:number,height:number){
 const p=feltProjection(height),q=1+p.g*v+p.zW*z;
 return{x:(p.a*u+p.b*v+p.zX*z+p.tx)/q,y:(p.d*v+p.zY*z+p.ty)/q};
}
