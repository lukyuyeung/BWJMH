export type AutomaticOptions={autoSort:boolean;autoRon:boolean;disableCalls:boolean;autoDiscard:boolean;skipAnimation:boolean;reduceEffects:boolean};
export const defaultOptions:AutomaticOptions={autoSort:true,autoRon:false,disableCalls:false,autoDiscard:false,skipAnimation:false,reduceEffects:false};
/** Intent only. Socket revision and all legality are rechecked by the server. */
export function automaticIntent(options:AutomaticOptions,s:{finished:boolean;canRon:boolean;canWinClaim?:boolean;canPassClaim:boolean;canDiscard:boolean;canTsumo:boolean;drawnTileId?:string|undefined;discardTileIds:string[];riichi?:boolean;ankanTileIds?:string[];kakanTileIds?:string[]}){
 if(s.finished)return null;
 if(options.autoRon&&s.canRon)return{event:'game:ron',payload:{}};
 if(options.autoRon&&s.canTsumo)return{event:'game:tsumo',payload:{}};
 if(options.disableCalls&&s.canPassClaim&&!s.canRon&&!s.canWinClaim)return{event:'game:pass-claim',payload:{}};
 const legalKan=Boolean(s.ankanTileIds?.length||s.kakanTileIds?.length);
 if((options.autoDiscard||s.riichi)&&!legalKan&&s.canDiscard&&!s.canTsumo&&s.drawnTileId&&s.discardTileIds.includes(s.drawnTileId))return{event:'game:discard',payload:{tileId:s.drawnTileId}};
 return null;
}
export function matchingDiscard(hoverFace:string|null,tileFace:string){return hoverFace!==null&&hoverFace===tileFace;}
export function calledPosition(caller:string,from:string){const seats=['east','south','west','north'];const offset=(seats.indexOf(from)-seats.indexOf(caller)+4)%4;return offset===3?0:offset===2?1:2;}

export function discardedFaceCount(face:string,rivers:Record<string,{id:string;face:string}[]>,melds:Record<string,{open?:boolean;calledTile:{id:string;face:string}}[]>){const seen=new Set<string>();for(const tile of Object.values(rivers).flat())if(tile.face===face)seen.add(tile.id);for(const meld of Object.values(melds).flat())if(meld.open!==false&&meld.calledTile.face===face)seen.add(meld.calledTile.id);return seen.size;}
