import type {Game,Seat} from './main';
type Detail={zh:string;en:string;voice:string};
/** Match the engine's P/F/C -> seat wind -> round wind entries, including double winds. */
export function resultYakuhaiDetails(game:Game):(Detail|undefined)[]{
 const r=game.hand.result;if(!r)return [];
 const seats:Seat[]=['east','south','west','north'],winds=['E','S','W','N'],names:Record<string,string>={E:'東',S:'南',W:'西',N:'北'},english:Record<string,string>={E:'East',S:'South',W:'West',N:'North'};
 const seatWind=winds[(seats.indexOf(r.winner)-seats.indexOf(game.hand.match.dealer)+4)%4]!,roundWind=game.hand.match.roundWind==='east'?'E':'S';
 // Each double-ron winner has their own concealed tiles; never read the other winner's hand.
 const concealed=game.hand.settlement?.winningHands?.[r.winner]??game.hand.settlement?.winningHand??[],tiles=[...concealed,...game.hand.melds[r.winner].flatMap(m=>m.tiles)],counts=new Map<string,number>();
 for(const tile of tiles)counts.set(tile.face,(counts.get(tile.face)??0)+1);
 const candidates:[string,Detail][]=[['P',{zh:'役牌・白',en:'Yakuhai · White',voice:'yaku-haku'}],['F',{zh:'役牌・發',en:'Yakuhai · Green',voice:'yaku-hatsu'}],['C',{zh:'役牌・中',en:'Yakuhai · Red',voice:'yaku-chun'}],[seatWind,{zh:'自風・'+names[seatWind],en:'Seat Wind · '+english[seatWind],voice:'yaku-seat-wind'}],[roundWind,{zh:'場風・'+names[roundWind],en:'Round Wind · '+english[roundWind],voice:'yaku-round-wind'}]];
 const details=candidates.filter(([face])=>(counts.get(face)??0)>=3).map(([,detail])=>detail);let index=0;
 return r.evaluation.yaku.map(y=>y.name==='Yakuhai'?details[index++]:undefined);
}
