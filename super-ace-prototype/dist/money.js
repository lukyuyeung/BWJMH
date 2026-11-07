/** Display is abbreviated; all accepted stakes and game results retain their numeric value. */
export const exactMoney=n=>Number(n||0).toLocaleString('en-US',{maximumFractionDigits:2});
export function compactMoney(value){
 const n=Number(value)||0,a=Math.abs(n);if(a<1e6)return exactMoney(n);
 const units=[[1e12,'T'],[1e9,'B'],[1e6,'M']];let i=units.findIndex(([scale])=>a>=scale);if(i>0&&Number((a/units[i][0]).toFixed(3))>=1000)i--;
 return(n<0?'−':'')+(a/units[i][0]).toFixed(3)+units[i][1];
}
export const roundMoney=n=>Math.round((Number(n)+Number.EPSILON)*100)/100;
export const betStep=balance=>Math.max(.01,roundMoney(Math.max(0,balance)*.001));
export const betLimit=balance=>Math.max(0,Math.floor((Number(balance)||0)*10+1e-8)/100);
export function clampBet(value,balance){const limit=betLimit(balance);return limit<.01?0:Math.min(limit,Math.max(.01,roundMoney(value)))}
export const ratioBets=balance=>[.001,.005,.01,.02,.05,.1].map(ratio=>({ratio,value:clampBet(balance*ratio,balance)}));
export function parseMoney(input){const m=String(input).replaceAll(',','').trim().match(/^(\d+(?:\.\d*)?|\.\d+)\s*([MBT])?$/i);if(!m)return NaN;const n=Number(m[1])*({M:1e6,B:1e9,T:1e12}[m[2]?.toUpperCase()]||1);return Number.isFinite(n)?roundMoney(n):NaN}
/** Baseline survives reload in this tab; wallet settlement remains the single source of truth. */
export function createSessionTotal(storage,balance,key='gala-session-total-v1'){
 let opening;try{opening=JSON.parse(storage.getItem(key))?.opening}catch{}if(!Number.isFinite(opening))opening=balance;
 const persist=()=>storage.setItem(key,JSON.stringify({opening}));persist();
 return{net:current=>roundMoney(current-opening),reset(current){opening=current;persist()}};
}
