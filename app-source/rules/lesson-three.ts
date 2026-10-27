import {createStandardWall,createDeadWall,constructPhysicalWall,createHandState,dealInitialHands,detectAgari,evaluateWin,SEATS,type Tile,type Seat,type TileFace} from '@bunny/riichi-engine';
import {RoomManager,type Room} from './room';
type Example='no-yaku'|'ron'|'tsumo';
export function installLessonThree(room:Room,example:Example,options:{ownFaces?:string;indicator?:TileFace;redFace?:TileFace;handNumber?:1|2|3|4}={}){
 const pool=createStandardWall(room.rules.akaDora),take=(faces:string)=>faces.split(' ').map(f=>{const i=pool.findIndex(t=>t.face===f&&(f===options.redFace?t.red:!t.red));if(i<0)throw Error('Lesson three tile allocation');return pool.splice(i,1)[0]!});
 const own=take(options.ownFaces??(example==='no-yaku'?'1m 2m 3m 4m 5m 6m 7p 8p 9p 2s 3s E E':'1m 2m 3m 7p 8p 9p 2s 3s 4s P P E E'));
 const target=take(example==='no-yaku'?'4s':'P')[0]!,indicator=take(options.indicator??'3p')[0]!;
 const hands={east:own,south:[],west:[],north:[]} as Record<Seat,Tile[]>;
 for(const s of SEATS)while(hands[s].length<13)hands[s].push(pool.shift()!);
 if(example!=='tsumo')hands.south.push(target);
 const dead=pool.splice(-13);dead.splice(4,0,indicator);const live=example==='tsumo'?[target,...pool]:pool,physical=[...SEATS.flatMap(s=>hands[s]),...live,...dead];
 if(physical.length!==136||new Set(physical.map(t=>t.id)).size!==136)throw Error('Lesson three wall');
 const g=createHandState(dealInitialHands(physical));g.hands=hands;g.discards={east:[],south:[],west:[],north:[]};g.discardedFaces={east:[],south:[],west:[],north:[]};g.liveWall=live;g.deadWall=createDeadWall(dead);g.physicalWall=constructPhysicalWall(physical,'east',[3,4]);g.currentSeat=example==='tsumo'?'east':'south';g.phase=example==='tsumo'?'awaiting_draw':'awaiting_discard';g.lastDrawSeat=g.currentSeat;g.lastDrawSource='live';g.turnNumber=8;g.firstTurnYakumanEnabled=false;room.game=g;
 room.settled=false;room.scores={east:25000,south:25000,west:25000,north:25000};room.handStartingScores={...room.scores};room.riichiPot=0;room.match={roundWind:'east',handNumber:options.handNumber??(example==='no-yaku'?1:example==='ron'?2:3),dealer:'east',honba:0,handsPlayed:0,finished:false};room.handMatch={...room.match};room.events=[];delete room.pendingClaims;delete room.pendingRiichi;delete room.cinematic;delete room.winSequence;delete room.transfers;delete room.awardedPot;delete room.resultFlow;delete room.finalRanking;
 return target;
}
export class LessonThreeController{
 stage=-1;running=false;ready=false;private target:Tile;
 constructor(private manager:RoomManager,private room:Room){this.target=installLessonThree(room,'no-yaku')}
 private player(s:Seat){return this.room.players.find(p=>p.seat===s)!}
 private prepare(kind:Example){this.target=installLessonThree(this.room,kind);this.ready=false}
 private reveal(){const g=this.room.game!;if(g.currentSeat==='east'&&g.phase==='awaiting_draw')this.manager.draw(this.room.code,this.player('east').id);else{this.manager.discard(this.room.code,this.player('south').id,this.target.id);for(const p of this.room.players.filter(p=>p.seat!=='east'))if(this.manager.getPlayerGameState(this.room.code,p.id).hand.actions.canPassClaim)this.manager.passClaim(this.room.code,p.id)}this.running=false;this.ready=true;
  if(this.stage===2){const tiles=[...g.hands.east,this.target],ev=evaluateWin(tiles,{method:'ron',closed:true,seatWind:'E',roundWind:'E',winningFace:this.target.face});if(!detectAgari(tiles).winning||ev.legal||ev.yaku.length)throw Error('No-yaku teaching example invalid')}
 }
 setStage(stage:number){if(!Number.isInteger(stage)||stage<0||stage>9)throw Error('Invalid lesson-three checkpoint');if(stage===this.stage)return false;const initial=this.stage<0;if(!initial&&stage!==this.stage+1)throw Error('請依課程次序繼續。');if(!initial&&stage===3&&!this.ready)throw Error('請先看完無役示範。');if(!initial&&stage===5&&this.room.game!.result?.method!=='ron')throw Error('請先親自按榮和。');if(!initial&&stage===7&&this.room.game!.result?.method!=='tsumo')throw Error('請先親自按自摸。');this.stage=stage;this.running=false;
  if(stage<=3){this.prepare('no-yaku');if(stage===2)this.running=true}
  else if(stage===4){this.prepare('ron');this.running=true}
  else if(stage===6){this.prepare('tsumo');this.running=true}
  else if(initial&&stage===5){this.prepare('ron');this.reveal();this.manager.ron(this.room.code,this.player('east').id)}
  else if(initial&&stage>=7){this.prepare('tsumo');this.reveal();this.manager.tsumo(this.room.code,this.player('east').id)}
  return true;
 }
 tick(){if(!this.running)return false;this.reveal();return true}
 win(method:string){if(method==='ron'&&this.stage===4&&this.ready)this.manager.ron(this.room.code,this.player('east').id);else if(method==='tsumo'&&this.stage===6&&this.ready)this.manager.tsumo(this.room.code,this.player('east').id);else throw Error('請等待本步的合法和牌機會。')}
}
