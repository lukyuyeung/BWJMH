import {TABLE_SIZE,TABLE_VIEW} from './table-metrics.js';
/** Calibrated to the four felt corners, including physical height perspective.
 * Both CSS hit targets and WebGL consume this exact homogeneous projection. */
export function feltProjection(height:number){
 const n=TABLE_SIZE,w=1536,r=TABLE_VIEW.farWidth/TABLE_VIEW.nearWidth;
 const a=w*TABLE_VIEW.farWidth/n,g=(r-1)/n,tx=w*(1-TABLE_VIEW.farWidth)/2;
 const b=(w*(1-TABLE_VIEW.nearWidth)/2*r-tx)/n;
 const ty=height*TABLE_VIEW.farY,d=(height*TABLE_VIEW.nearY*r-ty)/n;
 const ay=a*height/TABLE_VIEW.referenceHeight;
 const cy=(d-ay*Math.sin(TABLE_VIEW.elevation))/g;
 const zW=g*Math.tan(TABLE_VIEW.elevation),zX=w/2*zW,zY=cy*zW-ay*Math.cos(TABLE_VIEW.elevation);
 return {a,b,g,d,tx,ty,zX,zY,zW,css:`matrix3d(${a},0,0,0,${b},${d},0,${g},${zX},${zY},1,${zW},${tx},${ty},0,1)`};
}
