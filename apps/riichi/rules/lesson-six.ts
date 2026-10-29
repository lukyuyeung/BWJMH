import {createStandardWall,createDeadWall,constructPhysicalWall,createHandState,dealInitialHands,SEATS,type Seat,type Tile,detectAgari,evaluateWin} from '@bunny/riichi-engine';import {RoomManager,type Room} from './room';import {installLessonThree} from './lesson-three';
type Kind='chi'|'pon'|'kan';
export function installLessonSix(room:Room,kind:Kind){
 installLessonThree(room,'ron',{handNumber:kind==='chi'?1:kind==='pon'?2:3});
 const pool=createStandardWall(room.rules.akaDora),take=(faces:string)=>faces.split(' ').map(face=>{const i=pool.findIndex(t=>t.face===face&&!t.red);if(i<0)throw Error('Lesson six allocation '+face);return pool.splice(i,1)[0]!});
 const own=take(kind==='chi'?'1m 2m 4p 5p 6p 2s 3s 4s 7p 8p E E N':kind==='pon'?'P P 1m 2m 3m 4p 5p 6p 2s 3s E E N':'C C C 1m 2m 3m 4p 5p 6p 2s 3s E E'),target=take(kind==='chi'?'3m':kind==='pon'?'P':'C')[0]!,next=take(kind==='chi'?'9p':kind==='pon'?'4s':'9s')[0]!,indicator=take(kind==='chi'?'3p':'9s')[0]!,kanIndicator=take('1p')[0]!,discarder:Seat=kind==='chi'?'north':kind==='pon'?'south':'west',hands={east:own,south:[],west:[],north:[]} as Record<Seat,Tile[]>;
 for(const s of SEATS)while(hands[s].length<13)hands[s].push(pool.shift()!);hands[discarder].push(target);
 const dead=pool.splice(-12);dead.splice(4,0,indicator);dead.splice(5,0,kanIndicator);if(kind==='kan'){pool.push(dead[0]!);dead[0]=next;}const live=kind==='kan'?pool:[next,...pool],physical=[...SEATS.flatMap(s=>hands[s]),...live,...dead];
 if(physical.length!==136||new Set(physical.map(t=>t.id)).size!==136)throw Error('Lesson six physical wall');
 const g=createHandState(dealInitialHands(physical));g.hands=hands;g.liveWall=live;g.deadWall=createDeadWall(dead);g.physicalWall=constructPhysicalWall(physical,'east',[3,4]);g.currentSeat=discarder;g.lastDrawSeat=discarder;g.phase='awaiting_discard';g.turnNumber=8;g.firstTurnYakumanEnabled=false;g.kuikaeEnabled=true;room.game=g;return{target,discarder};
}
export class LessonSixController{
 stage=-1;running=false;ready=false;private kind:Kind='chi';private fixture:ReturnType<typeof installLessonSix>;
 constructor(private manager:RoomManager,private room:Room){this.fixture=installLessonSix(room,'chi')}
 private player(s:Seat){return this.room.players.find(p=>p.seat===s)!}
 private pass(exceptEast=false){for(const s of SEATS){if(exceptEast&&s==='east')continue;const c=this.room.game!.claim,o=c?.options[s];if(c&&o&&!c.passed.includes(s)&&!this.room.pendingClaims?.responses[s]&&(o.ron||o.pon||o.kan||o.chiSequences.length))this.manager.passClaim(this.room.code,this.player(s).id)}}
 private prepare(kind:Kind){this.kind=kind;this.fixture=installLessonSix(this.room,kind);this.running=false;this.ready=false}
 private reveal(){this.manager.discard(this.room.code,this.player(this.fixture.discarder).id,this.fixture.target.id);this.pass(true);this.ready=true}
 private meld(){const id=this.player('east').id;if(this.kind==='chi')this.manager.chi(this.room.code,id,['1m','2m','3m']);else if(this.kind==='pon')this.manager.pon(this.room.code,id);else this.manager.kan(this.room.code,id);this.ready=false}
 private discardFace(face:string){const tile=this.room.game!.hands.east.find(t=>t.face===face);if(!tile)throw Error('Practice discard missing');this.manager.discard(this.room.code,this.player('east').id,tile.id);this.pass();this.ready=false}
 private followup(){this.manager.draw(this.room.code,this.player('south').id);const g=this.room.game!,tile=g.hands.south.at(-1)!;this.manager.discard(this.room.code,this.player('south').id,tile.id);this.pass(true);this.ready=true;if(this.kind==='chi'){const all=[...g.hands.east,tile,...g.melds.east.flatMap(m=>m.tiles.slice(0,3))],ev=evaluateWin(all,{method:'ron',closed:false,seatWind:'E',roundWind:'E',winningFace:tile.face,melds:g.melds.east});if(!detectAgari(all).winning||ev.legal)throw Error('Open no-yaku fixture invalid')}}
 get melded(){return this.room.game!.melds.east.length>0}
 get discarded(){return this.room.game!.discards.east.length>0}
 setStage(stage:number){if(!Number.isInteger(stage)||stage<0||stage>14)throw Error('Invalid lesson-six checkpoint');if(stage===this.stage)return false;const initial=this.stage<0;if(!initial){if(stage!==this.stage+1)throw Error('請依課程次序繼續。');if([3,7,12].includes(stage)&&!this.melded)throw Error('請先完成本步鳴牌。');if([4,8,13].includes(stage)&&!this.discarded)throw Error('請先打出指定牌。');if(stage===5&&!this.ready)throw Error('請先看完無役示範。');if(stage===9&&this.room.game!.result?.method!=='ron')throw Error('請先親自榮和。')}
  if(initial){const kind:Kind=stage<=4?'chi':stage<=9?'pon':'kan';this.prepare(kind);if([3,4,7,8,9,12,13,14].includes(stage)){this.reveal();this.meld()}if([4,8,9].includes(stage))this.discardFace('N');if(stage===4||stage===9)this.followup();if(stage===9)this.manager.ron(this.room.code,this.player('east').id);if(stage>=13)this.discardFace('9s')}
  else if(stage===5)this.prepare('pon');else if(stage===10)this.prepare('kan');this.stage=stage;this.running=[2,6,11].includes(stage)||stage===8||stage===4&&!initial;return true;
 }
 tick(){if(!this.running)return false;if([4,8].includes(this.stage))this.followup();else this.reveal();this.running=false;return true}
 call(kind:string){if(!this.ready||!([2,6,11].includes(this.stage))||kind!==this.kind)throw Error('請等待本步鳴牌機會。');this.meld()}
 discard(id:string){const g=this.room.game!,tile=g.hands.east.find(t=>t.id===id),face=this.stage===12?'9s':'N';if(![3,7,12].includes(this.stage)||!this.melded||tile?.face!==face)throw Error('請打出本步標示的牌。');this.discardFace(face)}
 win(){if(this.stage!==8||!this.ready)throw Error('請等待本步榮和機會。');this.manager.ron(this.room.code,this.player('east').id)}
}
