import {BASE_MULTIPLIERS,FREE_MULTIPLIERS} from './engine.js';
const clone=x=>structuredClone(x),money=n=>Math.round(n*100)/100;
/** Commit the random result once; animation and reloads only replay this plan. */
export function buildRoundPlan(engine,{bet,isFree=false,initialBoard=engine.deal(),limit=1000}){
 let board=clone(initialBoard),total=0,bonus=0;const steps=[];const multipliers=isFree?FREE_MULTIPLIERS:BASE_MULTIPLIERS;
 for(let index=0;index<limit;index++){
  const multiplier=multipliers[Math.min(index,3)],result=engine.evaluate(board,bet,multiplier);
  const award=!bonus&&board.filter(c=>c.symbol==='CARROT').length>=3?(isFree?5:10):0;if(award)bonus=award;
  total=money(total+result.total);const next=result.total>0?engine.resolveStep(board,bet,multiplier):null;
  steps.push({index,board:clone(board),multiplier,result:clone(result),award,next:next?clone(next):null});
  if(!next)return{initialBoard:clone(initialBoard),finalBoard:clone(board),steps,total,bonus,bet,isFree};board=next.board;
 }
 throw new Error('Round exceeds presentation limit');
}
export function applyBonus(state,record){
 if(record.bonusApplied||!record.plan.bonus)return false;
 if(!record.plan.isFree)state.freeTotal=0;state.free+=record.plan.bonus;record.bonusApplied=true;return true;
}
export function settleRound(state,record){
 if(record.credited)return false;state.balance=money(state.balance+record.plan.total);if(record.plan.isFree)state.freeTotal=money(state.freeTotal+record.plan.total);record.credited=true;return true;
}
export function createJournal(storage,key='gala-carrot-v2'){
 return{read(){try{const s=JSON.parse(storage.getItem(key));return s?.schema===2&&Number.isFinite(s.balance)&&s.balance>=0?s:null}catch{return null}},write(state){storage.setItem(key,JSON.stringify({...state,schema:2}))}};
}
