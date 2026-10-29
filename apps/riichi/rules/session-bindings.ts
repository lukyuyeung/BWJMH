import type {RoomManager} from './room';
/** Host-only authenticated socket binding. Never accept player identity from an action payload. */
export class SessionBindings{
 private sessions=new Map<string,string>();
 constructor(private manager:RoomManager){}
 private key(code:string,playerId:string){return code+':'+playerId;}
 bind(code:string,playerId:string,resumeToken:string,connectionId:string){
  const {room,player}=this.manager.reconnect(code,playerId,resumeToken),key=this.key(room.code,playerId),replaced=this.sessions.get(key);
  this.sessions.set(key,connectionId);return {room,player,replaced:replaced!==connectionId?replaced:undefined};
 }
 owns(code:string,playerId:string,connectionId:string){return this.sessions.get(this.key(code,playerId))===connectionId;}
 disconnect(code:string,playerId:string,connectionId:string){
  if(!this.owns(code,playerId,connectionId))return false;
  this.sessions.delete(this.key(code,playerId));this.manager.disconnect(code,playerId);return true;
 }
}
