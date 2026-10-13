/** Keep the background, DOM tile poses and WebGL camera in the same viewport. */
export function sceneFrame(width:number,height:number,_compact:boolean){
 const scale=Math.max(1,width)/1536;
 return {scale,visibleHeight:Math.max(1,height)/scale,tableScale:1,tableOffset:0};
}
