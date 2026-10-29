import {visibleCounts,waitPreview} from '../rules/assistance';
import type {Game} from './main';
import type {Tile,Seat,Meld} from '../engine/index';
/** Only this player's tiles and public information enter unseen-copy counts. */
export function discardWaits(game:Game){
 const h=game.hand,own=game.you.hand as Tile[],seat=game.you.seat;
 if(!h.actions.canDiscard||h.riichi[seat]||own.length%3!==2)return {} as Record<string,{face:string;remaining:number}[]>;
 const counts=visibleCounts(own,h.discards as Record<Seat,Tile[]>,h.melds as Record<Seat,Meld[]>,h.doraIndicators as Tile[]),result:Record<string,{face:string;remaining:number}[]>={};
 for(const tile of own){if(!h.discardTileIds.includes(tile.id)||Object.hasOwn(result,tile.face))continue;
  // The discarded tile remains visible, so the original visible counts stay correct.
  result[tile.face]=waitPreview(own.filter(t=>t.id!==tile.id),h.melds[seat].length,counts,h.melds[seat] as Meld[]);
 }
 return result;
}
