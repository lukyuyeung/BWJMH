import type { AgariShape } from './agari.js';
import type { WinMethod } from './yaku.js';

export type LimitName = 'none'|'mangan'|'haneman'|'baiman'|'sanbaiman'|'yakuman';
export interface Payment { ron?: number; dealerTsumo?: number; nonDealerTsumo?: number; eachTsumo?: number; total: number }
export interface ScoreResult { han:number; fu:number; yakuman:number; basePoints:number; limit:LimitName; dealer:boolean; method:WinMethod; payment:Payment }
export interface FuContext { shape:AgariShape; method:WinMethod; closed:boolean; /** Future: pair/wait/meld decomposition will extend this safely. */ }

const ceil100=(n:number)=>Math.ceil(n/100)*100;

/**
 * Calculates standard Riichi base points and payments. Honba / riichi sticks are
 * deliberately excluded: they belong to match settlement, not hand value.
 */
export function calculateScore(han:number, fu:number, dealer:boolean, method:WinMethod, yakuman=0):ScoreResult {
  if (!Number.isInteger(han)||han<0||!Number.isInteger(fu)||fu<0||!Number.isInteger(yakuman)||yakuman<0) throw new Error('Invalid score input');
  if (yakuman===0 && han===0) throw new Error('A non-yakuman hand requires at least 1 han');
  const {basePoints,limit}=getBasePoints(han,fu,yakuman);
  let payment:Payment;
  if(method==='ron'){
    const ron=ceil100(basePoints*(dealer?6:4)); payment={ron,total:ron};
  } else if(dealer){
    const eachTsumo=ceil100(basePoints*2); payment={eachTsumo,total:eachTsumo*3};
  } else {
    const dealerTsumo=ceil100(basePoints*2), nonDealerTsumo=ceil100(basePoints); payment={dealerTsumo,nonDealerTsumo,total:dealerTsumo+nonDealerTsumo*2};
  }
  return {han,fu,yakuman,basePoints,limit,dealer,method,payment};
}

export function getBasePoints(han:number,fu:number,yakuman=0):{basePoints:number;limit:LimitName}{
  if(yakuman>0)return{basePoints:8000*yakuman,limit:'yakuman'};
  if(han>=13)return{basePoints:8000,limit:'yakuman'}; // MVP: counted yakuman / kazoe yakuman
  if(han>=11)return{basePoints:6000,limit:'sanbaiman'};
  if(han>=8)return{basePoints:4000,limit:'baiman'};
  if(han>=6)return{basePoints:3000,limit:'haneman'};
  const raw=fu*Math.pow(2,han+2);
  if(han>=5 || (han===4&&fu>=40) || (han===3&&fu>=70) || raw>=2000)return{basePoints:2000,limit:'mangan'};
  return{basePoints:raw,limit:'none'};
}

/**
 * Safe MVP fu evaluator. It only returns a value when current engine data is
 * sufficient to do so without guessing. Standard hands need a decomposition
 * (triplets, pair value and wait type), which is intentionally the next step.
 */
export function calculateKnownFu(ctx:FuContext):number|null{
  if(ctx.shape==='chiitoitsu')return 25;
  if(ctx.shape==='kokushi')return 0; // ignored for yakuman payments
  return null;
}
