import {createStandardWall,createDeadWall,constructPhysicalWall,createHandState,dealInitialHands,SEATS,type Tile,type TileFace,type Seat} from '@bunny/riichi-engine';
import type {Room} from './room';
/** A fixed, isolated teaching table. Every tile is allocated once from a real 136-tile wall. */
export function installLessonOne(room:Room){
 const pool=createStandardWall(room.rules.akaDora);
 const take=(faces:string)=>faces.split(' ').map(face=>{const i=pool.findIndex(t=>t.face===face);if(i<0)throw Error('Lesson tile allocation');return pool.splice(i,1)[0]!});
 const hands={east:take('1m 2m 4m 5m 7m 8m 1p 3p 5p 7p E S W N'),south:[],west:[],north:[]} as Record<Seat,Tile[]>;
 const rivers={east:take('1m'),south:take('1m 3s'),west:take('1m 9p'),north:take('F 7s')} as Record<Seat,Tile[]>;
 for(const seat of SEATS)while(hands[seat].length<13)hands[seat].push(pool.shift()!);
 const dead=pool.splice(-14),physical=[...SEATS.flatMap(s=>hands[s]),...SEATS.flatMap(s=>rivers[s]),...pool,...dead];
 if(physical.length!==136||new Set(physical.map(t=>t.id)).size!==136)throw Error('Lesson wall invalid');
 const g=createHandState(dealInitialHands(physical));g.hands=hands;g.discards=rivers;g.discardedFaces=Object.fromEntries(SEATS.map(s=>[s,rivers[s].map(t=>t.face)])) as Record<Seat,TileFace[]>;g.liveWall=pool;g.deadWall=createDeadWall(dead);g.physicalWall=constructPhysicalWall(physical,'east',[3,4]);g.currentSeat='east';g.lastDrawSeat='east';g.lastDrawSource='live';g.turnNumber=8;g.firstTurnYakumanEnabled=false;room.game=g;
}
