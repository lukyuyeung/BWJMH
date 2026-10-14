import {TABLE_SIZE,TABLE_VIEW,tableSpanHeight} from './table-metrics.js';
/** Exact DOM projection of the real orthographic scene camera; no photographed table map. */
export function feltProjection(height:number){
 const scale=height/tableSpanHeight(height);
 const a=scale,b=0,g=0,d=scale*Math.sin(TABLE_VIEW.elevation);
 const tx=768-a*TABLE_SIZE/2,ty=height*TABLE_VIEW.centerY-d*TABLE_SIZE/2;
 const zX=0,zY=-scale*Math.cos(TABLE_VIEW.elevation),zW=0;
 return {a,b,g,d,tx,ty,zX,zY,zW,css:`matrix3d(${a},0,0,0,${b},${d},0,${g},${zX},${zY},1,${zW},${tx},${ty},0,1)`};
}
