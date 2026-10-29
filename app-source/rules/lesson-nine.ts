import {RoomManager,type Room} from './room';
import {installLessonEight} from './lesson-eight';
import {LessonFiveController} from './lesson-five';
/** Two physical engine-driven exercises; the graduate must discard, declare, scratch and win. */
export class LessonNineController{
 stage=-1;phase='ready';feedback='';evidenceId='';private five?:LessonFiveController;private pass=()=>{};
 constructor(private manager:RoomManager,private room:Room){this.defense()}
 get running(){return this.five?.running??false}get ready(){return this.five?this.five.ready||!this.running:true}get armed(){return this.five?.armed??false}
 private defense(){const data=installLessonEight(this.manager,this.room,'defend');this.pass=data.pass;this.evidenceId=data.riverId;this.phase='ready';this.five=undefined}
 private defend(){const tile=this.room.game!.hands.east.find(t=>t.face==='9p')!;this.manager.discard(this.room.code,this.room.players.find(p=>p.seat==='east')!.id,tile.id);this.pass();this.phase='defended'}
 setStage(stage:number){if(!Number.isInteger(stage)||stage<0||stage>10)throw Error('Invalid lesson-nine checkpoint');if(stage===this.stage)return false;const initial=this.stage<0;
  if(!initial){if(stage!==this.stage+1)throw Error('請依課程次序繼續。');if(stage===2&&this.phase!=='defended')throw Error('請先親手打出現物。');if(stage===5&&!this.room.game!.riichi.east.declared)throw Error('請先親手宣告立直。');if(stage===7&&this.room.game!.discards.east.length!==2)throw Error('請先揭曉並完成摸切。');if(stage>=8&&!this.room.game!.result)throw Error('請先親手自摸。')}
  if(initial){if(stage<=2){this.defense();if(stage===2)this.defend()}else{this.five=new LessonFiveController(this.manager,this.room);if(stage>=4)this.five.setStage(stage===4?3:stage===5?4:stage===6?5:stage===7?7:8)}}
  else if(stage===3)this.five=new LessonFiveController(this.manager,this.room);
  else if(stage===4)this.five!.setStage(3);
  else if(stage===5)this.five!.setStage(4);
  else if(stage===6)this.five!.setStage(5);
  else if(stage===7){this.five!.setStage(6);this.five!.setStage(7)}
  else if(stage===8)this.five!.setStage(8);
  this.stage=stage;this.feedback='';return true;
 }
 discard(id:string){if(this.stage===1){const tile=this.room.game!.hands.east.find(t=>t.id===id);if(tile?.face!=='9p'){this.feedback='先看立直者自己打過的牌；本例有一張現物可用。';return false}this.defend();return true}if(this.stage===4){if(!this.armed){this.feedback='請先按立直，再選擇打出的牌。';return false}if(this.room.game!.hands.east.find(t=>t.id===id)?.face!=='N'){this.feedback='找出打出後仍聽牌的孤立牌；需要時可按提示。';return false}this.five!.discard(id);return true}throw Error('本步先觀察牌桌。')}
 arm(){if(this.stage!==4)throw Error('本步不需立直。');this.five!.arm()}
 tick(){return this.five?.tick()??false}
 tsumogiri(){if(this.stage!==6)throw Error('本步不需摸切。');this.five!.tsumogiri()}
 win(){if(this.stage!==7)throw Error('本步不需自摸。');this.five!.win()}
}
