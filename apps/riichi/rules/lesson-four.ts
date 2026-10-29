import {countDora,doraFromIndicator,visibleDoraIndicators,detectAgari,evaluateWin} from '@bunny/riichi-engine';import {RoomManager,type Room} from './room';import {installLessonThree} from './lesson-three';
export function installLessonFour(room:Room,kind:'normal'|'red'|'no-yaku'|'win'){
 return installLessonThree(room,kind==='no-yaku'?'no-yaku':'ron',{ownFaces:kind==='no-yaku'?'3m 4m 5m 6m 7m 8m 7p 8p 9p 2s 3s E E':'3m 4m 5m 7p 8p 9p 2s 3s 4s P P E E',indicator:'4m',redFace:kind==='normal'?undefined:'5m',handNumber:kind==='normal'?1:kind==='red'?2:kind==='no-yaku'?3:1});
}
export class LessonFourController{
 stage=-1;running=false;ready=false;indicatorSeen=false;selectedId?:string;private target;
 constructor(private manager:RoomManager,private room:Room){this.target=installLessonFour(room,'normal')}
 counts(){return countDora(this.room.game!.hands.east,visibleDoraIndicators(this.room.game!.deadWall))}
 private prepare(kind:'normal'|'red'|'no-yaku'|'win'){this.target=installLessonFour(this.room,kind);this.running=false;this.ready=false;delete this.selectedId}
 private reveal(){this.manager.discard(this.room.code,this.room.players.find(p=>p.seat==='south')!.id,this.target.id);for(const p of this.room.players.filter(p=>p.seat!=='east'))if(this.manager.getPlayerGameState(this.room.code,p.id).hand.actions.canPassClaim)this.manager.passClaim(this.room.code,p.id);this.running=false;this.ready=true;
 if(this.stage===6){const g=this.room.game!,tiles=[...g.hands.east,this.target],ev=evaluateWin(tiles,{method:'ron',closed:true,seatWind:'E',roundWind:'E',winningFace:'4s',bonusHan:this.counts().total});if(!detectAgari(tiles).winning||ev.legal||ev.yaku.length||this.counts().total!==2)throw Error('Bonus-only teaching example invalid')}
 }
 setStage(stage:number){if(!Number.isInteger(stage)||stage<0||stage>10)throw Error('Invalid lesson-four checkpoint');if(stage===this.stage)return false;const initial=this.stage<0;if(!initial&&stage!==this.stage+1)throw Error('請依課程次序繼續。');if(!initial&&stage===2&&!this.indicatorSeen)throw Error('請先找到指示牌。');if(!initial&&stage===5&&!this.selectedId)throw Error('請先選出真正寶牌。');if(!initial&&stage===7&&!this.ready)throw Error('請先看完寶牌不能代替役的示範。');if(!initial&&stage===8&&this.room.game!.result?.method!=='ron')throw Error('請先親自榮和。');this.stage=stage;
 if(stage<=4)this.prepare('normal');else if(stage===5)this.prepare('red');else if(stage===6){this.prepare('no-yaku');this.running=true}else if(stage===7){this.prepare('win');this.running=true}else if(initial&&stage>=8){this.prepare('win');this.reveal();this.win()}
 return true;
 }
 seeIndicator(){if(this.stage!==1)throw Error('請按本步指示繼續。');this.indicatorSeen=true}
 select(id:string){if(this.stage!==4)throw Error('現在不是選寶牌的步驟。');const g=this.room.game!,t=g.hands.east.find(t=>t.id===id);if(!t||t.face!==doraFromIndicator(visibleDoraIndicators(g.deadWall)[0]!.face))throw Error('請選指示牌的下一張。');this.selectedId=id}
 tick(){if(!this.running)return false;this.reveal();return true}
 win(){if(!this.ready||![7,8,9,10].includes(this.stage))throw Error('請等待合法榮和機會。');this.manager.ron(this.room.code,this.room.players.find(p=>p.seat==='east')!.id)}
}
