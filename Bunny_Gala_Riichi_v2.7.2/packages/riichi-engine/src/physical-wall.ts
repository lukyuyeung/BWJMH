import {SEATS,type Seat} from './deal.js';
import type {Tile} from './tiles.js';
export interface PhysicalWall {tileIds:string[];breakSlot:number;dice:[number,number];}
export interface PublicWallSlot {side:Seat;stack:number;level:0|1;occupied:boolean;dead:boolean;indicator?:Tile;}
export function constructPhysicalWall(wall:readonly Tile[],dealer:Seat,dice:[number,number]=[1,1]):PhysicalWall{
 if(wall.length!==136||new Set(wall.map(t=>t.id)).size!==136||dice.some(n=>!Number.isInteger(n)||n<1||n>6))throw new Error('Invalid physical wall');
 const clockwise:Seat[]=['east','north','west','south'],sum=dice[0]+dice[1],side=SEATS[(SEATS.indexOf(dealer)+sum-1)%4]!;
 const start=(clockwise.indexOf(side)*34+sum*2)%136;
 const slots=Array.from({length:136},(_,i)=>{const r=(start+i)%136;return SEATS.indexOf(clockwise[Math.floor(r/34)]!)*34+(16-Math.floor((r%34)/2))*2+r%2;});
 const ids=Array<string>(136);for(let i=0;i<122;i++)ids[slots[i]!]=wall[i]!.id;
 // Rinshan nearest the break; indicators on upper tiles and ura directly underneath.
 const deadOffsets=[12,13,10,11,8,6,4,2,0,9,7,5,3,1];for(let i=0;i<14;i++)ids[slots[122+deadOffsets[i]!]!]=wall[122+i]!.id;
 return{tileIds:ids,breakSlot:slots[0]!,dice};
}
export function publicWallSlots(state:{physicalWall?:PhysicalWall;liveWall:Tile[];deadWall:{tiles:Tile[];doraIndicators:Tile[];revealedDoraCount:number}}):PublicWallSlot[]{
 if(!state.physicalWall)return[];
 const live=new Set(state.liveWall.map(t=>t.id)),dead=new Set(state.deadWall.tiles.map(t=>t.id)),indicators=state.deadWall.doraIndicators.slice(0,state.deadWall.revealedDoraCount);
 return state.physicalWall.tileIds.map((id,i)=>{const indicator=indicators.find(t=>t.id===id);return{side:SEATS[Math.floor(i/34)]!,stack:Math.floor(i%34/2),level:i%2 as 0|1,occupied:live.has(id)||dead.has(id),dead:dead.has(id),...(indicator?{indicator}:{})};});
}
