import {createStandardWall,createDeadWall,constructPhysicalWall,createHandState,dealInitialHands,SEATS,type Seat,type Tile} from '@bunny/riichi-engine';
import {RoomManager,type Room} from './room';
import {installLessonThree} from './lesson-three';
type Example='shape'|'waits'|'defend'|'attack';
/** Fixed physical teaching walls; declarations and student discards use the normal rules engine. */
export function installLessonEight(manager:RoomManager,room:Room,example:Example){
 installLessonThree(room,'ron');
 const pool=createStandardWall(room.rules.akaDora),take=(faces:string)=>faces.split(' ').filter(Boolean).map(face=>{const i=pool.findIndex(t=>t.face===face&&!t.red);if(i<0)throw Error('Lesson eight allocation: '+face);return pool.splice(i,1)[0]!});
 const defense=example==='defend'||example==='attack';
 const own=take(example==='shape'?'2m 3m 4m 5m 6m 2p 3p 4p 6s 7s 8s E E 9p':example==='waits'?'1m 2m 3m 4p 5p 6p 2s 3s 4s 5s 6s P P P':example==='defend'?'2m 3m 4p 5p 6s 7s E E 9p 1s 8m P F':'1m 2m 3m 4p 5p 6p 2s 3s P P P E E');
 const hands={east:own,south:defense?take('1p 2p 3p 7m 8m 9m 5s 6s F F F S S 9p'):[],west:[],north:[]} as Record<Seat,Tile[]>;
 const rivers={east:[],south:defense?take('E'):[],west:example==='waits'?take('3s 3s 6s'):[],north:[]} as Record<Seat,Tile[]>;
 const draws=defense?take(example==='defend'?'7p W N':'7p W 9s'):[];const indicator=take('8s')[0]!;
 for(const seat of SEATS)while(hands[seat].length<13)hands[seat].push(pool.shift()!);
 const dead=pool.splice(-13);dead.splice(4,0,indicator);const live=[...draws,...pool],physical=[...SEATS.flatMap(s=>hands[s]),...SEATS.flatMap(s=>rivers[s]),...live,...dead];
 if(physical.length!==136||new Set(physical.map(t=>t.id)).size!==136)throw Error('Lesson eight physical wall');
 const g=createHandState(dealInitialHands(physical));g.hands=hands;g.discards=rivers;g.discardedFaces=Object.fromEntries(SEATS.map(s=>[s,rivers[s].map(t=>t.face)])) as typeof g.discardedFaces;g.liveWall=live;g.deadWall=createDeadWall(dead);g.physicalWall=constructPhysicalWall(physical,'east',[3,4]);g.currentSeat=defense?'south':'east';g.lastDrawSeat=g.currentSeat;g.phase='awaiting_discard';g.turnNumber=8;g.firstTurnYakumanEnabled=false;g.doubleRiichiEnabled=false;room.game=g;
 const player=(s:Seat)=>room.players.find(p=>p.seat===s)!;
 const pass=()=>{for(const s of SEATS){const c=g.claim,o=c?.options[s];if(c&&o&&!c.passed.includes(s)&&!room.pendingClaims?.responses[s]&&(o.ron||o.pon||o.kan||o.chiSequences.length))manager.passClaim(room.code,player(s).id)}};
 if(defense){manager.riichiDiscard(room.code,player('south').id,hands.south.at(-1)!.id);pass();for(const seat of ['west','north'] as Seat[]){manager.draw(room.code,player(seat).id);manager.discard(room.code,player(seat).id,hands[seat].at(-1)!.id);pass()}manager.draw(room.code,player('east').id);if(example==='attack'){manager.discard(room.code,player('east').id,hands.east.at(-1)!.id);pass()}}
 return{pass,riverId:rivers.south.at(-1)?.id??''};
}
export class LessonEightController{
 stage=-1;running=false;ready=true;phase='idle';feedback='';evidenceId='';private pass=()=>{};
 constructor(private manager:RoomManager,private room:Room){this.prepare('shape')}
 private prepare(example:Example){const s=installLessonEight(this.manager,this.room,example);this.pass=s.pass;this.evidenceId=s.riverId;this.phase='ready';this.feedback=''}
 private expected(){return this.stage===1?'9p':this.stage===4?'6s':'9p'}
 setStage(stage:number){if(!Number.isInteger(stage)||stage<0||stage>13)throw Error('Invalid lesson-eight checkpoint');if(stage===this.stage)return false;const initial=this.stage<0;
 if(!initial){if(stage!==this.stage+1)throw Error('請依課程次序繼續。');if([2,5,9].includes(stage)&&this.phase!=='discarded')throw Error('請先親手完成出牌。');if(stage===8&&this.phase!=='found')throw Error('請先找出立直者打過的九筒。')}
 this.stage=stage;this.feedback='';
 if(initial||[0,3,6,11].includes(stage)){this.prepare(stage<3?'shape':stage<6?'waits':stage<11?'defend':'attack');if(initial&&[2,5,9,10].includes(stage))this.performDiscard(stage===2?'9p':stage===5?'6s':'9p');if(initial&&stage===8)this.phase='found'}
 return true;
 }
 private performDiscard(face:string){const tile=this.room.game!.hands.east.find(t=>t.face===face);if(!tile)throw Error('Teaching discard missing');this.manager.discard(this.room.code,this.room.players.find(p=>p.seat==='east')!.id,tile.id);this.pass();this.phase='discarded'}
 discard(id:string){if(![1,4,8].includes(this.stage)||this.phase==='discarded')throw Error('本步先觀察牌桌。');const t=this.room.game!.hands.east.find(t=>t.id===id);if(!t)throw Error('請選擇自己的手牌。');if(t.face!==this.expected()){this.feedback=this.stage===1?'這次先保留二三萬搭子，試試孤立的九筒。':this.stage===4?'先試打六索，留下二三四五索，比較二索／五索的未見枚數。':'請找手上的九筒：立直者自己已經打過它。其他牌未必安全。';return false}this.performDiscard(t.face);this.feedback='出牌完成。';return true}
 evidence(id:string){if(this.stage!==7)throw Error('本步不需找現物。');if(id!==this.evidenceId){this.feedback='請找右方立直者橫放的九筒。';return false}this.phase='found';this.feedback='找到了：這是他自己打過的九筒。';return true}
 tick(){return false}
}
