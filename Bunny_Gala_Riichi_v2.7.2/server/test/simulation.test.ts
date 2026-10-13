import { describe,it,expect } from 'vitest';
import { RoomManager } from '../src/room.js';

describe('state-machine simulation',()=>{
 it('can advance an automated table without leaking illegal state',()=>{
  const m=new RoomManager();const h=m.createRoom('P1');const ps=[h.player,m.joinRoom(h.room.code,'P2').player,m.joinRoom(h.room.code,'P3').player,m.joinRoom(h.room.code,'P4').player];
  for(const p of ps)m.setReady(h.room.code,p.id,true);m.startGame(h.room.code,h.player.id);
  let steps=0;
  while(steps++<5000){const room=m.getRoomForTesting(h.room.code)!;if(room.match.finished)break;if(room.settled){m.startNextHand(room.code);continue;}const g=room.game!;
   if(g.phase==='awaiting_claim'&&g.claim){for(const p of ps){try{m.autoAct(room.code,p.id)}catch{}}continue;}
   const p=ps.find(x=>x.seat===g.currentSeat)!;m.autoAct(room.code,p.id);
  }
  const room=m.getRoomForTesting(h.room.code)!;expect(steps).toBeLessThan(5001);expect(Object.values(room.scores).reduce((a,b)=>a+b,0)+room.riichiPot).toBe(100000);
 });
});
