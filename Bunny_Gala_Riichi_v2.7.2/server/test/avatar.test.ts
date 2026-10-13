import {it,expect} from 'vitest';
import {RoomManager} from '../src/room.js';
import {createGameServer} from '../src/index.js';
import {io,type Socket} from 'socket.io-client';
const request=(socket:Socket,event:string,payload:unknown)=>new Promise<any>((resolve,reject)=>socket.timeout(3000).emit(event,payload,(error:Error|null,result:any)=>error?reject(error):resolve(result)));
it('keeps each player avatar through public state, recovery and reconnect',()=>{
 const m=new RoomManager();const {room,player}=m.createRoom('甲','https://example.com/first.png');const second=m.joinRoom(room.code,'乙','/art/v5/CHARACTER_NINJA_MASTER.jpeg').player;
 m.updateAvatar(room.code,second.id,'https://example.com/second.png');
 const publicRoom=m.getPublicState(room.code);expect(publicRoom.players.map(p=>p.avatarUrl)).toEqual(['https://example.com/first.png','https://example.com/second.png']);expect(JSON.stringify(publicRoom)).not.toContain('resumeToken');
 const restored=new RoomManager();restored.restoreRooms(m.snapshotRooms());restored.reconnect(room.code,player.id,player.resumeToken);expect(restored.getPublicState(room.code).players[0]!.avatarUrl).toBe(player.avatarUrl);
 m.updateAvatar(room.code,second.id,'');expect(m.getPublicState(room.code).players[1]!.avatarUrl).toBeUndefined();
});
it.each(['javascript:alert(1)','data:image/png;base64,abc','http://example.com/x.png','https://user:pass@example.com/x.png','/art/../private.png'])('rejects unsupported avatar %s without changing player state',avatar=>{
 const m=new RoomManager();const {room,player}=m.createRoom('甲');expect(()=>m.updateAvatar(room.code,player.id,avatar)).toThrow();expect(player.avatarUrl).toBeUndefined();
});
it('synchronizes an avatar only for the authenticated socket player',async()=>{
 const service=createGameServer();await new Promise<void>(r=>service.httpServer.listen(0,'127.0.0.1',r));const port=(service.httpServer.address() as any).port;
 const sockets=[io(`http://127.0.0.1:${port}`),io(`http://127.0.0.1:${port}`)];
 try{await Promise.all(sockets.map(s=>new Promise<void>(r=>s.on('connect',r))));
 const first=await request(sockets[0]!,'room:create',{name:'甲',avatarUrl:'https://example.com/first.png'});expect(first.ok).toBe(true);
 const second=await request(sockets[1]!,'room:join',{code:first.data.room.code,name:'乙',avatarUrl:'https://example.com/second.png'});expect(second.ok).toBe(true);
 const update=await request(sockets[1]!,'player:avatar',{avatarUrl:'/art/v5/CHARACTER_WIZARD_MASTER.jpeg',playerId:first.data.playerId});expect(update.ok).toBe(true);expect(update.data.room.players[0].avatarUrl).toBe('https://example.com/first.png');expect(update.data.room.players[1].avatarUrl).toBe('/art/v5/CHARACTER_WIZARD_MASTER.jpeg');
 expect((await request(sockets[1]!,'player:avatar',{avatarUrl:'javascript:alert(1)'})).ok).toBe(false);
 }finally{for(const socket of sockets)socket.disconnect();await service.close();}
});
