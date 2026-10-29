import {constructPhysicalWall,type PhysicalWall} from './physical-wall.js';
import type { Tile } from './tiles.js';
import { createDeadWall, type DeadWallState } from './deadwall.js';

export type Seat = 'east' | 'south' | 'west' | 'north';
export const SEATS: Seat[] = ['east', 'south', 'west', 'north'];

export interface InitialDeal { hands: Record<Seat, Tile[]>; liveWall: Tile[]; deadWall: DeadWallState; physicalWall?:PhysicalWall; }

/** Split off the 14-tile dead wall before dealing. Current dealer starts with 14; others 13. Three four-tile packets, then single tiles. */
export function dealInitialHands(wall: readonly Tile[], dealerSeat: Seat = 'east',dice:[number,number]=[1,1]): InitialDeal {
  if (wall.length !== 136) throw new Error(`Expected a 136-tile wall, received ${wall.length}`);
  const drawable=wall.slice(0,122);
  const deadWall=createDeadWall(wall.slice(122));
  let cursor=0;
  const take=(count:number)=>{const tiles=drawable.slice(cursor,cursor+count);cursor+=count;return tiles};
  const hands={} as Record<Seat,Tile[]>;
  const order=Array.from({length:4},(_,i)=>SEATS[(SEATS.indexOf(dealerSeat)+i)%4]!);
  for(const seat of SEATS)hands[seat]=[];
  for(let packet=0;packet<3;packet++)for(const seat of order)hands[seat].push(...take(4));
  for(const seat of order)hands[seat].push(...take(1));
  hands[dealerSeat].push(...take(1));
  return {hands,liveWall:drawable.slice(cursor),deadWall,physicalWall:constructPhysicalWall(wall,dealerSeat,dice)};
}
