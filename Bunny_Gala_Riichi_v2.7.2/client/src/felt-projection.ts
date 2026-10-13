/** Photographed felt, in a 1536-wide stage. DOM and WebGL use one camera. */
export function feltProjection(height:number){
 const a=.736,b=(150*.596-400)/760,g=(.596-1)/760;
 const d=height*(.79*.596-.34)/760,tx=400,ty=height*.34;
 const zX=-.9984,zY=-1.15,zW=-.0013;
 return {a,b,g,d,tx,ty,zX,zY,zW,css:`matrix3d(${a},0,0,0,${b},${d},0,${g},${zX},${zY},1,${zW},${tx},${ty},0,1)`};
}
