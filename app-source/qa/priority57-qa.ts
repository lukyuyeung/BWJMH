import assert from 'node:assert/strict';import {fixture} from './priority57-fixtures';import {assertPhysical,installScenario} from './scenarios';import {privateTableView} from '../rules/private-view';import {carrotSettlement,CARROT_ENTRIES,entryForUnit} from '../rules/carrot-settlement';import {SEATS} from '../engine/index';
{
 const {manager:m,room:r,id}=fixture('competition'),tile=r.game!.claim!.tile.id;
 assert(m.getPlayerGameState(r.code,id('east')).hand.actions.chiSequences.length);assert(m.getPlayerGameState(r.code,id('south')).hand.actions.canPon);assert(m.getPlayerGameState(r.code,id('west')).hand.actions.canRon);
 m.chi(r.code,id('east'),['1m','2m','3m']);assert.equal(r.game!.phase,'awaiting_claim');assert.equal(r.game!.melds.east.length,0);assert.throws(()=>m.chi(r.code,id('east'),['1m','2m','3m']),/received/);m.pon(r.code,id('south'));assert.equal(r.game!.phase,'awaiting_claim');m.ron(r.code,id('west'));assert.equal(r.game!.result!.winner,'west');assert.equal(r.game!.result!.winningTile.id,tile);assert.equal(r.game!.melds.east.length,0);assert.equal(r.game!.melds.south.length,0);assertPhysical(r);
}
{
 const {manager:m,room:r,id}=fixture('competition');m.chi(r.code,id('east'),['1m','2m','3m']);m.pon(r.code,id('south'));m.passClaim(r.code,id('west'));assert.equal(r.game!.melds.south[0]!.type,'pon');assert.equal(r.game!.melds.east.length,0);assertPhysical(r);
}
{
 const {manager:m,room:r,id}=fixture('competition');m.chi(r.code,id('east'),['1m','2m','3m']);m.passClaim(r.code,id('west'));assert.equal(r.game!.phase,'awaiting_claim');m.passClaim(r.code,id('south'));assert.equal(r.game!.melds.east[0]!.type,'chi');assertPhysical(r);
}
for(const order of [['south','east'],['east','south']] as const){const {manager:m,room:r,id}=fixture('double');r.scores.north-=2000;r.riichiPot=2000;r.handStartingScores={...r.scores};r.match.honba=2;const before={...r.scores};m.ron(r.code,id(order[0]));assert.equal(r.settled,false);assert.deepEqual(r.scores,before);m.ron(r.code,id(order[1]));assert(r.settled);assert.equal(r.game!.results!.length,2);assert.deepEqual(r.game!.results!.map(w=>w.winner),['east','south']);for(const win of r.game!.results!)assert.equal(r.scores[win.winner]-before[win.winner],win.score.payment.ron!+600+(win.winner==='east'?2000:0));assert.equal(Object.values(r.scores).reduce((a,b)=>a+b,0)+r.riichiPot,100000);assert.equal(r.awardedPot,2000);assertPhysical(r)}
{
 const {manager:m,room:r,id}=fixture('triple'),before={...r.scores},honba=r.match.honba;m.ron(r.code,id('west'));m.ron(r.code,id('south'));assert(!r.settled);m.ron(r.code,id('east'));assert.equal(r.game!.abortiveReason,'triple_ron');assert(r.settled);assert.equal(r.game!.result,undefined);assert.deepEqual(r.scores,before);assert.equal(r.match.honba,honba+1);assertPhysical(r);
}
{
 const {manager:m,room:r,id}=fixture('competition');m.chi(r.code,id('east'),['1m','2m','3m']);for(const viewer of [null,...r.players.map(p=>p.id)]){const view=privateTableView(m,r.code,viewer),json=JSON.stringify(view);for(const p of r.players)if(p.id!==viewer)for(const tile of r.game!.hands[p.seat])assert(!json.includes('"'+tile.id+'"'),'Hidden tile leaked');assert(!json.includes('resumeToken'));assert(!json.includes('liveWall'));assert(!json.includes('pendingClaims'));if(viewer!==id('east'))assert(!json.includes('claimResponse'));if(viewer===null){assert.equal(view.you,null);assert.deepEqual(view.hand.assistance,{waits:[],riichi:{}})}}const snap=privateTableView(m,r.code,id('east'));if(snap.you)snap.you.hand.length=0;assert(r.game!.hands.east.length===13);
}
{
 const {manager:m,room:r,id}=fixture('triple');m.ron(r.code,id('east'));m.ron(r.code,id('south'));m.passClaim(r.code,id('west'));assert.equal(r.game!.results!.length,2);assert.equal(r.game!.phase,'won');assertPhysical(r);
}
let seed=123456;const random=(max:number)=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%max};
for(let i=0;i<2000;i++){const a=random(180000)-40000,b=random(140000)-30000,c=random(120000)-20000;const scores={east:a,south:b,west:c,north:100000-a-b-c};const entry=CARROT_ENTRIES[i%CARROT_ENTRIES.length]!;const result=carrotSettlement(entry,scores);assert.equal(Object.values(result.payouts).reduce((a,b)=>a+b,0),4*entry);assert(Object.values(result.payouts).every(n=>Number.isSafeInteger(n)&&n>=0&&n<=entry*4));}
{
 const {manager:m,room:r}=fixture('competition');r.players[0]!.autoPlay=true;assert(m.advanceAutoPlay(r.code),'A queued automatic pass is a host-visible change');assert.equal(r.pendingClaims!.responses.east!.kind,'pass');assert.equal(r.game!.phase,'awaiting_claim');assert.equal(m.advanceAutoPlay(r.code),false,'One response only');
}
for(const entry of CARROT_ENTRIES){const normal=carrotSettlement(entry,{east:30000,south:20000,west:25000,north:25000});assert.equal(normal.payouts.east,entry*1.2);assert.equal(normal.payouts.south,entry*.8);for(const scores of [{east:-15000,south:15000,west:40000,north:60000},{east:25100,south:24900,west:25000,north:25000},{east:0,south:33333,west:33333,north:33334}]){const p=carrotSettlement(entry,scores);assert.equal(Object.values(p.payouts).reduce((a,b)=>a+b,0),4*entry);assert(Object.values(p.payouts).every(n=>Number.isSafeInteger(n)&&n>=0));assert(Object.values(p.net).every(n=>n>=-entry));}assert.equal(entryForUnit(entry/250),entry)}
assert.throws(()=>carrotSettlement(1000,{east:24000,south:25000,west:25000,north:25000}),/100000/);
{
 const {manager:m,room:r,id}=fixture('double');installScenario(m,r,'timer');r.scores={east:1000,south:49000,west:25000,north:25000};r.handStartingScores={...r.scores};m.settleExhaustiveDrawForTesting(r.code,['south']);assert.equal(r.scores.east,0);assert(r.match.finished);assert.throws(()=>m.startNextHand(r.code),/finished/);
}
{
 const {manager:m,room:r,id}=fixture('double');installScenario(m,r,'riichi');r.scores={east:1000,south:49000,west:25000,north:25000};r.handStartingScores={...r.scores};const legal=m.getPlayerGameState(r.code,id('east')).hand.actions.riichiDiscardIds;assert(legal.length);m.riichiDiscard(r.code,id('east'),legal[0]!);for(const p of r.players)if(m.getPlayerGameState(r.code,p.id).hand.actions.canPassClaim)m.passClaim(r.code,p.id);assert(r.match.finished);assert.equal(r.scores.east,0);assert.equal(r.riichiPot,0);assert.equal(Object.values(r.scores).reduce((a,b)=>a+b,0),100000);
}
console.log('PASS real-tile claim competition, buffered chi, Pon priority, double-Ron both arrival orders/payments/pot, triple-Ron draw, four-seat/spectator privacy, all carrot tiers/conservation/caps/rounding, zero-point immediate match end');
