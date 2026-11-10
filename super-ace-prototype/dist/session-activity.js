import {summariseRound} from './round-history.js?v=card-reveal-v1';
const empty=()=>({rows:[],charged:0,payout:0,count:0});
const valid=r=>r&&typeof r.id==='string'&&Number.isFinite(r.bet)&&Number.isFinite(r.payout)&&Number.isFinite(r.charged)&&Array.isArray(r.steps);
export function createSessionActivity(storage,key='gala-session-ledger-v2',legacyKey='gala-session-history-v1'){
 let state;try{const saved=JSON.parse(storage.getItem(key));if(saved&&Array.isArray(saved.rows)&&['charged','payout','count'].every(k=>Number.isFinite(saved[k])))state={...saved,rows:saved.rows.filter(valid).slice(0,10)}}catch{}
 const persist=()=>{try{storage.setItem(key,JSON.stringify(state));return true}catch{return false}};
 if(!state){state=empty();try{const old=JSON.parse(storage.getItem(legacyKey));if(Array.isArray(old)){const rows=old.filter(valid);state.rows=rows.slice(0,10);for(const r of rows){state.charged+=r.charged;state.payout+=r.payout;state.count++}}}catch{}if(persist())try{storage.setItem(legacyKey,'[]')}catch{}}
 return{read:()=>state.rows.slice(),totals:()=>({charged:state.charged,payout:state.payout,count:state.count}),clear(){state=empty();persist();try{storage.setItem(legacyKey,'[]')}catch{}},commit(record,balance){if(record.demo||!record.credited||state.rows.some(r=>r.id===record.id))return false;const row=summariseRound(record,balance),previous=state;state={rows:[row,...state.rows].slice(0,10),charged:Math.round((state.charged+row.charged)*100)/100,payout:Math.round((state.payout+row.payout)*100)/100,count:state.count+1};if(persist())return true;state=previous;return false}};
}
