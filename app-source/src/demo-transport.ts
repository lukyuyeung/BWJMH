import {tableMotionBusy,reserveTableMotion,cancelTableMotion} from './motion-state.js';
import {installDemoWin,type DemoHand} from '../rules/demo-hands.js';
import type {BotDifficulty} from '../rules/bot';
import {RoomManager,type Room} from '../rules/room';
type DemoRoom=Room & {openingStartedAt?:number;openingDealSlots?:number[]};
/** Standalone single-player demo: unchanged game rules, browser-local transport. */
class DemoSocket {
 connected=false;private listeners=new Map<string,Set<(value?:any)=>void>>();private manager=new RoomManager();private room!:DemoRoom;private playerId='';private timer:number|undefined;private turnKey='';private qaPaused=false;private presentationUntil=0;private presentationEvent=0;private presentationKey='';
 constructor(){this.reset();if(import.meta.env.DEV)(window as any).__bunnyQA={pause:(v=true)=>{this.qaPaused=v;},openingAge:(age:number)=>{this.room.openingStartedAt=Date.now()-age;this.publish();},snapshot:()=>this.manager.getPlayerGameState(this.room.code,this.playerId),scenario:async(name:string)=>{if(String(name).startsWith('priority57:')){const {installPriorityFixture}=await import('../qa/priority57-fixtures');installPriorityFixture(this.manager,this.room,String(name).split(':')[1] as any)}else{const {installScenario}=await import('../qa/scenarios');installScenario(this.manager,this.room,name as any);}this.room.openingStartedAt=0;delete this.room.openingDealSlots;this.turnKey='';this.publish();this.schedule();},skipOpening:()=>{this.room.openingStartedAt=0;this.turnKey='';this.publish();},respond:(seat:string,kind:string,faces?:any)=>{const p=this.room.players.find(p=>p.seat===seat)!;if(kind==='ron')this.manager.ron(this.room.code,p.id);else if(kind==='pon')this.manager.pon(this.room.code,p.id);else if(kind==='chi')this.manager.chi(this.room.code,p.id,faces);else this.manager.passClaim(this.room.code,p.id);this.room.revision++;this.publish();},finishCinematic:()=>{if(this.room.cinematic)this.room.cinematic.endsAt=0;this.manager.completeCinematic(this.room.code);this.room.revision++;this.publish();},expire:()=>{const old=this.qaPaused;this.qaPaused=false;this.room.actionDeadline=Date.now()-1;this.tick();this.qaPaused=old;}};window.addEventListener('bunny:table-ready',()=>{this.turnKey='';this.publish();this.schedule()});window.addEventListener('demo:restart',()=>{this.reset();this.publish();this.schedule();});}
 private reset(){cancelTableMotion();this.presentationEvent=0;this.presentationUntil=0;this.presentationKey='';this.manager=new RoomManager();const {room,player}=this.manager.createRoom('玩家');this.room=room;this.playerId=player.id;this.manager.setRules(room.code,player.id,{matchLength:'tonpuusen'});const raw=new URLSearchParams(location.search).get('difficulty');const difficulty:BotDifficulty=raw==='low'||raw==='high'?raw:'medium';for(const [name,profile] of [['忍者兔','aggressive'],['國王兔','balanced'],['巫師兔','defensive']] as const)this.manager.addBot(room.code,player.id,name,profile,difficulty);this.manager.setReady(room.code,player.id,true);this.manager.startGame(room.code,player.id);this.room.openingStartedAt=0;this.turnKey='';localStorage.removeItem('bunny-riichi-session');}
 on(name:string,listener:(value?:any)=>void){if(!this.listeners.has(name))this.listeners.set(name,new Set());this.listeners.get(name)!.add(listener);return this;}
 removeAllListeners(){this.listeners.clear();return this;}
 private dispatch(name:string,value?:any){for(const listener of this.listeners.get(name)??[])listener(value);}
 connect(){if(this.connected)return this;this.connected=true;queueMicrotask(()=>{this.dispatch('connect');this.publish();this.schedule();});return this;}
 disconnect(){this.connected=false;clearTimeout(this.timer);this.dispatch('disconnect');return this;}
 timeout(_ms:number){return {emit:(name:string,payload:any,callback:(error:any,result:any)=>void)=>this.perform(name,payload,result=>callback(null,result))};}
 emit(name:string,payload:any,callback?:(result:any)=>void){this.perform(name,payload,callback);return this;}
 private publish(){if(!this.connected)return;const g=this.room.game!;
  const key=[g.phase,g.turnNumber,g.currentSeat,g.claim?.tile.id,this.room.settled].join(':');
  if(key!==this.turnKey){this.turnKey=key;this.room.actionDeadline=Date.now()+(g.phase==='awaiting_claim'?12000:30000);}
  if(this.room.settled)delete this.room.actionDeadline;
const state=this.manager.getPlayerGameState(this.room.code,this.playerId);
  const handKey=[this.room.match.roundWind,this.room.match.handNumber,this.room.match.honba].join(':');
  if(handKey!==this.presentationKey){this.presentationKey=handKey;this.presentationEvent=0;this.presentationUntil=0;}
  const fresh=(state.hand.events??[]).filter(e=>e.id>this.presentationEvent);this.presentationEvent=Math.max(this.presentationEvent,...(state.hand.events??[]).map(e=>e.id));
  if(fresh.length)this.presentationUntil=Math.max(this.presentationUntil,Date.now()+(fresh.some(e=>['RON','TSUMO'].includes(e.kind))?3900:fresh.some(e=>e.kind==='RIICHI')?1500:1250));
  if((g.results??(g.result?[g.result]:[])).some(r=>g.riichi[r.winner].declared))Object.assign(state.hand,{uraIndicators:g.deadWall.uraIndicators.slice(0,g.deadWall.revealedDoraCount)});
  this.dispatch('room:state',this.manager.getPublicState(this.room.code));this.dispatch('game:state',state);}
 private perform(name:string,p:any,callback?:(result:any)=>void){
  try{const c=this.room.code,id=this.playerId;if(window.__bunnyLoading&&name.startsWith('game:')){callback?.({ok:false,error:{code:'LOADING',message:'正在準備牌桌'}});return;}
   if(name.startsWith('game:')&&name!=='game:demo-win'&&name!=='game:next-hand'&&tableMotionBusy()){callback?.({ok:true,data:{}});return;}
   if(name.startsWith('game:')&&this.room.players.find(player=>player.id===id)?.autoPlay&&!['game:resume-control','game:next-hand','game:demo-win'].includes(name))throw Error('請先返回自己操作。');
   if(name.startsWith('game:')&&p.revision!==undefined&&p.revision!==this.room.revision)throw new Error('牌局已更新，請再操作。');
   switch(name){
    case 'room:reconnect':callback?.({ok:true,data:{playerId:id,room:this.manager.getPublicState(c)}});this.publish();this.schedule();return;
    case 'game:demo-win':this.reset();installDemoWin(this.manager,this.room,this.playerId,p.kind as DemoHand);break;
    case 'game:resume-control':this.manager.resumeControl(c,id);break;
    case 'game:draw':this.manager.draw(c,id);break;
    case 'game:discard':this.manager.discard(c,id,p.tileId);break;
    case 'game:riichi-discard':this.manager.riichiDiscard(c,id,p.tileId);break;
    case 'game:chi':this.manager.chi(c,id,p.faces);break;
    case 'game:pon':this.manager.pon(c,id);break;
    case 'game:kan':this.manager.kan(c,id);break;
    case 'game:ankan':this.manager.ankan(c,id,p.tileId);break;
    case 'game:kakan':this.manager.kakan(c,id,p.tileId);break;
    case 'game:ron':this.manager.ron(c,id);break;
    case 'game:tsumo':this.manager.tsumo(c,id);break;
    case 'game:pass-claim':this.manager.passClaim(c,id);break;
    case 'game:abortive-draw':this.manager.abortiveDraw(c,id);break;
    case 'game:next-hand':this.manager.startNextHand(c);this.room.openingStartedAt=0;break;
    default:throw new Error('此預覽提供單人牌局。');
   }
   this.room.revision++;reserveTableMotion(this.room.code,this.room.revision);callback?.({ok:true,data:{}});this.publish();this.schedule();
  }catch(error){callback?.({ok:false,error:{code:'DEMO_ACTION',message:error instanceof Error?error.message:'操作未能完成'}});this.publish();}
 }
 private schedule(){clearTimeout(this.timer);const cinematic=this.room.cinematic,delay=cinematic?.phase==='playing'?Math.max(50,cinematic.endsAt-Date.now()+15):Math.max(650,this.presentationUntil-Date.now());if(this.connected)this.timer=window.setTimeout(()=>this.tick(),delay);}
 private tick(){if(!this.connected)return;if(window.__bunnyLoading){this.timer=window.setTimeout(()=>this.tick(),100);return;}if(tableMotionBusy()){this.timer=window.setTimeout(()=>this.tick(),60);return;}if(this.qaPaused){this.schedule();return;}try{
  if(this.manager.completeCinematic(this.room.code)){this.room.revision++;this.publish();}
  const game=this.room.game!;if(['won','exhaustive_draw','abortive_draw'].includes(game.phase)){this.schedule();return;}
  let acted=false;
  if(this.manager.advanceAutoPlay(this.room.code)){this.room.revision++;reserveTableMotion(this.room.code,this.room.revision);this.publish();this.schedule();return;}
  if(this.room.actionDeadline&&Date.now()>=this.room.actionDeadline){
   const human=this.room.players.find(p=>!p.isBot)!;const before=JSON.stringify(game);this.manager.expirePlayerTurn(this.room.code,human.id);
   if(before!==JSON.stringify(game)){this.room.revision++;reserveTableMotion(this.room.code,this.room.revision);this.publish();this.schedule();return;}
  }
  for(const bot of this.room.players.filter(p=>p.isBot)){
   const state=this.manager.getPlayerGameState(this.room.code,bot.id);
   if(state.hand.actions.canPassClaim||state.hand.currentSeat===bot.seat){const before=JSON.stringify({game,pending:this.room.pendingClaims});this.manager.actBot(this.room.code,bot.id);if(JSON.stringify({game,pending:this.room.pendingClaims})!==before){acted=true;break;}}
  }
  if(acted){this.room.revision++;reserveTableMotion(this.room.code,this.room.revision);this.publish();}
 }catch(error){console.error('Demo turn error',error);}this.schedule();}
}
export type Socket=DemoSocket;
export const io=(_server?:string,_options?:unknown)=>new DemoSocket();
