import type { Seat } from '@bunny/riichi-engine';
import { SEATS } from '@bunny/riichi-engine';

export type RoundWind = 'east'|'south';
export interface MatchState {
  roundWind: RoundWind;
  handNumber: 1|2|3|4;
  dealer: Seat;
  honba: number;
  handsPlayed: number;
  finished: boolean;
}
export interface DrawSettlement { payments: Record<Seat,number>; tenpai: Seat[]; dealerContinues:boolean }

export function createMatchState():MatchState{return{roundWind:'east',handNumber:1,dealer:'east',honba:0,handsPlayed:0,finished:false}}
export function rotateSeat(seat:Seat):Seat{return SEATS[(SEATS.indexOf(seat)+1)%4]!}

/** Standard exhaustive-draw 3000-point tenpai/noten exchange. */
export function calculateNotenPayments(tenpai:readonly Seat[]):Record<Seat,number>{
 const out:Record<Seat,number>={east:0,south:0,west:0,north:0};
 const n=tenpai.length;if(n===0||n===4)return out;
 const gain=3000/n, loss=3000/(4-n); const set=new Set(tenpai);
 for(const s of SEATS)out[s]=set.has(s)?gain:-loss;
 return out;
}
export function settleExhaustiveDraw(match:MatchState,tenpai:readonly Seat[]):DrawSettlement{
 return{payments:calculateNotenPayments(tenpai),tenpai:[...tenpai],dealerContinues:tenpai.includes(match.dealer)};
}
export interface MatchEndPolicy{scores:Record<Seat,number>;target?:number;agariYame?:boolean}
/** Dealer repeats take priority over the 30k extension threshold. No West round in East-only. */
export function advanceMatch(match:MatchState,dealerContinues:boolean,matchLength:'tonpuusen'|'hanchan'='hanchan',exhaustiveDraw=false,policy?:MatchEndPolicy):void{
 match.handsPlayed+=1;
 const target=policy?.target??30000,extension=matchLength==='tonpuusen'&&match.roundWind==='south',regularLast=match.handNumber===4&&(matchLength==='tonpuusen'?match.roundWind==='east':match.roundWind==='south'),first=policy?rankScores(policy.scores)[0]!:undefined,reached=!!policy&&policy.scores[first!]>=target;
 if(dealerContinues){match.honba+=1;if(policy?.agariYame&&(regularLast||extension)&&first===match.dealer&&reached)match.finished=true;return;}
 match.honba=exhaustiveDraw?match.honba+1:0;match.dealer=rotateSeat(match.dealer);
 if(extension&&reached){match.finished=true;return;}
 if(match.handNumber<4){match.handNumber=(match.handNumber+1) as 1|2|3|4;return;}
 if(match.roundWind==='east'){
  if(matchLength==='tonpuusen'&&(!policy||reached)){match.finished=true;return;}
  match.roundWind='south';match.handNumber=1;return;
 }
 // South4 dealer retirement is the hard cap, even if everyone remains below the target.
 match.finished=true;
}
export function rankScores(scores:Record<Seat,number>):Seat[]{return [...SEATS].sort((a,b)=>(scores[b]??0)-(scores[a]??0)||SEATS.indexOf(a)-SEATS.indexOf(b))}
