/** Keep character/art proportions uniform; reframe only the calibrated table plane. */
export function sceneFrame(width:number,height:number,compact:boolean){
 const scale=Math.max(1,width)/1536;
 const visibleHeight=compact?Math.max(1,height)/scale:1024;
 const tableScale=compact?Math.min(1,Math.max(.25,(visibleHeight-350)/(1024-350))):1;
 return {scale,visibleHeight,tableScale,tableOffset:350*(1-tableScale)};
}
