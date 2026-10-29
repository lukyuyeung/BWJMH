import {createStandardWall,createDeadWall,constructPhysicalWall,createHandState,dealInitialHands,SEATS,type Tile,type Seat} from '@bunny/riichi-engine';
import {RoomManager,type Room} from './room';
export function installLessonTwo(room:Room){
 const pool=createStandardWall(room.rules.akaDora),take=(faces:string)=>faces.split(' ').map(face=>{const i=pool.findIndex(t=>t.face===face);if(i<0)throw Error('Lesson two allocation');return pool.splice(i,1)[0]!});
 const hands={east:take('1m 2m 4m 5m 6m 7p 7p 2s 3s 4s E E N'),south:[],west:[],north:[]} as Record<Seat,Tile[]>;
 const draws=take('9p 9p 9p 3m 8p 8p 8p 9s 6p 6p 6p 4p');
 for(const seat of SEATS)while(hands[seat].length<13)hands[seat].push(pool.shift()!);
 const dead=pool.splice(-14),live=[...draws,...pool],physical=[...SEATS.flatMap(s=>hands[s]),...live,...dead];
 if(physical.length!==136||new Set(physical.map(t=>t.id)).size!==136)throw Error('Lesson two wall');
 const g=createHandState(dealInitialHands(physical));g.hands=hands;g.discards={east:[],south:[],west:[],north:[]};g.discardedFaces={east:[],south:[],west:[],north:[]};g.liveWall=live;g.deadWall=createDeadWall(dead);g.physicalWall=constructPhysicalWall(physical,'east',[3,4]);g.currentSeat='south';g.phase='awaiting_draw';g.turnNumber=1;g.firstTurnYakumanEnabled=false;room.game=g;
}
/** Drives normal engine draw/discard transitions; only the learner's discards are manual. */
export class LessonTwoController{
 stage=-1;running=false;
 constructor(private manager:RoomManager,private room:Room){installLessonTwo(room)}
 private player(seat:Seat){return this.room.players.find(p=>p.seat===seat)!}
 private pass(){for(const p of this.room.players)if(this.manager.getPlayerGameState(this.room.code,p.id).hand.actions.canPassClaim)this.manager.passClaim(this.room.code,p.id)}
 setStage(stage:number){if(!Number.isInteger(stage)||stage<0||stage>7)throw Error('Invalid lesson checkpoint');if(stage===this.stage)return false;
  if(this.stage<0){installLessonTwo(this.room);if(stage>=3){this.running=true;while(this.running)this.tick();}if(stage>=4){const n=this.room.game!.hands.east.find(t=>t.face==='N')!;this.manager.discard(this.room.code,this.player('east').id,n.id);this.pass();}if(stage>=6){for(let i=0;i<2;i++){this.running=true;while(this.running)this.tick();const id=this.room.game!.hands.east.at(-1)!.id;this.manager.discard(this.room.code,this.player('east').id,id);this.pass();}}}
  else {if(stage!==this.stage+1)throw Error('請按課程次序完成練習。');const g=this.room.game!;if(stage===3&&(g.currentSeat!=='east'||g.phase!=='awaiting_discard'||g.hands.east.length!==14))throw Error('請等自動摸牌完成。');if(stage===4&&g.discards.east.length!==1)throw Error('請先打出北。');if(stage===6&&(g.discards.east.length!==3||g.hands.east.length!==13))throw Error('請先完成兩輪出牌。');}
  this.stage=stage;this.running=(stage===2||stage===5)&&this.room.game!.phase==='awaiting_draw';return true;
 }
 tick(){if(!this.running)return false;const g=this.room.game!,p=this.player(g.currentSeat);if(g.phase==='awaiting_draw')this.manager.draw(this.room.code,p.id);else if(g.phase==='awaiting_discard'&&g.currentSeat!=='east'){this.manager.discard(this.room.code,p.id,g.hands[p.seat].at(-1)!.id);this.pass()}else {this.running=false;return false}if(g.currentSeat==='east'&&g.phase==='awaiting_discard')this.running=false;return true}
 discard(id:string){const g=this.room.game!;if(![3,5].includes(this.stage)||this.running||g.currentSeat!=='east'||g.phase!=='awaiting_discard')throw Error('請先等回合自動輪到你。');if(this.stage===3&&g.hands.east.find(t=>t.id===id)?.face!=='N')throw Error('本步請先打出北。');this.manager.discard(this.room.code,this.player('east').id,id);this.pass();if(this.stage===5&&g.discards.east.length<3)this.running=true}
}
