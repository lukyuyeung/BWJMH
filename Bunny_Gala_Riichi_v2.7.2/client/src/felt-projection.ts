import {TABLE_SIZE} from './table-metrics.js';
/** Photographed felt, in a 1536-wide stage. DOM and WebGL use one camera. */
export function feltProjection(height:number){
 const a=.736,b=(150*.596-400)/TABLE_SIZE,g=(.596-1)/TABLE_SIZE;
 const d=height*(.79*.596-.34)/TABLE_SIZE,tx=400,ty=height*.34;
 const zX=-.4992,zY=-1.05,zW=-.00065;
 return {a,b,g,d,tx,ty,zX,zY,zW,css:`matrix3d(${a},0,0,0,${b},${d},0,${g},${zX},${zY},1,${zW},${tx},${ty},0,1)`};
}
