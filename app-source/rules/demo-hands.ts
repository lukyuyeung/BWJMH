import {createStandardWall,createDeadWall,createHandState,dealInitialHands,constructPhysicalWall,SEATS,type Tile,type Seat} from '@bunny/riichi-engine';
import type {Room,RoomManager} from './room.js';
export const DEMO_HANDS={daisangen:'P P P F F F C C C 2m 3m 4m 5p 5p',suuankou:'2m 2m 2m 3p 3p 3p 4s 4s 4s 6s 6s 6s 5p 5p',daisuushi:'E E E S S S W W W N N N 5p 5p',kokushi:'1m 9m 1p 9p 1s 9s E S W N P F C C',chinitsu:'1m 2m 3m 1m 2m 3m 4m 5m 6m 7m 8m 9m 5m 5m'} as const;
export type DemoHand=keyof typeof DEMO_HANDS;
/** Standalone demo only: allocate a complete, unique 136-tile wall, then use the real win/settlement path. */
export function installDemoWin(manager:RoomManager,room:Room,playerId:string,kind:DemoHand){
 if(!Object.hasOwn(DEMO_HANDS,kind))throw Error('未知示範牌型');
 const pool=createStandardWall(room.rules.akaDora),take=(face:string)=>{const i=pool.findIndex(t=>t.face===face);if(i<0)throw Error('示範牌數錯誤');return pool.splice(i,1)[0]!};
 const winner=room.players.find(p=>p.id===playerId)!.seat,hands={} as Record<Seat,Tile[]>;hands[winner]=DEMO_HANDS[kind].split(' ').map(take);
 for(const seat of SEATS)if(seat!==winner)hands[seat]=pool.splice(0,13);
 const dead=pool.splice(-14),wall=[...SEATS.flatMap(s=>hands[s]),...pool,...dead],game=createHandState(dealInitialHands(wall,winner),winner,'E');
 game.hands=hands;game.liveWall=pool;game.deadWall=createDeadWall(dead);game.physicalWall=constructPhysicalWall(wall,winner,[3,4]);game.currentSeat=winner;game.lastDrawSeat=winner;game.lastDrawSource='live';game.firstTurnYakumanEnabled=false;game.turnNumber=2;
 room.game=game;room.settled=false;room.scores={east:25000,south:25000,west:25000,north:25000};room.riichiPot=0;room.handStartingScores={...room.scores};room.match={roundWind:'east',handNumber:1,dealer:winner,honba:0,handsPlayed:0,finished:false};room.handMatch={...room.match};room.events=[];delete room.cinematic;delete room.finalRanking;
 const settled=manager.tsumo(room.code,playerId);if(settled.cinematic)settled.cinematic.demo=true;
}
