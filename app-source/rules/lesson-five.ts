import {createStandardWall,createDeadWall,constructPhysicalWall,createHandState,dealInitialHands,SEATS,type Tile,type Seat} from '@bunny/riichi-engine';
import {RoomManager,type Room} from './room';
/** A fixed, physically valid practice wall. Both rounds use ordinary engine actions. */
export function installLessonFive(room:Room){
 const pool=createStandardWall(room.rules.akaDora),take=(faces:string)=>faces.split(' ').map(face=>{const i=pool.findIndex(t=>t.face===face&&!t.red);if(i<0)throw Error('Lesson five allocation');return pool.splice(i,1)[0]!});
 const hands={east:take('1m 2m 3m 4p 5p 6p 2s 3s 4s 8p 8p E E'),south:[],west:[],north:[]} as Record<Seat,Tile[]>;
 const extra=take('N')[0]!,draws=take('9p 9p 9p 9s 6p 6p 6p 8p'),indicator=take('2m')[0]!,ura=take('4p')[0]!;
 hands.east.push(extra);for(const s of SEATS)while(hands[s].length<13)hands[s].push(pool.shift()!);
 const dead=pool.splice(-12);dead.splice(4,0,indicator);dead.splice(9,0,ura);const live=[...draws,...pool],physical=[...SEATS.flatMap(s=>hands[s]),...live,...dead];
 if(physical.length!==136||new Set(physical.map(t=>t.id)).size!==136)throw Error('Lesson five wall');
 const g=createHandState(dealInitialHands(physical));g.hands=hands;g.discards={east:[],south:[],west:[],north:[]};g.discardedFaces={east:[],south:[],west:[],north:[]};g.liveWall=live;g.deadWall=createDeadWall(dead);g.physicalWall=constructPhysicalWall(physical,'east',[3,4]);g.currentSeat='east';g.phase='awaiting_discard';g.lastDrawSeat='east';g.lastDrawSource='live';g.turnNumber=8;g.firstTurnYakumanEnabled=false;g.doubleRiichiEnabled=false;room.game=g;
 room.settled=false;room.scores={east:25000,south:25000,west:25000,north:25000};room.handStartingScores={...room.scores};room.riichiPot=0;room.match={roundWind:'east',handNumber:1,dealer:'east',honba:0,handsPlayed:0,finished:false};room.handMatch={...room.match};room.events=[];delete room.pendingClaims;delete room.pendingRiichi;delete room.cinematic;delete room.winSequence;delete room.transfers;delete room.awardedPot;delete room.resultFlow;delete room.finalRanking;
 return extra.id;
}
export class LessonFiveController{
 stage=-1;running=false;armed=false;ready=false;private extra:string;
 constructor(private manager:RoomManager,private room:Room){this.extra=installLessonFive(room)}
 private player(seat:Seat){return this.room.players.find(p=>p.seat===seat)!}
 private pass(){for(const p of this.room.players)if(this.manager.getPlayerGameState(this.room.code,p.id).hand.actions.canPassClaim)this.manager.passClaim(this.room.code,p.id)}
 private declare(){this.manager.riichiDiscard(this.room.code,this.player('east').id,this.extra);this.pass();this.armed=false}
 private round(){this.running=true;for(let n=0;this.running&&n<20;n++)this.tick();if(this.running)throw Error('Practice round failed to reach player')}
 setStage(stage:number){
  if(!Number.isInteger(stage)||stage<0||stage>11)throw Error('Invalid lesson-five checkpoint');if(stage===this.stage)return false;
  const initial=this.stage<0,g=this.room.game!;
  if(!initial){if(stage!==this.stage+1)throw Error('請依課程次序繼續。');if(stage===4&&!g.riichi.east.declared)throw Error('請先親自宣告立直。');if(stage===6&&g.discards.east.length!==2)throw Error('請先完成第一次刮牌摸切。');if(stage===8&&g.result?.method!=='tsumo')throw Error('請先親自按自摸。')}
  if(initial){this.extra=installLessonFive(this.room);if(stage>=4)this.declare();if(stage>=6){this.round();this.manager.discard(this.room.code,this.player('east').id,this.room.game!.hands.east.at(-1)!.id);this.pass()}if(stage>=8){this.round();this.manager.tsumo(this.room.code,this.player('east').id)}}
  this.stage=stage;this.ready=false;this.running=stage===5||stage===7;return true;
 }
 arm(){if(this.stage!==3||this.room.game!.riichi.east.declared)throw Error('現在不是宣告立直的步驟。');this.armed=!this.armed}
 discard(id:string){if(this.stage!==3||!this.armed||id!==this.extra)throw Error('請先按立直，再打出北。');this.declare()}
 tick(){if(!this.running)return false;const g=this.room.game!,p=this.player(g.currentSeat);if(g.phase==='awaiting_draw')this.manager.draw(this.room.code,p.id);else if(g.phase==='awaiting_discard'&&g.currentSeat!=='east'){this.manager.discard(this.room.code,p.id,g.hands[p.seat].at(-1)!.id);this.pass()}else throw Error('Unexpected practice turn');if(g.currentSeat==='east'&&g.phase==='awaiting_discard'){this.running=false;this.ready=true}return true}
 tsumogiri(){const g=this.room.game!;if(this.stage!==5||!this.ready||g.hands.east.at(-1)?.face!=='9s')throw Error('請先揭曉第一張摸入牌。');this.manager.discard(this.room.code,this.player('east').id,g.hands.east.at(-1)!.id);this.pass();this.ready=false}
 win(){if(this.stage!==7||!this.ready)throw Error('請等待本步自摸機會。');this.manager.tsumo(this.room.code,this.player('east').id);this.ready=false}
}
