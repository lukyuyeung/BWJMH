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
/** Advance after a completed hand. Dealer repeats on a win, or on exhaustive draw while tenpai. */
export function advanceMatch(match:MatchState,dealerContinues:boolean,matchLength:'tonpuusen'|'hanchan'='hanchan',exhaustiveDraw=false):void{
 match.handsPlayed+=1;
 if(dealerContinues){match.honba+=1;return;}
 match.honba=exhaustiveDraw?match.honba+1:0; match.dealer=rotateSeat(match.dealer);
 if(match.handNumber<4){match.handNumber=(match.handNumber+1) as 1|2|3|4;return;}
 if(match.roundWind==='east'){if(matchLength==='tonpuusen'){match.finished=true;return;}match.roundWind='south';match.handNumber=1;return;}
 match.finished=true;
}
export function rankScores(scores:Record<Seat,number>):Seat[]{return [...SEATS].sort((a,b)=>(scores[b]??0)-(scores[a]??0)||SEATS.indexOf(a)-SEATS.indexOf(b))}
