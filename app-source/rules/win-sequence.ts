import {type HandState,type Seat,type WinResult} from '../engine/index';
import {CINEMATIC_ASSETS,cinematicTrigger,type CinematicState} from './presentation';
export type WinSegment={winner:Seat;start:number;end:number;kind:'reveal'|'eyes'|'video'|'art'|'call';video?:string;trigger?:string;yakuman:number};
export interface WinSequence {id:string;startedAt:number;endsAt:number;serverNow:number;segments:WinSegment[];doubleRon:boolean}
export function createWinSequence(game:HandState,id:string,now:number):WinSequence|undefined{
 const results=game.results??(game.result?[game.result]:[]);if(!results.length)return;
 const hasEffect=(r:WinResult)=>r.score.limit!=='none'||!!CINEMATIC_ASSETS[cinematicTrigger(r.evaluation)!]?.video;
 if(results.length===1&&!hasEffect(results[0]!))return;
 let cursor=0;const segments:WinSegment[]=[];
 const append=(r:WinResult,kind:WinSegment['kind'],duration:number,video?:string,trigger?:string)=>{const start=cursor;cursor+=duration;segments.push({winner:r.winner,start,end:cursor,kind,video,trigger,yakuman:r.evaluation.yakuman})};
 if(results.length>1)append(results[0]!,'reveal',2200);
 for(const r of results){
  const trigger=cinematicTrigger(r.evaluation),asset=trigger?CINEMATIC_ASSETS[trigger]:undefined;
  if(asset?.video){append(r,'eyes',1450);append(r,'video',asset.durationMs,asset.video,trigger??undefined);}
  else if(r.score.limit!=='none')append(r,'art',r.score.yakuman>=2?6900:({mangan:5500,haneman:5700,baiman:5900,sanbaiman:6100,yakuman:6500,none:1000}[r.score.limit]));
  else if(results.length===1)append(r,'call',1000);
 }

 return{id,startedAt:now,endsAt:now+cursor,serverNow:now,segments,doubleRon:results.length>1};
}
export function sequenceCinematic(plan:WinSequence,results:WinResult[],id:number):CinematicState{
 const r=results[0]!,s=plan.segments[0]!;
 return{id,trigger:(s.trigger??'OTHER_YAKUMAN') as CinematicState['trigger'],method:r.method,winner:r.winner,character:'yellow',startedAt:plan.startedAt,endsAt:plan.endsAt,serverNow:plan.serverNow,phase:'playing',...(s.video?{video:s.video}:{})};
}
