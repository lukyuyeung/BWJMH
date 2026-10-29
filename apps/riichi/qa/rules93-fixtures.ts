/** Developer-only adapters for the actual ordinary table; no academy overlay or fake eligibility. */
import {RoomManager,type Room} from '../rules/room';import {LessonSevenController} from '../rules/lesson-seven';import {installScenario} from './scenarios';
import {createStandardWall,createDeadWall,constructPhysicalWall,createHandState,dealInitialHands,SEATS,type Seat,type Tile} from '../engine';
export function installRules93Fixture(manager:RoomManager,room:Room,name:string){
 room.revision++;
 if(name==='partial'){
  installScenario(manager,room,'open-yaku');const pool=createStandardWall(),take=(s:string)=>s.split(' ').map(face=>pool.splice(pool.findIndex(t=>t.face===face&&!t.red),1)[0]!),own=take('1p 2p 3p 2s 3s 7p 8p 9p 5m 5m'),meld=take('1m 2m 3m'),river=take('N'),indicator=take('9s')[0]!,hands={east:own,south:[],west:[],north:[]} as Record<Seat,Tile[]>;for(const s of SEATS)while(hands[s].length<(s==='east'?10:13))hands[s].push(pool.shift()!);const dead=pool.splice(-13);dead.splice(4,0,indicator);const wall=[...SEATS.flatMap(s=>hands[s]),...meld,...river,...pool,...dead],g=createHandState(dealInitialHands(wall));g.hands=hands;g.melds.east=[{type:'chi',tiles:meld,calledTile:meld[2]!,from:'north',open:true}];g.discards.east=river;g.discardedFaces.east=['N'];g.liveWall=pool;g.deadWall=createDeadWall(dead);g.physicalWall=constructPhysicalWall(wall,'east',[3,4]);g.currentSeat='south';g.phase='awaiting_draw';delete g.lastDrawSeat;g.firstTurnYakumanEnabled=false;room.game=g;return;
 }

 if(name==='riichi-tsumo'){installScenario(manager,room,'riichi-winning-draw');return}
 const stages:Record<string,number>={'no-yaku-before':0,'no-yaku':1,discard:2,temporary:6,'riichi-blocked':10,'riichi-ron':9,restored:8};if(!(name in stages))throw Error('Unknown rules93 fixture');const c=new LessonSevenController(manager,room);c.setStage(stages[name]!);for(let i=0;c.running&&i<20;i++)c.tick();if(c.running)throw Error('Fixture did not settle');
}
