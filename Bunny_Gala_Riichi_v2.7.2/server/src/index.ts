import {pathToFileURL} from 'node:url';
import express from 'express';
import {RoomStore} from './storage.js';
import cors from 'cors';
import { createServer } from 'node:http';
import { Server, type Socket } from 'socket.io';
import { GameActionError } from '@bunny/riichi-engine';
import { RoomError, RoomManager } from './room.js';

export function createGameServer(options:{storePath?:string;allowedOrigins?:string[]}={}){
const app = express();
const origin=options.allowedOrigins??(process.env.CORS_ORIGINS?process.env.CORS_ORIGINS.split(',').map(x=>x.trim()):true);
app.use(cors({ origin }));
app.get('/health', (_req, res) => res.status(storageFailed?503:200).json({ ok: !storageFailed, service: 'bunny-riichi-server' }));

const httpServer = createServer(app);
const io = new Server(httpServer, { maxHttpBufferSize:16*1024,cors:{origin},allowRequest:(req,done)=>done(null,origin===true||!req.headers.origin||origin.includes(req.headers.origin)) });
const rooms = new RoomManager();
const store=options.storePath?new RoomStore(options.storePath):undefined;store?.load(rooms);
let storageFailed=false;
function persist(){try{store?.save(rooms);}catch(error){storageFailed=true;throw error;}}
const cinematicTimers=new Map<string,ReturnType<typeof setTimeout>>();
const actionTimers=new Map<string,ReturnType<typeof setTimeout>>();
const ACTION_TIMEOUT_MS=30_000;

type Ack = (result: { ok: true; data: unknown } | { ok: false; error: { code: string; message: string } }) => void;

io.on('connection', (socket) => {
  let tokens=40,updated=Date.now();
  socket.use((packet,next)=>{const now=Date.now();tokens=Math.min(40,tokens+(now-updated)*.02);updated=now;if(tokens<1){const ack=packet.at(-1);if(typeof ack==='function')ack({ok:false,error:{code:'RATE_LIMITED',message:'Too many actions; wait briefly.'}});return;}tokens-=1;next();});
  const gameOn=(event:string,handler:(payload:any,ack:Ack)=>void)=>socket.on(event,(payload:any,ack:Ack)=>{
    if(typeof ack!=='function')return;
    try{const {roomCode}=requireSession(socket.data);const room=rooms.getRoomForTesting(roomCode);
      if(!room||!Number.isInteger(payload?.revision)||payload.revision!==room.revision)throw new RoomError('STALE_ACTION','Action state is stale. Wait for the latest game state.');
      handler(payload,ack);
    }catch(error){safely(ack,()=>{throw error})}
  });
  socket.on('room:leave',(_payload:unknown,ack:Ack)=>safely(ack,()=>{const{roomCode,playerId}=requireSession(socket.data);const room=rooms.leaveLobby(roomCode,playerId);socket.leave(roomCode);delete socket.data.roomCode;delete socket.data.playerId;if(room)io.to(roomCode).emit('room:state',rooms.getPublicState(roomCode));return{left:true};}));
  socket.on('room:close',(_payload:unknown,ack:Ack)=>safely(ack,()=>{const{roomCode,playerId}=requireSession(socket.data);rooms.deleteRoom(roomCode,playerId);closeSockets(roomCode);return{closed:true};}));
  socket.on('room:create', (payload: { name?: string }, ack: Ack) => {
    safely(ack, () => {
      if(socket.data.roomCode)throw new RoomError('ALREADY_IN_ROOM','Leave the current room first.');
      const { room, player } = rooms.createRoom(payload?.name ?? '');
      bindSession(socket, room.code, player.id);
      const state = rooms.getPublicState(room.code);
      io.to(room.code).emit('room:state', state);
      return { playerId: player.id, resumeToken: rooms.getResumeToken(room.code,player.id), room: state };
    });
  });

  socket.on('room:join', (payload: { code?: string; name?: string }, ack: Ack) => {
    safely(ack, () => {
      if(socket.data.roomCode)throw new RoomError('ALREADY_IN_ROOM','Leave the current room first.');
      const { room, player } = rooms.joinRoom(payload?.code ?? '', payload?.name ?? '');
      bindSession(socket, room.code, player.id);
      const state = rooms.getPublicState(room.code);
      io.to(room.code).emit('room:state', state);
      return { playerId: player.id, resumeToken: rooms.getResumeToken(room.code,player.id), room: state };
    });
  });

  socket.on('room:reconnect', (payload: { code?:string; playerId?:string; resumeToken?:string }, ack: Ack) => {
    safely(ack,()=>{ if(!payload?.code||!payload?.playerId||!payload?.resumeToken) throw new RoomError('INVALID_RECONNECT','Missing reconnect credentials.'); const {room,player}=rooms.reconnect(payload.code,payload.playerId,payload.resumeToken); bindSession(socket,room.code,player.id); const state=rooms.getPublicState(room.code); io.to(room.code).emit('room:state',state); if(room.phase==='playing') broadcastPrivateGameStates(room.code,false); return {playerId:player.id,resumeToken:player.resumeToken,room:state}; });
  });

  socket.on('room:fill-bots', (_payload:unknown,ack:Ack)=>{safely(ack,()=>{const{roomCode,playerId}=requireSession(socket.data);rooms.fillWithBots(roomCode,playerId);const state=rooms.getPublicState(roomCode);io.to(roomCode).emit('room:state',state);return{room:state};});});

  socket.on('room:set-rules',(payload:any,ack:Ack)=>{safely(ack,()=>{const{roomCode,playerId}=requireSession(socket.data);rooms.setRules(roomCode,playerId,payload??{});const state=rooms.getPublicState(roomCode);io.to(roomCode).emit('room:state',state);return{room:state};});});

  socket.on('room:ready', (payload: { ready?: boolean }, ack: Ack) => {
    safely(ack, () => {
      const { roomCode, playerId } = requireSession(socket.data);
      rooms.setReady(roomCode, playerId, payload?.ready === true);
      const state = rooms.getPublicState(roomCode);
      io.to(roomCode).emit('room:state', state);
      return { room: state };
    });
  });

  socket.on('room:start', (_payload: unknown, ack: Ack) => {
    safely(ack, () => {
      const { roomCode, playerId } = requireSession(socket.data);
      rooms.startGame(roomCode, playerId);
      const state = rooms.getPublicState(roomCode);
      io.to(roomCode).emit('room:state', state);
      broadcastPrivateGameStates(roomCode);
      return { room: state };
    });
  });

  gameOn('game:abortive-draw',(_payload:unknown,ack:Ack)=>safely(ack,()=>{const {roomCode,playerId}=requireSession(socket.data);rooms.abortiveDraw(roomCode,playerId);broadcastPrivateGameStates(roomCode);return {game:rooms.getPlayerGameState(roomCode,playerId)};}));
  gameOn('game:draw', (_payload: unknown, ack: Ack) => {
    safely(ack, () => {
      const { roomCode, playerId } = requireSession(socket.data);
      rooms.draw(roomCode, playerId);
      broadcastPrivateGameStates(roomCode);
      return { game: rooms.getPlayerGameState(roomCode, playerId) };
    });
  });

  gameOn('game:tsumo', (_payload: unknown, ack: Ack) => { safely(ack, () => { const { roomCode, playerId } = requireSession(socket.data); rooms.tsumo(roomCode, playerId); broadcastPrivateGameStates(roomCode); return { game: rooms.getPlayerGameState(roomCode, playerId) }; }); });
  gameOn('game:ron', (_payload: unknown, ack: Ack) => { safely(ack, () => { const { roomCode, playerId } = requireSession(socket.data); rooms.ron(roomCode, playerId); broadcastPrivateGameStates(roomCode); return { game: rooms.getPlayerGameState(roomCode, playerId) }; }); });
  gameOn('game:pass-ron', (_payload: unknown, ack: Ack) => { safely(ack, () => { const { roomCode, playerId } = requireSession(socket.data); rooms.passClaim(roomCode, playerId); broadcastPrivateGameStates(roomCode); return { game: rooms.getPlayerGameState(roomCode, playerId) }; }); });
  gameOn('game:pass-claim', (_payload: unknown, ack: Ack) => { safely(ack, () => { const { roomCode, playerId } = requireSession(socket.data); rooms.passClaim(roomCode, playerId); broadcastPrivateGameStates(roomCode); return { game: rooms.getPlayerGameState(roomCode, playerId) }; }); });
  gameOn('game:pon', (_payload: unknown, ack: Ack) => { safely(ack, () => { const { roomCode, playerId } = requireSession(socket.data); rooms.pon(roomCode, playerId); broadcastPrivateGameStates(roomCode); return { game: rooms.getPlayerGameState(roomCode, playerId) }; }); });
  gameOn('game:kan', (_payload: unknown, ack: Ack) => { safely(ack, () => { const { roomCode, playerId } = requireSession(socket.data); rooms.kan(roomCode, playerId); broadcastPrivateGameStates(roomCode); return { game: rooms.getPlayerGameState(roomCode, playerId) }; }); });
  gameOn('game:ankan', (payload: { tileId?: string }, ack: Ack) => { safely(ack, () => { const { roomCode, playerId } = requireSession(socket.data); if(typeof payload?.tileId!=='string') throw new RoomError('INVALID_TILE','tileId is required.'); rooms.ankan(roomCode,playerId,payload.tileId); broadcastPrivateGameStates(roomCode); return {game:rooms.getPlayerGameState(roomCode,playerId)}; }); });
  gameOn('game:kakan', (payload: { tileId?: string }, ack: Ack) => { safely(ack, () => { const { roomCode, playerId } = requireSession(socket.data); if(typeof payload?.tileId!=='string') throw new RoomError('INVALID_TILE','tileId is required.'); rooms.kakan(roomCode,playerId,payload.tileId); broadcastPrivateGameStates(roomCode); return {game:rooms.getPlayerGameState(roomCode,playerId)}; }); });
  gameOn('game:chi', (payload: { faces?: string[] }, ack: Ack) => { safely(ack, () => { const { roomCode, playerId } = requireSession(socket.data); if(!Array.isArray(payload?.faces)) throw new RoomError('INVALID_CHI','faces are required.'); rooms.chi(roomCode,playerId,payload.faces as any); broadcastPrivateGameStates(roomCode); return { game: rooms.getPlayerGameState(roomCode, playerId) }; }); });

  gameOn('game:riichi-discard', (payload: { tileId?: string }, ack: Ack) => {
    safely(ack, () => {
      const { roomCode, playerId } = requireSession(socket.data);
      if (typeof payload?.tileId !== 'string' || payload.tileId.length < 1) throw new RoomError('INVALID_TILE', 'tileId is required.');
      rooms.riichiDiscard(roomCode, playerId, payload.tileId);
      broadcastPrivateGameStates(roomCode);
      return { game: rooms.getPlayerGameState(roomCode, playerId) };
    });
  });

  gameOn('game:next-hand', (_payload: unknown, ack: Ack) => { safely(ack, () => { const {roomCode}=requireSession(socket.data); rooms.startNextHand(roomCode); broadcastPrivateGameStates(roomCode); return {ok:true}; }); });

  gameOn('game:discard', (payload: { tileId?: string }, ack: Ack) => {
    safely(ack, () => {
      const { roomCode, playerId } = requireSession(socket.data);
      if (typeof payload?.tileId !== 'string' || payload.tileId.length < 1) throw new RoomError('INVALID_TILE', 'tileId is required.');
      rooms.discard(roomCode, playerId, payload.tileId);
      broadcastPrivateGameStates(roomCode);
      return { game: rooms.getPlayerGameState(roomCode, playerId) };
    });
  });
  socket.on('disconnect',()=>{ const roomCode=socket.data.roomCode,playerId=socket.data.playerId; if(typeof roomCode==='string'&&typeof playerId==='string'){rooms.disconnect(roomCode,playerId); try{persist();io.to(roomCode).emit('room:state',rooms.getPublicState(roomCode));}catch{}} });
});

function bindSession(socket: Socket, roomCode: string, playerId: string): void {
  if(typeof socket.data.roomCode==='string'&&socket.data.roomCode!==roomCode)throw new RoomError('ALREADY_IN_ROOM','Leave the current lobby before joining another room.');
  for(const other of io.sockets.sockets.values())if(other.id!==socket.id&&other.data.roomCode===roomCode&&other.data.playerId===playerId){other.leave(roomCode);delete other.data.playerId;delete other.data.roomCode;other.emit('session:replaced');other.disconnect(true);}

  socket.data.playerId = playerId;
  socket.data.roomCode = roomCode;
  socket.join(roomCode);
}

/** Emits a separately serialized state to each socket so concealed hands never cross player boundaries. */
function broadcastPrivateGameStates(roomCode: string, changed=true): void {
  const room=rooms.getRoomForTesting(roomCode);if(!room)return;if(changed)room.revision+=1;
  if(changed){scheduleRoomTimeout(roomCode);scheduleCinematic(roomCode);persist();}
  const socketIds = io.sockets.adapter.rooms.get(roomCode);
  if (!socketIds) return;
  for (const socketId of socketIds) {
    const client = io.sockets.sockets.get(socketId);
    if (!client) continue;
    const playerId = client.data.playerId;
    if (typeof playerId !== 'string') continue;
    try { client.emit('game:state', rooms.getPlayerGameState(roomCode, playerId)); }
    catch { /* A stale socket should not prevent updates to active players. */ }
  }
}

function scheduleCinematic(code:string):void{
 const room=rooms.getRoomForTesting(code),event=room?.cinematic;
 const old=cinematicTimers.get(code);if(old)clearTimeout(old);cinematicTimers.delete(code);
 if(storageFailed||!room||!event||event.phase!=='playing')return;
 const timer=setTimeout(()=>{cinematicTimers.delete(code);if(rooms.getRoomForTesting(code)!==room||room.cinematic!==event)return;if(rooms.completeCinematic(code))broadcastPrivateGameStates(code);else scheduleCinematic(code);},Math.max(0,event.endsAt-Date.now()));cinematicTimers.set(code,timer);
}
function scheduleRoomTimeout(roomCode:string,restore=false):void{
 const old=actionTimers.get(roomCode);if(old)clearTimeout(old);actionTimers.delete(roomCode);
 const room=rooms.getRoomForTesting(roomCode);if(!room)return;const previousDeadline=room.actionDeadline;delete room.actionDeadline;
 if(storageFailed||!room.game||room.settled||room.match.finished)return;
 const g=room.game,revision=room.revision;
 const targets=g.phase==='awaiting_claim'?room.players.filter(p=>getEligibleClaimSeat(g,p.seat)):room.players.filter(p=>p.seat===g.currentSeat);
 if(!targets.length)return;
 const normalDelay=targets.every(p=>p.isBot)?250:room.rules.actionTimeoutMs??ACTION_TIMEOUT_MS;
 const deadline=restore&&Number.isFinite(previousDeadline)?previousDeadline!:Date.now()+normalDelay;
 const delay=Math.max(0,deadline-Date.now());room.actionDeadline=deadline;
 const timer=setTimeout(()=>{
  if(storageFailed){actionTimers.delete(roomCode);return;}const current=rooms.getRoomForTesting(roomCode);if(!current||current!==room||current.game!==g||current.revision!==revision||current.actionDeadline!==deadline||current.settled||current.match.finished)return;
  actionTimers.delete(roomCode);let changed=false;
  for(const p of targets){if(current.settled)break;try{const before=JSON.stringify(g);if(p.isBot)rooms.actBot(roomCode,p.id);else rooms.autoAct(roomCode,p.id);changed ||= before!==JSON.stringify(g);}catch{/* A higher-priority claim can invalidate a lower-priority target. */}}
  if(changed)broadcastPrivateGameStates(roomCode);else scheduleRoomTimeout(roomCode);
 },delay);actionTimers.set(roomCode,timer);
}
function getEligibleClaimSeat(g:any,seat:any):boolean{if(g.phase!=='awaiting_claim'||!g.claim||g.claim.passed.includes(seat))return false;const o=g.claim.options[seat];return Boolean(o&&(o.ron||o.pon||o.kan||o.chiSequences?.length));}

function requireSession(data: Record<string, unknown>): { roomCode: string; playerId: string } {
  if (typeof data.roomCode !== 'string' || typeof data.playerId !== 'string') throw new RoomError('NOT_IN_ROOM', 'Join a room first.');
  return { roomCode: data.roomCode, playerId: data.playerId };
}

function safely(ack: Ack, action: () => unknown): void {
  if(typeof ack!=='function')return;
  try { if(storageFailed)throw new RoomError('STORAGE_UNAVAILABLE','Server recovery storage failed; actions are paused.');const data=action();persist();ack({ok:true,data}); }
  catch (error) {
    if (error instanceof RoomError || error instanceof GameActionError) ack({ ok: false, error: { code: error.code, message: error.message } });
    else {
      console.error(error);
      ack({ ok: false, error: { code: 'INTERNAL_ERROR', message: 'Unexpected server error.' } });
    }
  }
}

function closeSockets(code:string){const cinematic=cinematicTimers.get(code);if(cinematic)clearTimeout(cinematic);cinematicTimers.delete(code);const timer=actionTimers.get(code);if(timer)clearTimeout(timer);actionTimers.delete(code);for(const client of io.sockets.sockets.values())if(client.data.roomCode===code){client.emit('room:closed');client.leave(code);delete client.data.roomCode;delete client.data.playerId;}}
const cleanup=setInterval(()=>{for(const code of rooms.cleanupDisconnectedRooms(30*60*1000))closeSockets(code);try{persist();}catch(error){console.error('Recovery storage unavailable',error)}},60_000);cleanup.unref();
for(const room of rooms.snapshotRooms()){scheduleRoomTimeout(room.code,true);scheduleCinematic(room.code);}
return {app,io,httpServer,rooms,actionTimers,cinematicTimers,broadcastPrivateGameStates,close:async()=>{try{persist();}catch{}clearInterval(cleanup);for(const timer of cinematicTimers.values())clearTimeout(timer);cinematicTimers.clear();for(const timer of actionTimers.values())clearTimeout(timer);actionTimers.clear();await new Promise<void>(resolve=>io.close(()=>resolve()));}};
}
if(process.argv[1]&&pathToFileURL(process.argv[1]).href===import.meta.url){const service=createGameServer({storePath:process.env.ROOM_STORE_PATH??'.bunny-data/rooms.json'});const port=Number(process.env.PORT??3001);service.httpServer.listen(port,'0.0.0.0',()=>console.log(`Bunny Riichi server listening on http://localhost:${port}`));let closing=false;const stop=()=>{if(closing)return;closing=true;void service.close().then(()=>process.exit(0)).catch(()=>process.exit(1));};process.once('SIGINT',stop);process.once('SIGTERM',stop);}

