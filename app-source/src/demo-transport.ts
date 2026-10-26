import {shiftBotClocks} from './bot-save';
import {tableMotionBusy,reserveTableMotion,cancelTableMotion} from './motion-state.js';
import {installDemoWin,type DemoHand} from '../rules/demo-hands.js';
import {ResultClock} from '../rules/result-clock';
import {TIER_TURN_MS} from '../rules/rules';
import type {BotDifficulty} from '../rules/bot';
import {RoomManager,type Room} from '../rules/room';
type DemoRoom=Room & {openingStartedAt?:number;openingDealSlots?:number[];riichiTileIds?:Partial<Record<import('@bunny/riichi-engine').Seat,string>>};
/** Standalone single-player demo: unchanged game rules, browser-local transport. */
class DemoSocket {
 connected=false;private listeners=new Map<string,Set<(value?:any)=>void>>();private manager=new RoomManager();private room!:DemoRoom;private playerId='';private timer:number|undefined;private turnKey='';private qaPaused=false;private presentationUntil=0;private presentationEvent=0;private presentationKey='';private demoOnly=false;private restoredAt=0;private clockPausedAt=0;private owner=crypto.randomUUID();private ownership=false;private restoreNotice='';private unbind:(()=>void)[]=[];
 constructor(){if(!this.restore())this.reset();if(import.meta.env.DEV)(window as any).__bunnyQA={pause:(v=true)=>{this.qaPaused=v;},openingAge:(age:number)=>{this.room.openingStartedAt=Date.now()-age;this.publish();},sharedResults:()=>{this.room.players.forEach((p,i)=>{p.isBot=false;if(i)p.autoPlay=true});new ResultClock(this.manager).tick(this.room);this.room.revision++;this.publish();},resultTick:(now:number)=>{new ResultClock(this.manager).tick(this.room,now);this.room.revision++;this.publish();},snapshot:()=>this.manager.getPlayerGameState(this.room.code,this.playerId),scenario:async(name:string)=>{if(String(name).startsWith('priority57:')){const {installPriorityFixture}=await import('../qa/priority57-fixtures');installPriorityFixture(this.manager,this.room,String(name).split(':')[1] as any)}else{const {installScenario}=await import('../qa/scenarios');installScenario(this.manager,this.room,name as any);}this.room.openingStartedAt=0;delete this.room.openingDealSlots;this.turnKey='';this.publish();this.schedule();},skipOpening:()=>{this.room.openingStartedAt=0;this.turnKey='';this.publish();},respond:(seat:string,kind:string,faces?:any)=>{const p=this.room.players.find(p=>p.seat===seat)!;if(kind==='ron')this.manager.ron(this.room.code,p.id);else if(kind==='pon')this.manager.pon(this.room.code,p.id);else if(kind==='chi')this.manager.chi(this.room.code,p.id,faces);else this.manager.passClaim(this.room.code,p.id);this.room.revision++;this.publish();},finishCinematic:()=>{if(this.room.cinematic)this.room.cinematic.endsAt=0;this.manager.completeCinematic(this.room.code);this.room.revision++;this.publish();},expire:()=>{const old=this.qaPaused;this.qaPaused=false;this.room.actionDeadline=Date.now()-1;this.tick();this.qaPaused=old;}};}
 private attach(){if(this.unbind.length)return;this.listen('bunny:table-ready',()=>{if(this.restoredAt){shiftBotClocks(this.room,Date.now()-this.restoredAt);this.restoredAt=0;this.turnKey=this.decisionKey()}else this.turnKey='';this.publish();this.schedule()});this.listen('demo:restart',()=>{this.reset();this.publish();this.schedule();});
 this.listen('pagehide',()=>{if(this.clockPausedAt)return;this.persist();this.clockPausedAt=Date.now();clearTimeout(this.timer)});
 this.listen('pageshow',()=>{if(!this.clockPausedAt)return;shiftBotClocks(this.room,Date.now()-this.clockPausedAt);this.clockPausedAt=0;if(this.ownership&&!window.BunnyBotSave?.owns(this.owner))return;this.publish();this.schedule()});
 this.listen('storage',raw=>{const event=raw as StorageEvent;if(this.connected&&this.ownership&&event.key===window.BunnyBotSave?.ownerKey&&event.newValue!==this.owner){this.connected=false;clearTimeout(this.timer);this.dispatch('disconnect','此牌局已在另一分頁繼續，請返回大廳或重新整理此頁。')}});
 }
 private listen(type:string,listener:EventListener){window.addEventListener(type,listener);this.unbind.push(()=>window.removeEventListener(type,listener))}
 private visualHandKey(){const m=this.room.handMatch??this.room.match;return[m.roundWind,m.handNumber,m.honba,m.dealer].join(':')}
 private decisionKey(){const g=this.room.game!;return[g.phase,g.turnNumber,g.currentSeat,g.claim?.tile.id,this.room.settled].join(':')}
 private consumeIntent(){const url=new URL(location.href);url.searchParams.delete('intent');const ms=this.room.rules.actionTimeoutMs;url.searchParams.set('difficulty',ms===10000?'high':ms===20000?'medium':'low');history.replaceState(history.state,'',url)}
 private restore(){const api=window.BunnyBotSave;if(new URLSearchParams(location.search).get('intent')==='new'||!api)return false;const saved=api.read();if(!saved){api.archiveInvalid();return false;}
  try{const manager=new RoomManager();manager.restoreRooms([saved.room]);const original=saved.room.players.find(p=>p.id===saved.playerId)!;const {room,player}=manager.reconnect(saved.room.code,saved.playerId,original.resumeToken);player.autoPlay=!!original.autoPlay;if(room.match.finished&&room.settled){room.resultFlow={id:'local-final:'+room.code,phase:'ranking',deadline:0,ready:[]};if(room.cinematic)room.cinematic.phase='results';}this.manager=manager;this.room=room;this.playerId=player.id;room.events=[];shiftBotClocks(room,Math.max(0,Date.now()-saved.savedAt));this.restoredAt=Date.now();this.turnKey=this.decisionKey();this.presentationKey=this.visualHandKey();this.presentationEvent=room.eventSequence??0;return true}catch{api.archiveInvalid();this.restoreNotice='舊存檔無法讀取，已保留備份並開始新對局。';return false}
 }
 private persist(){if(this.demoOnly||!this.connected||window.__bunnyLoading||this.clockPausedAt||this.ownership&&!window.BunnyBotSave?.owns(this.owner))return;const ok=window.BunnyBotSave?.write({version:1,savedAt:Date.now(),playerId:this.playerId,room:this.room});if(ok===false)this.dispatch('local:save-error','瀏覽器未能保存本局；關閉前請留在此頁。')}

