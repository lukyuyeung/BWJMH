import {it,expect} from 'vitest';
import {io,type Socket} from 'socket.io-client';
import {createGameServer} from '../src/index.js';
import {installScenario} from '../qa/scenarios.js';
const req=(s:Socket,event:string,payload:any={})=>new Promise<any>((resolve,reject)=>s.timeout(4000).emit(event,payload,(e:any,r:any)=>e?reject(e):resolve(r)));
it('real four-player transport: active cinematic reconnect/forged advance/result timeout/cleanup',async()=>{
 const service=createGameServer();await new Promise<void>(r=>service.httpServer.listen(0,'127.0.0.1',r));const url=`http://127.0.0.1:${(service.httpServer.address() as any).port}`,sockets:Socket[]=[];
 const connect=async()=>{const s=io(url,{transports:['websocket'],forceNew:true});sockets.push(s);await new Promise<void>(r=>s.once('connect',()=>r()));return s;};
 try{
  const ss:Socket[]=[];for(let i=0;i<4;i++)ss.push(await connect());const host=await req(ss[0]!,'room:create',{name:'Winner'}),code=host.data.room.code;
  for(let i=1;i<4;i++)await req(ss[i]!,'room:join',{code,name:'Player '+i});for(const s of ss)await req(s,'room:ready',{ready:true});await req(ss[0]!,'room:start');
  const room=service.rooms.getRoomForTesting(code)!;installScenario(service.rooms,room,'chinitsu');service.broadcastPrivateGameStates(code);
  const results=ss.map(s=>new Promise<any>(r=>{const fn=(state:any)=>{if(state.hand.cinematic?.phase==='results'){s.off('game:state',fn);r(state);}};s.on('game:state',fn);}));
  const win=await req(ss[0]!,'game:tsumo',{revision:room.revision});expect(win.ok).toBe(true);const event=room.cinematic!;expect(event.phase).toBe('playing');expect(service.actionTimers.has(code)).toBe(false);const timer=service.cinematicTimers.get(code);expect(timer).toBeDefined();
  const replacement=await connect();const statePromise=new Promise<any>(r=>replacement.once('game:state',r));await req(replacement,'room:reconnect',{code,playerId:host.data.playerId,resumeToken:host.data.resumeToken});const state=await statePromise;expect(state.hand.cinematic.id).toBe(event.id);expect(state.hand.cinematic.phase).toBe('playing');expect(state.hand.cinematic.endsAt).toBe(event.endsAt);expect(service.cinematicTimers.get(code)).toBe(timer);
  const before=JSON.stringify(room.game);const malicious=await req(replacement,'game:next-hand',{revision:room.revision,cinematicEnded:true,endsAt:0,score:99999});expect(malicious.error.code).toBe('CINEMATIC_ACTIVE');expect(JSON.stringify(room.game)).toBe(before);
  // Host socket was replaced; wait for the other three and the replacement.
  const replacementResult=new Promise<any>(r=>{const fn=(state:any)=>{if(state.hand.cinematic?.phase==='results'){replacement.off('game:state',fn);r(state);}};replacement.on('game:state',fn);});
  const final=await Promise.all([...results.slice(1),replacementResult]);for(const s of final){expect(s.hand.cinematic.phase).toBe('results');expect(s.hand.cinematic.id).toBe(event.id);expect(s.hand.result.evaluation.yaku.some((y:any)=>y.id==='chinitsu')).toBe(true);}
  expect(service.cinematicTimers.has(code)).toBe(false);expect(service.actionTimers.has(code)).toBe(false);expect((await req(replacement,'game:next-hand',{revision:room.revision})).ok).toBe(true);expect(room.cinematic).toBeUndefined();await req(replacement,'room:close');expect(service.actionTimers.has(code)).toBe(false);expect(service.cinematicTimers.has(code)).toBe(false);
 }finally{for(const s of sockets)s.disconnect();await service.close();}
},15000);
