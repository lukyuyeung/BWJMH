import {it,expect} from 'vitest';
import {io,type Socket} from 'socket.io-client';
import {createGameServer} from '../src/index.js';
const request=(s:Socket,event:string,payload:unknown)=>new Promise<any>((resolve,reject)=>s.timeout(3000).emit(event,payload,(error:Error|null,result:any)=>error?reject(error):resolve(result)));
it('enters a real solo game directly, repeats safely and resumes the same seat',async()=>{
 const server=createGameServer();await new Promise<void>(r=>server.httpServer.listen(0,'127.0.0.1',r));const port=(server.httpServer.address() as any).port;
 let socket=io(`http://127.0.0.1:${port}`);
 try{await new Promise<void>(r=>socket.on('connect',r));const result=await request(socket,'room:quick-start',{name:'玩家'});expect(result.ok).toBe(true);expect(result.data.room.phase).toBe('playing');expect(result.data.room.players).toHaveLength(4);expect(result.data.room.players.filter((p:any)=>p.isBot)).toHaveLength(3);
 const room=server.rooms.getRoomForTesting(result.data.room.code)!;expect(room.game).toBeDefined();expect(server.rooms.getPlayerGameState(room.code,result.data.playerId).you.hand).toHaveLength(14);
 const previousRevision=room.revision,previousDeadline=room.actionDeadline;
 const second=await request(socket,'room:quick-start',{name:'重複'});expect(second.data.room.code).toBe(room.code);expect(server.rooms.snapshotRooms()).toHaveLength(1);expect(second.data.playerId).toBe(result.data.playerId);expect(room.revision).toBe(previousRevision);expect(room.actionDeadline).toBe(previousDeadline);
 socket.disconnect();socket=io(`http://127.0.0.1:${port}`);await new Promise<void>(r=>socket.on('connect',r));const resumed=await request(socket,'room:reconnect',{code:room.code,playerId:result.data.playerId,resumeToken:result.data.resumeToken});expect(resumed.ok).toBe(true);expect(resumed.data.playerId).toBe(result.data.playerId);expect(server.rooms.snapshotRooms()).toHaveLength(1);
 }finally{socket.disconnect();await server.close();}
});

it('prepares an existing solo lobby without making the player open a new room',async()=>{
 const server=createGameServer();await new Promise<void>(r=>server.httpServer.listen(0,'127.0.0.1',r));const socket=io(`http://127.0.0.1:${(server.httpServer.address() as any).port}`);
 try{await new Promise<void>(r=>socket.on('connect',r));const created=await request(socket,'room:create',{name:'玩家'});const started=await request(socket,'room:quick-start',{});expect(started.ok).toBe(true);expect(started.data.room.code).toBe(created.data.room.code);expect(started.data.room.phase).toBe('playing');expect(server.rooms.snapshotRooms()).toHaveLength(1);}finally{socket.disconnect();await server.close();}
});
