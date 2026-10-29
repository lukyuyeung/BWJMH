import {RoomManager} from '../rules/room';import {createStandardWall,createHandState,createDeadWall,constructPhysicalWall,dealInitialHands,SEATS,type Seat,type Tile,discardTile} from '../engine/index';import {assertPhysical} from './scenarios';
export function fixture(kind:'competition'|'double'|'triple'){
 const manager=new RoomManager(),{room,player}=manager.createRoom('A');for(const name of ['B','C','D'])manager.joinRoom(room.code,name);for(const p of room.players)manager.setReady(room.code,p.id,true);manager.startGame(room.code,player.id);
 installPriorityFixture(manager,room,kind);
 const id=(seat:Seat)=>room.players.find(p=>p.seat===seat)!.id;return {manager,room,player,id};
}
let fixtureSequence=0;
export function installPriorityFixture(manager:RoomManager,room:import('../rules/room').Room,kind:'competition'|'double'|'triple'){
 room.match={roundWind:'east',handNumber:1,dealer:'east',honba:++fixtureSequence,handsPlayed:0,finished:false};room.handMatch={...room.match};room.scores={east:25000,south:25000,west:25000,north:25000};room.riichiPot=0;room.settled=false;room.events=[];delete room.cinematic;delete room.pendingClaims;delete room.pendingRiichi;room.revision++;
 const pool=createStandardWall(true),take=(faces:string)=>faces.trim().split(/\s+/).map(f=>{const i=pool.findIndex(t=>t.face===f);if(i<0)throw Error('Overallocated '+f);return pool.splice(i,1)[0]!});
 const hands={} as Record<Seat,Tile[]>;
 if(kind==='competition'){
 hands.east=take('1m 2m 4p 5p 6p 7p 8p 9p 1s 2s 3s E F');hands.south=take('3m 3m 4m 5m 6m 4s 5s 6s 1p 2p 3p N N');hands.west=take('1m 2m 4p 5p 6p 7s 8s 9s P P P C C');hands.north=take('3m');
 }else{
 hands.east=take('1m 2m 3m 4m 5m 6m 7m 8m 9m P P P C');hands.south=take('1p 2p 3p 4p 5p 6p 7p 8p 9p F F F C');if(kind==='triple')hands.west=take('1s 2s 3s 4s 5s 6s 7s 8s 9s E E E C');hands.north=take('C');
 }
 const discarded=hands.north[0]!;for(const seat of SEATS){hands[seat]??=[];while(hands[seat].length<(seat==='north'?14:13))hands[seat].push(pool.shift()!)}
 const dead=pool.splice(-14),wall=[...SEATS.flatMap(s=>hands[s]),...pool,...dead],g=createHandState(dealInitialHands(wall,'north'),'east','E');g.hands=hands;g.liveWall=pool;g.deadWall=createDeadWall(dead);g.physicalWall=constructPhysicalWall(wall,'north',[3,4]);g.currentSeat='north';g.lastDrawSeat='north';g.turnNumber=8;g.firstTurnYakumanEnabled=false;g.kuikaeEnabled=true;room.game=g;room.handStartingScores={...room.scores};discardTile(g,'north',discarded.id);assertPhysical(room);
}
