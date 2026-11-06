/** Prototype reference rules. Paytable is provisional, not a verified official JILI table. */
export const SYMBOLS = Object.freeze(['J','Q','K','A','S','H','C','D']);
export const BASE_MULTIPLIERS = Object.freeze([1,2,3,5]);
export const FREE_MULTIPLIERS = Object.freeze([2,4,6,10]);
export const DEFAULT_PAYTABLE = Object.freeze({A:[.5,1.5,2.5],K:[.4,1.2,2],Q:[.3,.9,1.5],J:[.2,.6,1],S:[.1,.3,.5],H:[.1,.3,.5],C:[.05,.15,.25],D:[.05,.15,.25]});
export const BET_TIERS = Object.freeze([1,2,5,10,20,25,50,100,200,500,1000,2000,5000,10000]);
const wild = c => c.symbol === 'ANGEL' || c.symbol === 'DEVIL';
const money = n => Math.round((n + Number.EPSILON)*100)/100;
const clone = b => b.map(c=>({...c}));
function check(board) {
  if (!Array.isArray(board) || board.length!==20 || board.some(c=>!c || ![...SYMBOLS,'CARROT','ANGEL','DEVIL'].includes(c.symbol))) throw new TypeError('Board must contain 20 valid cards in row-major order.');
}
export function createRng(seed=Date.now()) {
  let a=typeof seed==='number'?seed>>>0:[...String(seed)].reduce((h,c)=>Math.imul(h^c.charCodeAt(0),16777619),2166136261)>>>0;
  return ()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;};
}
export function maxBet(balance) { return Math.max(0,Math.floor((Number(balance)||0)*10+1e-8)/100); }
export function allowedBets(balance) { return BET_TIERS.filter(b=>b<=maxBet(balance)); }
export function freeSpinAward(board,isFree=false) {check(board);return board.filter(c=>c.symbol==='CARROT').length>=3?(isFree?5:10):0;}
export function evaluate(board,bet,multiplier=1,paytable=DEFAULT_PAYTABLE) {
  check(board);
  if (!Number.isFinite(bet)||bet<0||!Number.isFinite(multiplier)||multiplier<0) throw new RangeError('Bet and multiplier must be finite and nonnegative.');
  const wins=[]; const all=new Set();
  for (const symbol of SYMBOLS) {
    const groups=[];
    for(let col=0;col<5;col++) {
      const indices=[];
      for(let row=0;row<4;row++){const i=row*5+col;if(board[i].symbol===symbol||wild(board[i]))indices.push(i);}
      if(!indices.length)break; groups.push(indices);
    }
    if(groups.length<3)continue;
    const ways=groups.reduce((n,g)=>n*g.length,1),pay=paytable[symbol]?.[groups.length-3]??0;
    if(!pay)continue;
    const positions=groups.flat();positions.forEach(i=>all.add(i));
    wins.push({symbol,reels:groups.length,ways,pay,amount:money(bet*multiplier*pay*ways),positions});
  }
  return {total:money(wins.reduce((n,w)=>n+w.amount,0)),wins,positions:[...all].sort((a,b)=>a-b)};
}
export function createEngine({rng=Math.random,paytable=DEFAULT_PAYTABLE,goldChance=.12,carrotChance=.035,devilChance=.25}={}) {
  for(const p of [goldChance,carrotChance,devilChance])if(!(p>=0&&p<=1))throw new RangeError('Probabilities must be between zero and one.');
  const random=()=>{const n=rng();if(!(n>=0&&n<1))throw new RangeError('RNG must return a number in [0,1).');return n;};
  const cardAt=index=>{
    if(random()<carrotChance)return {symbol:'CARROT',gold:false};
    const symbol=SYMBOLS[Math.floor(random()*SYMBOLS.length)],col=index%5;
    return {symbol,gold:col>=1&&col<=3&&random()<goldChance};
  };
  function deal(){return Array.from({length:20},(_,i)=>cardAt(i));}
  function resolveStep(input,bet,multiplier=1) {
    const evaluation=evaluate(input,bet,multiplier,paytable),board=clone(input),conversions=[],copies=[],replacements=[];
    for(const index of evaluation.positions){
      const c=board[index];
      if(c.gold&&SYMBOLS.includes(c.symbol)&&index%5>=1&&index%5<=3){
        const card={symbol:random()<devilChance?'DEVIL':'ANGEL',gold:true};board[index]=card;conversions.push({index,card:{...card}});
      }else board[index]=null;
    }
    for(const source of conversions.filter(c=>c.card.symbol==='DEVIL')){
      const candidates=board.flatMap((c,index)=>c&&index%5>=1&&!wild(c)&&c.symbol!=='CARROT'?[index]:[]);
      const count=Math.min(candidates.length,1+Math.floor(random()*4));
      for(let n=0;n<count;n++){
        const slot=Math.floor(random()*candidates.length),index=candidates.splice(slot,1)[0],card={symbol:'DEVIL',gold:true};
        board[index]=card;copies.push({index,source:source.index,card:{...card}});
      }
    }
    board.forEach((c,index)=>{if(!c){const card=cardAt(index);board[index]=card;replacements.push({index,fromRow:-1,card:{...card}});}});
    return {evaluation,winPositions:evaluation.positions,convertedPositions:conversions.map(c=>c.index),copiedPositions:copies.map(c=>c.index),board,replacements,conversions,copies};
  }
  return {deal,resolveStep,evaluate:(board,bet,multiplier=1)=>evaluate(board,bet,multiplier,paytable)};
}
