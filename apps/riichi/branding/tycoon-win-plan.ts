import {type HandState,type Seat,type WinResult} from '../engine/index';
import {type CinematicState} from './presentation';
export const WIN_CALL_MS=1200;
export type WinSegment={winner:Seat;start:number;end:number;kind:'reveal'|'eyes'|'video'|'art'|'call';video?:string;trigger?:string;yakuman:number};
export interface WinSequence {id:string;startedAt:number;endsAt:number;serverNow:number;segments:WinSegment[];doubleRon:boolean}
export function createWinSequence(game:HandState,id:string,now:number):WinSequence|undefined{
 const results=game.results??(game.result?[game.result]:[]);if(!results.length)return;
 let cursor=0;const segments:WinSegment[]=[];
 for(const r of results)for(const [kind,duration] of [['call',1200],['reveal',2200],['art',3000]] as const){const start=cursor;cursor+=duration;segments.push({winner:r.winner,start,end:cursor,kind,yakuman:r.evaluation.yakuman})}
 return{id,startedAt:now,endsAt:now+cursor,serverNow:now,segments,doubleRon:results.length>1};
}
export function sequenceCinematic(plan:WinSequence,results:WinResult[],id:number):CinematicState{
 const r=results[0]!;return{id,trigger:'OTHER_YAKUMAN',method:r.method,winner:r.winner,character:'yellow',startedAt:plan.startedAt,endsAt:plan.endsAt,serverNow:plan.serverNow,phase:'playing'};
}
