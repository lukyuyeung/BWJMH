import type {Game} from './main';
const clocks=new Map<string,number>();
export function winClockKey(game:Game){const h=game.hand;return [game.room.code,h.match.roundWind,h.match.handNumber,h.match.honba,h.result?.winner,h.result?.score.payment.total].join(':')}
export function startWinClock(key:string,now=performance.now()){clocks.set(key,now);if(clocks.size>40)clocks.delete(clocks.keys().next().value!)}
export function winClockAge(key:string){const start=clocks.get(key);return start===undefined?0:Math.max(0,performance.now()-start)}