 private reset(){this.demoOnly=false;this.restoredAt=0;cancelTableMotion();this.presentationEvent=0;this.presentationUntil=0;this.presentationKey='';this.manager=new RoomManager();const {room,player}=this.manager.createRoom('玩家');this.room=room;this.playerId=player.id;this.manager.setRules(room.code,player.id,{matchLength:'tonpuusen'});const raw=new URLSearchParams(location.search).get('difficulty');const difficulty:BotDifficulty=raw==='low'||raw==='high'?raw:'medium';this.manager.setRules(room.code,player.id,{actionTimeoutMs:TIER_TURN_MS[difficulty]});for(const [name,profile] of [['忍者兔','aggressive'],['國王兔','balanced'],['巫師兔','defensive']] as const)this.manager.addBot(room.code,player.id,name,profile,difficulty);this.manager.setReady(room.code,player.id,true);this.manager.startGame(room.code,player.id);this.room.openingStartedAt=0;this.turnKey='';localStorage.removeItem('bunny-riichi-session');}
 on(name:string,listener:(value?:any)=>void){if(!this.listeners.has(name))this.listeners.set(name,new Set());this.listeners.get(name)!.add(listener);return this;}
 removeAllListeners(){this.listeners.clear();return this;}
 private dispatch(name:string,value?:any){for(const listener of this.listeners.get(name)??[])listener(value);}
 connect(){if(this.connected)return this;this.consumeIntent();this.attach();this.ownership=window.BunnyBotSave?.claim(this.owner)??false;this.connected=true;queueMicrotask(()=>{this.dispatch('connect');this.publish();if(this.restoreNotice)this.dispatch('local:save-error',this.restoreNotice);this.schedule();});return this;}
 disconnect(){this.persist();this.connected=false;clearTimeout(this.timer);this.unbind.splice(0).forEach(remove=>remove());this.dispatch('disconnect');return this;}
 timeout(_ms:number){return {emit:(name:string,payload:any,callback:(error:any,result:any)=>void)=>this.perform(name,payload,result=>callback(null,result))};}
 emit(name:string,payload:any,callback?:(result:any)=>void){this.perform(name,payload,callback);return this;}
 private publish(){if(!this.connected)return;const g=this.room.game!;
  const key=[g.phase,g.turnNumber,g.currentSeat,g.claim?.tile.id,this.room.settled].join(':');
  if(key!==this.turnKey){this.turnKey=key;this.room.actionDeadline=Date.now()+(g.phase==='awaiting_claim'?12000:this.room.rules.actionTimeoutMs);}
  if(this.room.settled)delete this.room.actionDeadline;
const state=this.manager.getPlayerGameState(this.room.code,this.playerId);
  const handKey=this.visualHandKey();
  if(handKey!==this.presentationKey){this.room.riichiTileIds={};this.presentationKey=handKey;this.presentationEvent=0;this.presentationUntil=0;}
  const fresh=(state.hand.events??[]).filter(e=>e.id>this.presentationEvent);this.presentationEvent=Math.max(this.presentationEvent,...(state.hand.events??[]).map(e=>e.id));
  if(this.room.pendingRiichi){const p=this.room.pendingRiichi;(this.room.riichiTileIds??={})[p.seat]=p.discardId}
  for(const event of fresh.filter(e=>e.kind==='RIICHI')){const id=g.discards[event.seat].at(-1)?.id;if(id)(this.room.riichiTileIds??={})[event.seat]??=id}
  Object.assign(state.hand,{riichiTileIds:this.room.riichiTileIds??{}});
  if(fresh.length)this.presentationUntil=Math.max(this.presentationUntil,Date.now()+(fresh.some(e=>['RON','TSUMO'].includes(e.kind))?3900:fresh.some(e=>e.kind==='RIICHI')?1500:1250));
  if((g.results??(g.result?[g.result]:[])).some(r=>g.riichi[r.winner].declared))Object.assign(state.hand,{uraIndicators:g.deadWall.uraIndicators.slice(0,g.deadWall.revealedDoraCount)});
  this.persist();this.dispatch('room:state',this.manager.getPublicState(this.room.code));this.dispatch('game:state',state);}
 private perform(name:string,p:any,callback?:(result:any)=>void){
  try{if(this.ownership&&!window.BunnyBotSave?.owns(this.owner)){this.connected=false;clearTimeout(this.timer);throw Error('此牌局已在另一分頁繼續，請返回大廳。')}const c=this.room.code,id=this.playerId;if(name==='game:report-complete'){new ResultClock(this.manager).reportComplete(this.room,id,p.id);callback?.({ok:true,data:{}});return;}if(window.__bunnyLoading&&name.startsWith('game:')){callback?.({ok:false,error:{code:'LOADING',message:'正在準備牌桌'}});return;}
   if(name.startsWith('game:')&&name!=='game:demo-win'&&name!=='game:next-hand'&&name!=='game:resume-control'&&tableMotionBusy()){callback?.({ok:true,data:{}});return;}
   if(name.startsWith('game:')&&this.room.players.find(player=>player.id===id)?.autoPlay&&!['game:resume-control','game:next-hand','game:demo-win'].includes(name))throw Error('請先返回自己操作。');
   if(name.startsWith('game:')&&name!=='game:resume-control'&&p.revision!==undefined&&p.revision!==this.room.revision)throw new Error('牌局已更新，請再操作。');
   switch(name){
    case 'room:reconnect':callback?.({ok:true,data:{playerId:id,room:this.manager.getPublicState(c)}});this.publish();this.schedule();return;
    case 'game:demo-win':this.reset();this.demoOnly=true;installDemoWin(this.manager,this.room,this.playerId,p.kind as DemoHand);this.room.demoCharacter=['yellow','king','ninja','wizard'].includes(p.character)?p.character:'yellow';if(this.room.cinematic)this.room.cinematic.character=this.room.demoCharacter!;break;
    case 'game:resume-control':this.manager.resumeControl(c,id);this.room.revision++;callback?.({ok:true,data:{}});this.publish();this.schedule();return;
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
