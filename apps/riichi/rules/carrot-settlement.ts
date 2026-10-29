import {SEATS,type Seat} from '../engine/deal';
export const CARROT_ENTRIES=[1000,10000,100000,1000000] as const;
export type CarrotEntry=typeof CARROT_ENTRIES[number];
/** Pure calculation only. Real lock/pay must be done once by the platform ledger. */
export function carrotSettlement(entry:CarrotEntry,scores:Record<Seat,number>){
 if(!CARROT_ENTRIES.includes(entry)||!SEATS.every(s=>Number.isSafeInteger(scores[s]))||SEATS.reduce((n,s)=>n+scores[s],0)!==100000)throw Error('Final points must total 100000; settle outstanding riichi sticks first.');
 const E=BigInt(entry),base=25000n,lossUnits=SEATS.map(s=>{const delta=BigInt(scores[s])-base;return delta<0n?(-delta>base?base:-delta):0n}),gainUnits=SEATS.map(s=>BigInt(Math.max(0,scores[s]-25000)));
 const totalLoss=lossUnits.reduce((a,b)=>a+b,0n),totalGain=gainUnits.reduce((a,b)=>a+b,0n);
 // All rational values share this denominator; one largest-remainder pass preserves every carrot.
 const denominator=base*(totalGain||1n),numerators=SEATS.map((_,i)=>E*denominator-E*lossUnits[i]!*(totalGain||1n)+(totalGain?E*totalLoss*gainUnits[i]!:0n));
 const paid=numerators.map(n=>n/denominator),remainders=numerators.map((n,i)=>({i,r:n%denominator})).sort((a,b)=>a.r===b.r?a.i-b.i:a.r>b.r?-1:1);
 let left=Number(4n*E-paid.reduce((a,b)=>a+b,0n));for(const {i} of remainders){if(left--<=0)break;paid[i]=paid[i]!+1n;}
 const payouts=Object.fromEntries(SEATS.map((seat,i)=>[seat,Number(paid[i])])) as Record<Seat,number>,net=Object.fromEntries(SEATS.map(s=>[s,payouts[s]-entry])) as Record<Seat,number>;
 return {entry,totalLocked:entry*4,payouts,net};
}
/** Lock250 platform units per seat; four room units map to the supported carrot entries. */
export function entryForUnit(unit:number):CarrotEntry{const entry=unit*250;if(!CARROT_ENTRIES.includes(entry as CarrotEntry))throw Error('Unsupported mahjong room');return entry as CarrotEntry}
