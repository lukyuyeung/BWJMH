/** Shared atlas-derived artwork for table, hand, melds, indicators and results. */
export const approvedTileFaces=[...['m','p','s'].flatMap(s=>Array.from({length:9},(_,i)=>`${i+1}${s}`)),...['E','S','W','N','P','F','C']];
export function tileFaceUrl(face:string,red=false){
 if(!approvedTileFaces.includes(face))throw new Error('Unknown tile face: '+face);
 if(red&&/^5[mps]$/.test(face))return '/art/tiles/faces/'+face+'-red.svg?art=red-size-v2';
 return '/art/tiles/faces/'+face+(red&&/^5[mps]$/.test(face)?'-red':'')+'.png'+(face==='2s'?'?art=vertical-v2':'');
}

export function completeTileUrl(face:string,red=false){return tileFaceUrl(face,red).replace('/faces/','/complete/').replace('.png','.svg')}
