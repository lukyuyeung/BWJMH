import type {Seat} from './main';
/** Declaration cue belongs to a specific tile, once per player per hand. */
export function createDiscardSoundTracker(){
 let hand='';const tiles=new Set<string>(),declarations=new Set<Seat>();
 return {take(key:string,seat:Seat,tileId:string,declarationId?:string):'tile_discard'|'tile_riichi_place'|null{
  if(hand!==key){hand=key;tiles.clear();declarations.clear();}
  if(tiles.has(tileId))return null;
  tiles.add(tileId);
  if(tileId===declarationId&&!declarations.has(seat)){declarations.add(seat);return 'tile_riichi_place';}
  return 'tile_discard';
 }};
}
