import {SEATS,type Seat,type HandState,type WinResult,calculateScore} from '../engine/index';
export interface PointTransfer {from:Seat;to:Seat;amount:number;reason:'hand'|'pao'|'honba'|'nagashi'}
export interface Responsibility {beneficiary:Seat;liable:Seat;yakuId:'daisangen'|'daisuushi';triggerTileId:string}
export function responsibilities(game:HandState):Responsibility[]{
 const out:Responsibility[]=[];
 for(const beneficiary of SEATS)for(const [yakuId,faces] of [['daisangen',['P','F','C']],['daisuushi',['E','S','W','N']]] as const){
  const seen=new Set<string>();
  for(const meld of game.melds[beneficiary]){
   if(meld.open===false||!['pon','kan'].includes(meld.type)||!faces.some(f=>f===meld.tiles[0]?.face))continue;
   seen.add(meld.tiles[0]!.face);
   if(seen.size===faces.length){out.push({beneficiary,liable:meld.from,yakuId,triggerTileId:meld.calledTile.id});break;}
  }
 }
 return out;
}
export function winTransfers(game:HandState,win:WinResult,honba:number):PointTransfer[]{
 const out:PointTransfer[]=[],winner=win.winner;
 const add=(from:Seat,amount:number,reason:PointTransfer['reason'])=>{if(amount>0&&from!==winner)out.push({from,to:winner,amount,reason})};
 const pao=responsibilities(game).find(p=>p.beneficiary===winner&&win.evaluation.yaku.some(y=>y.id===p.yakuId&&y.yakuman));
 // Each supported responsibility yaku is one unit under this game's fixed rules.
 const responsibleUnits=pao?Math.min(win.evaluation.yaku.find(y=>y.id===pao.yakuId)?.yakuman??0,win.score.yakuman):0;
 const pay=(payment:WinResult['score']['payment'],reason:PointTransfer['reason'])=>{
  if(win.method==='ron'){if(!win.from)throw Error('Ron payer missing');add(win.from,payment.ron??0,reason)}
  else for(const s of SEATS)if(s!==winner)add(s,winner===game.dealerSeat?payment.eachTsumo??0:s===game.dealerSeat?payment.dealerTsumo??0:payment.nonDealerTsumo??0,reason);
 };
 if(pao&&responsibleUnits){
  const part=calculateScore(0,0,winner===game.dealerSeat,win.method,responsibleUnits).payment;
  if(win.method==='tsumo'||win.from===pao.liable)add(pao.liable,part.total,'pao');
  else{add(pao.liable,part.total/2,'pao');add(win.from!,part.total/2,'pao')}
  const rest=win.score.yakuman-responsibleUnits;if(rest)pay(calculateScore(0,0,winner===game.dealerSeat,win.method,rest).payment,'hand');
 }else pay(win.score.payment,'hand');
 if(win.method==='ron')add(win.from!,honba*300,'honba');
 else if(pao&&responsibleUnits)add(pao.liable,honba*300,'honba');
 else for(const s of SEATS)if(s!==winner)add(s,honba*100,'honba');
 return out;
}
export function nagashiWinners(game:HandState):Seat[]{
 if(game.phase!=='exhaustive_draw')return[];
 return SEATS.filter(s=>game.melds[s].length===0&&game.discardedFaces[s].length>0&&game.discardedFaces[s].length===game.discards[s].length&&game.discardedFaces[s].every(f=>f.length===1||f[0]==='1'||f[0]==='9'));
}
export function nagashiTransfers(game:HandState,winners:Seat[],honba:number):PointTransfer[]{return winners.flatMap(to=>SEATS.filter(from=>from!==to).map(from=>({from,to,amount:(to===game.dealerSeat||from===game.dealerSeat?4000:2000)+honba*100,reason:'nagashi' as const})));}
export function applyTransfers(scores:Record<Seat,number>,transfers:PointTransfer[]){for(const t of transfers){if(!Number.isSafeInteger(t.amount)||t.amount<0||t.from===t.to)throw Error('Invalid transfer');scores[t.from]-=t.amount;scores[t.to]+=t.amount}}
