import {type HandState,type Seat,type WinResult} from '../engine/index';
import {CINEMATIC_ASSETS,cinematicTrigger,type CinematicState} from './presentation';
export type WinSegment={winner:Seat;start:number;end:number;kind:'video'|'art'|'call';video?:string;trigger?:string;yakuman:number};
export interface WinSequence {id:string;startedAt:number;endsAt:number;serverNow:number;segments:WinSegment[];doubleRon:boolean}
export function createWinSequence(game:HandState,id:string,now:number):WinSequence|undefined{
 const results=game.results??(game.result?[game.result]:[]);if(!results.length)return;
 const hasEffect=(r:WinResult)=>r.score.limit!=='none'||!!CINEMATIC_ASSETS[cinematicTrigger(r.evaluation)!]?.video;
 if(results.length===1&&!hasEffect(results[0]!))return;
 let cursor=results.length>1?800:0;
 const segments=results.map(r=>{const trigger=cinematicTrigger(r.evaluation),asset=trigger?CINEMATIC_ASSETS[trigger]:undefined,kind=asset?.video?'video':r.score.limit!=='none'?'art':'call',duration=kind==='video'?asset!.durationMs:kind==='call'?1000:r.score.yakuman>=2?6900:({mangan:5500,haneman:5700,baiman:5900,sanbaiman:6100,yakuman:6500,none:1000}[r.score.limit]);const start=cursor;cursor+=duration;return{winner:r.winner,start,end:cursor,kind,video:asset?.video,trigger:trigger??undefined,yakuman:r.evaluation.yakuman} as WinSegment});
 return{id,startedAt:now,endsAt:now+cursor,serverNow:now,segments,doubleRon:results.length>1};
}
export function sequenceCinematic(plan:WinSequence,results:WinResult[],id:number):CinematicState{
 const r=results[0]!,s=plan.segments[0]!;
 return{id,trigger:(s.trigger??'OTHER_YAKUMAN') as CinematicState['trigger'],method:r.method,winner:r.winner,character:'yellow',startedAt:plan.startedAt,endsAt:plan.endsAt,serverNow:plan.serverNow,phase:'playing',...(s.video?{video:s.video}:{})};
}
