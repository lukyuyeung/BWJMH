import type {Room,RoomManager} from './room';
/** Authoritative multiplayer barrier. Host must authenticate acknowledgements and broadcast tick changes. */
export class ResultClock{
 constructor(private manager:RoomManager){}
 tick(room:Room,now=Date.now()):boolean{
  if(!room.settled||room.players.filter(p=>!p.isBot).length<2)return false;
  if(room.cinematic?.phase==='playing'){if(!this.manager.completeCinematic(room.code,now))return false;}
  let flow=room.resultFlow;
  if(!flow){room.resultFlow={id:room.code+':'+room.revision+':'+now,phase:room.game?.result?'report':'hold',deadline:now+(room.game?.result?60000:3000),ready:[]};return true;}
  if(flow.phase==='report'){
   const viewers=room.players.filter(p=>!p.isBot&&p.connected&&!p.autoPlay);
   if(viewers.every(p=>flow!.ready.includes(p.id))||now>=flow.deadline){flow.phase='hold';flow.deadline=now+3000;return true;}
  }else if(flow.phase==='hold'&&now>=flow.deadline){flow.phase='scores';flow.deadline=now+3000;return true;}
  else if(flow.phase==='scores'&&now>=flow.deadline){
   if(room.match.finished){flow.phase='ranking';flow.deadline=0;}
   else{delete room.resultFlow;this.manager.startNextHand(room.code);}
   return true;
  }return false;
 }
 /** playerId must come from authenticated session; id rejects stale acknowledgements. */
 reportComplete(room:Room,playerId:string,id:string):boolean{
  const flow=room.resultFlow,p=room.players.find(p=>p.id===playerId);
  if(!p||p.isBot||!p.connected||flow?.phase!=='report'||flow.id!==id||flow.ready.includes(playerId))return false;
  flow.ready.push(playerId);return true;
 }
}
