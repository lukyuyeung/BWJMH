const order='1m 2m 3m 4m 5m 6m 7m 8m 9m 1p 2p 3p 4p 5p 6p 7p 8p 9p 1s 2s 3s 4s 5s 6s 7s 8s 9s E S W N P F C'.split(' ');
export function sortResultTiles<T extends {id:string;face:string;red:boolean}>(tiles:readonly T[]):T[]{
 return [...tiles].sort((a,b)=>order.indexOf(a.face)-order.indexOf(b.face)||Number(b.red)-Number(a.red)||a.id.localeCompare(b.id));
}
/** Sort groups without changing called tile placement, kan stacking, or provenance. */
export function sortResultMelds<T extends {tiles:readonly {face:string}[]}>(melds:readonly T[]):T[]{
 return [...melds].sort((a,b)=>Math.min(...a.tiles.map(t=>order.indexOf(t.face)))-Math.min(...b.tiles.map(t=>order.indexOf(t.face))));
}
