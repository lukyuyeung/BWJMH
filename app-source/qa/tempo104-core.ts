import assert from 'node:assert/strict';import {performance} from 'node:perf_hooks';import {RoomManager} from '../rules/room';import{advanceMatch,createMatchState}from'../rules/match';import{getWaits,getRiichiDiscardIds,createStandardWall,createHandState,dealInitialHands,type Seat}from'../engine/index';import{installScenario,assertPhysical}from'./scenarios';
const equal={east:25000,south:25000,west:25000,north:25000},leader={east:30000,south:24000,west:24000,north:22000};
function last(wind:'east'|'south'='east',n:1|2|3|4=4){return{...createMatchState(),roundWind:wind,handNumber:n,dealer:'north'as Seat}}
{const m=last();advanceMatch(m,false,'tonpuusen',false,{scores:equal});assert.equal(m.roundWind,'south');assert.equal(m.handNumber,1);assert(!m.finished)}
{const m=last();advanceMatch(m,false,'tonpuusen',false,{scores:leader});assert(m.finished)}
{const m=last('south',1);advanceMatch(m,false,'tonpuusen',false,{scores:leader});assert(m.finished)}
{const m=last('south',1);advanceMatch(m,true,'tonpuusen',true,{scores:leader});assert(!m.finished);assert.equal(m.honba,1)}
{const m=last('south',1);m.dealer='east';advanceMatch(m,true,'tonpuusen',false,{scores:leader,agariYame:true});assert(m.finished)}
{const m=last('south');advanceMatch(m,false,'tonpuusen',true,{scores:equal});assert(m.finished)}
{const m=last('south');advanceMatch(m,true,'tonpuusen',true,{scores:equal});assert(!m.finished)}
const manager=new RoomManager(),{room:r,player:p}=manager.createRoom('timing');manager.fillWithBots(r.code,p.id);manager.setReady(r.code,p.id,true);manager.startGame(r.code,p.id);
for(const fixture of['riichi','riichi-draw','pon','ankan','riichi-ron','tsumo']as const){installScenario(manager,r,fixture);const g=r.game!,old=g.phase==='awaiting_discard'&&g.currentSeat==='east'&&!g.riichi.east.declared&&g.liveWall.length>=4&&g.melds.east.every(m=>m.open===false)?g.hands.east.filter((t,i)=>getWaits(g.hands.east.filter((_,j)=>j!==i)).length>0).map(t=>t.id):[];if(!g.melds.east.length)assert.deepEqual(getRiichiDiscardIds(g,'east'),old);assertPhysical(r)}
// Compare 100 physically valid shuffled deals against the original exact wait enumeration.
let seed=7919;const random=(max:number)=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return Math.floor(seed/4294967296*max)};
for(let n=0;n<100;n++){const wall=createStandardWall();for(let i=wall.length-1;i>0;i--){const j=random(i+1);[wall[i],wall[j]]=[wall[j]!,wall[i]!]}const game=createHandState(dealInitialHands(wall)),hand=game.hands.east,expected=hand.filter((_,i)=>getWaits(hand.filter((__,j)=>j!==i)).length>0).map(t=>t.id);assert.deepEqual(getRiichiDiscardIds(game,'east'),expected)}
installScenario(manager,r,'riichi');const t=performance.now();for(let i=0;i<100;i++)manager.getPlayerGameState(r.code,p.id);const elapsed=performance.now()-t;assert(elapsed<1000,'100 legal state serializations should not stall the UI for seconds');
// Exhaustive-draw path must actually enter South, not just the pure match helper.
r.match=last();r.handMatch={...r.match};r.scores={...equal};manager.settleExhaustiveDrawForTesting(r.code,[]);assert.equal(r.match.roundWind,'south');assert(!r.match.finished);
console.log('PASS East4 30k threshold/South entry/dealer priority/South sudden death/South4 cap/agari-yame; real RoomManager extension; riichi availability unchanged;100 state serializations '+elapsed.toFixed(1)+'ms');
