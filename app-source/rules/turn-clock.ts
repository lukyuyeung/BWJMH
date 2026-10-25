import type {Room,RoomManager} from './room';
/** Host-owned clock for multiplayer. Call from a server loop, never trust client deadlines. */
export class TurnClock{
 private turns=new Map<string,{key:string;deadline:number;nextAutoAt:number}>();
 constructor(private manager:RoomManager){}
 tick(room:Room,now=Date.now()):boolean{
  const g=room.game;if(!g||room.phase!=='playing'||room.settled||room.match.finished||room.cinematic?.phase==='playing'){this.turns.delete(room.code);delete room.actionDeadline;return false;}
  const key=[room.match.roundWind,room.match.handNumber,room.match.honba,g.turnNumber,g.phase,g.currentSeat,g.claim?.tile.id].join(':');let turn=this.turns.get(room.code);
  if(!turn||turn.key!==key){turn={key,deadline:now+(g.phase==='awaiting_claim'?12000:30000),nextAutoAt:now};this.turns.set(room.code,turn);room.actionDeadline=turn.deadline;}
  // A deliberate return-to-control may grant a fresh decision window once.
  if(room.actionDeadline!==undefined&&room.actionDeadline!==turn.deadline)turn.deadline=room.actionDeadline;
  if(now>=turn.nextAutoAt&&this.manager.advanceAutoPlay(room.code)){turn.nextAutoAt=now+650;room.revision++;return true;}
  if(now<turn.deadline)return false;
  const state=()=>JSON.stringify({game:g,pending:room.pendingClaims,auto:room.players.map(p=>p.autoPlay)});const before=state();
  const targets=room.players.filter(p=>!p.isBot&&(g.phase==='awaiting_claim'?this.manager.getPlayerGameState(room.code,p.id).hand.actions.canPassClaim:p.seat===g.currentSeat));
  for(const p of targets){if(room.settled)break;this.manager.expirePlayerTurn(room.code,p.id,now);}
  const changed=before!==state();if(changed){room.revision++;turn.nextAutoAt=now+650;}return changed;
 }
 forget(code:string){this.turns.delete(code);}
}
