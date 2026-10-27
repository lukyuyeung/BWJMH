import {createStandardWall,createDeadWall,constructPhysicalWall,createHandState,dealInitialHands,SEATS,getPlayerWaits,getWaits,isPermanentFuriten,type Seat} from '@bunny/riichi-engine';import {RoomManager,type Room} from './room';import {installLessonThree} from './lesson-three';import {installLessonFour} from './lesson-four';
type Kind='no-yaku'|'permanent'|'temporary'|'riichi';type Job='none'|'first'|'permanent-draw'|'temporary-block'|'temporary-draw'|'temporary-restored'|'riichi-block';
/** All teaching history, passes, draws and discards are normal engine actions. */
export function installLessonSeven(room:Room,kind:Exclude<Kind,'no-yaku'>){
 installLessonThree(room,'ron',{handNumber:kind==='permanent'?1:kind==='temporary'?2:3});const pool=createStandardWall(room.rules.akaDora),take=(faces:string)=>faces.split(' ').map(face=>{const i=pool.findIndex(t=>t.face===face&&!t.red);if(i<0)throw Error('Lesson seven allocation '+face);return pool.splice(i,1)[0]!});
 const hands={east:take('1m 2m 3m 7p 8p 9p 2s 3s P P P E E'),south:[],west:[],north:[]} as Record<Seat,ReturnType<typeof take>>;
 const extra=take(kind==='permanent'?'1s':'N')[0]!,draws=take(kind==='permanent'?'4s 9p 9p 4s':kind==='temporary'?'1s 4s 9p 9s 4s':'1s 9p 9p 9s 4s'),indicator=take('9s')[0]!;hands.east.push(extra);for(const seat of SEATS)while(hands[seat].length<13)hands[seat].push(pool.shift()!);
 const dead=pool.splice(-13);dead.splice(4,0,indicator);const live=[...draws,...pool],physical=[...SEATS.flatMap(s=>hands[s]),...live,...dead];if(physical.length!==136||new Set(physical.map(t=>t.id)).size!==136)throw Error('Lesson seven physical wall');
 const g=createHandState(dealInitialHands(physical));g.hands=hands;g.liveWall=live;g.deadWall=createDeadWall(dead);g.physicalWall=constructPhysicalWall(physical,'east',[3,4]);g.currentSeat='east';g.lastDrawSeat='east';g.phase='awaiting_discard';g.turnNumber=8;g.firstTurnYakumanEnabled=false;g.doubleRiichiEnabled=false;room.game=g;return extra.id;
}
export class LessonSevenController{
 stage=-1;running=false;ready=false;phase='idle';private job:Job='none';private kind:Kind='no-yaku';private targetId='';
 constructor(private manager:RoomManager,private room:Room){this.targetId=installLessonFour(room,'no-yaku').id}
 private player(s:Seat){return this.room.players.find(p=>p.seat===s)!}
 private passAll(exceptEast=false){for(const s of SEATS){if(exceptEast&&s==='east')continue;const c=this.room.game!.claim,o=c?.options[s];if(c&&o&&!c.passed.includes(s)&&!this.room.pendingClaims?.responses[s]&&(o.ron||o.pon||o.kan||o.chiSequences.length))this.manager.passClaim(this.room.code,this.player(s).id)}}
 private start(job:Job){this.job=job;this.running=job!=='none';this.ready=false}
 private stop(phase:string){this.job='none';this.running=false;this.ready=true;this.phase=phase}
 private prepare(kind:Kind){this.kind=kind;this.phase='idle';this.start('none');if(kind==='no-yaku')this.targetId=installLessonFour(this.room,'no-yaku').id;else{const id=installLessonSeven(this.room,kind);if(kind==='riichi')this.manager.riichiDiscard(this.room.code,this.player('east').id,id);else this.manager.discard(this.room.code,this.player('east').id,id);this.passAll()}}
 private first(){if(this.kind==='no-yaku')this.manager.discard(this.room.code,this.player('south').id,this.targetId);else{this.manager.draw(this.room.code,this.player('south').id);this.manager.discard(this.room.code,this.player('south').id,this.room.game!.hands.south.at(-1)!.id)}this.passAll(true);this.stop('first')}
 private botTurn(){const g=this.room.game!,seat=g.currentSeat;if(g.phase!=='awaiting_draw')throw Error('Practice round is not ready');this.manager.draw(this.room.code,this.player(seat).id);this.manager.discard(this.room.code,this.player(seat).id,g.hands[seat].at(-1)!.id);this.passAll();return seat}
 private skipFirst(){if(!this.manager.getPlayerGameState(this.room.code,this.player('east').id).hand.actions.canRon)throw Error('Practice pass requires an actual legal Ron');this.manager.passClaim(this.room.code,this.player('east').id);this.phase='passed';this.ready=false}
 private drain(job:Job){this.start(job);for(let n=0;this.running&&n<20;n++)this.tick();if(this.running)throw Error('Practice round did not finish')}
 get reason(){const g=this.room.game!;return this.kind==='no-yaku'?'NO_YAKU':(isPermanentFuriten(g,'east')||this.kind==='permanent'&&this.waits.some(f=>g.discardedFaces.east.includes(f)))?'DISCARD_FURITEN':g.riichi.east.riichiFuriten?'RIICHI_FURITEN':g.riichi.east.temporaryFuriten?'TEMPORARY_FURITEN':'CLEAR'}
 get waits(){const g=this.room.game!,hand=g.hands.east;return hand.length%3===2?getWaits(hand.slice(0,-1)):getPlayerWaits(g,'east')}
 setStage(stage:number){if(!Number.isInteger(stage)||stage<0||stage>13)throw Error('Invalid lesson-seven checkpoint');if(stage===this.stage)return false;const initial=this.stage<0;if(!initial){if(stage!==this.stage+1)throw Error('請依課程次序繼續。');if([2,3,7,9,11].includes(stage)&&!this.ready)throw Error('請先看完本步示範。');if(stage===4&&this.room.game!.result?.method!=='tsumo')throw Error('請先親自自摸。');if([6,10].includes(stage)&&this.phase!=='passed')throw Error('請先親自跳過榮和。');if(stage===8&&this.phase!=='restored')throw Error('請先等自己摸牌並打出九索。')}
  this.stage=stage;
  if(initial){const kind:Kind=stage<=1?'no-yaku':stage<=4?'permanent':stage<=8?'temporary':'riichi';this.prepare(kind);if(stage>=2)this.first();if(stage===4){this.passAll();this.drain('permanent-draw');this.manager.tsumo(this.room.code,this.player('east').id)}if(stage>=6&&stage<=8){this.skipFirst();this.drain('temporary-block');if(stage===8){this.drain('temporary-draw');this.discardOwn();this.drain('temporary-restored')}}if(stage>=10){this.skipFirst();this.drain('riichi-block')}}
  else if(stage===2)this.prepare('permanent');else if(stage===5)this.prepare('temporary');else if(stage===9)this.prepare('riichi');
  if([1,2,5,9].includes(stage)){if(!initial||stage===1)this.start('first')}else if(stage===3){this.passAll();this.start('permanent-draw')}else if(stage===6&&!initial)this.start('temporary-block');else if(stage===7)this.start('temporary-draw');else if(stage===10&&!initial)this.start('riichi-block');return true;
 }
 tick(){if(!this.running)return false;const job=this.job,g=this.room.game!;
  if(job==='first')this.first();else if(job==='temporary-block'){this.botTurn();this.stop('blocked')}
  else if(job==='permanent-draw'||job==='temporary-draw'){if(g.currentSeat==='east'){this.manager.draw(this.room.code,this.player('east').id);this.stop('own-draw')}else this.botTurn()}
  else if(job==='temporary-restored'){this.manager.draw(this.room.code,this.player('south').id);this.manager.discard(this.room.code,this.player('south').id,g.hands.south.at(-1)!.id);this.passAll(true);this.stop('restored')}
  else if(job==='riichi-block'){const seat=this.botTurn();if(seat==='south')this.stop('blocked-after-own-draw')}
  return true;
 }
 pass(){if(![5,9].includes(this.stage)||!this.ready||this.phase!=='first')throw Error('請等待本步可榮和的牌。');this.skipFirst()}
 private discardOwn(){const g=this.room.game!,tile=g.hands.east.at(-1)!;if(this.phase!=='own-draw'||tile.face!=='9s')throw Error('請等待自動摸入九索。');this.manager.discard(this.room.code,this.player('east').id,tile.id);this.passAll();this.phase='discarded';this.start('temporary-restored')}
 discard(id:string){if(this.stage!==7||id!==this.room.game!.hands.east.at(-1)?.id)throw Error('請打出本步剛摸的九索。');this.discardOwn()}
 win(){if(this.stage!==3||!this.ready||this.phase!=='own-draw')throw Error('請等待本步自摸機會。');this.manager.tsumo(this.room.code,this.player('east').id)}
}
