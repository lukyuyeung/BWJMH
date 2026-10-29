import {chromium} from 'playwright';import assert from 'node:assert/strict';import fs from 'node:fs';
const b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
try{
 const p=await b.newPage({viewport:{width:1125,height:634}}),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.addInitScript(()=>{const o=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(t,...a){return /webgl/.test(t)?null:o.call(this,t,...a)}});
 await p.goto('http://127.0.0.1:5195/?mode=bot');await p.locator('#startup-curtain').waitFor({state:'detached',timeout:60000});await p.evaluate(()=>window.__bunnyQA.pause());
 const result=await p.evaluate(async()=>{
  const E=await import('/engine/index.ts'),Y=await import('/src/result-yakuhai.ts'),A=await import('/src/game-audio.tsx');
  const seats=['east','south','west','north'],winds=['E','S','W','N'];
  const fixture=({wind='E',dragons=['P'],winner='east',dealer='east',round='east'}={})=>{
   const g=structuredClone(window.__bunnyQA.snapshot()),pool=E.createStandardWall(false),take=text=>text.split(' ').map(face=>{const i=pool.findIndex(t=>t.face===face);return pool.splice(i,1)[0]});
   const raw=take('1p 2p 3p 9p 9p'),groups=[...dragons.map(d=>`${d} ${d} ${d}`),`${wind} ${wind} ${wind}`];while(groups.length<3)groups.push('4p 5p 6p');
   const melds=groups.map(text=>{const tiles=take(text);return {type:tiles[0].face===tiles[1].face?'pon':'chi',tiles,calledTile:tiles[0],from:'south',open:true}});
   const seatWind=winds[(seats.indexOf(winner)-seats.indexOf(dealer)+4)%4],evaluation=E.evaluateWin([...raw,...melds.flatMap(m=>m.tiles)],{method:'ron',closed:false,seatWind,roundWind:round==='east'?'E':'S',winningFace:'9p',melds});
   if(!evaluation.legal)throw Error('Invalid physical winning fixture');
   g.hand.match={...g.hand.match,dealer,roundWind:round,honba:0};g.hand.melds[winner]=melds;g.hand.result={winner,from:'south',method:'ron',evaluation,dora:{total:0,indicatorDora:0,akaDora:0,uraDora:0},score:E.calculateScore(evaluation.han,evaluation.fu.fu,seatWind==='E','ron',evaluation.yakuman)};
   g.hand.settlement={scoreChanges:{east:0,south:0,west:0,north:0},tenpai:[],winningHand:raw,winningHands:{[winner]:raw}};
   return g;
  };
  const checks=[];let g=fixture();const details=Y.resultYakuhaiDetails(g).filter(Boolean);if(details.map(d=>d.zh).join('|')!=='役牌・白|自風・東|場風・東')throw Error('Double east + white labels');
  if(g.hand.result.evaluation.han!==5||g.hand.result.score.payment.total!==12000)throw Error('Scoring changed');
  const voices=A.resultVoiceEvents(g);if(voices.join('|')!=='yaku-honitsu|yaku-haku|yaku-seat-wind|yaku-round-wind')throw Error('Voice order mismatch');checks.push('Screenshot hand: open honitsu + white + double east remains 5 han / 12000');
  window.yakuhai71Game=g;
  g=fixture({wind:'S',winner:'south',round:'south'});if(Y.resultYakuhaiDetails(g).filter(Boolean).map(d=>d.zh).join('|')!=='役牌・白|自風・南|場風・南')throw Error('Double south');checks.push('Double south split into two 1-han rows');
  g=fixture({wind:'S',winner:'north',dealer:'west'});if(Y.resultYakuhaiDetails(g).filter(Boolean).map(d=>d.zh).join('|')!=='役牌・白|自風・南')throw Error('Dealer rotation');checks.push('Seat wind follows rotated dealer, not absolute seat name');
  g=fixture({wind:'E',dragons:['F','C'],winner:'south',round:'south'});if(Y.resultYakuhaiDetails(g).filter(Boolean).map(d=>d.zh).join('|')!=='役牌・發|役牌・中')throw Error('Dragons/non-value wind');checks.push('Green/red distinguished; non-value wind does not add a yaku');
  g=fixture();const original=g.hand.settlement.winningHands.east;g.hand.settlement.winningHand=[];g.hand.settlement.winningHands.south=[{id:'other',face:'F',red:false}];if(Y.resultYakuhaiDetails(g).filter(Boolean).length!==3)throw Error('Winner-specific tiles');checks.push('Per-winner winningHands used before shared fallback');
  return {checks,voices};
 });
 await p.evaluate(async()=>{const R=await import('/node_modules/.vite/deps/react.js'),D=await import('/node_modules/.vite/deps/react-dom_client.js'),W=await import('/src/win-banner.tsx');window.voice71=[];window.BunnyAudio.speak=async(role,event,scope,options)=>{window.voice71.push(event);options?.onStart?.();return true};const el=document.createElement('div');el.className='phone-stage';el.style.cssText='position:fixed;inset:0;width:1125px;height:634px;z-index:99999;background:#071510';document.body.append(el);window.y71root=(D.createRoot??D.default.createRoot)(el);window.y71root.render((R.default??R).createElement(W.WinBanner,{game:window.yakuhai71Game,character:'yellow',name:'玩家',level:'mangan',onScores:()=>{},reduce:true}));});
 const rows=await p.locator('.wb-yaku-row').allTextContents();assert(rows.some(s=>s.includes('役牌・白')));assert(rows.some(s=>s.includes('自風・東')));assert(rows.some(s=>s.includes('場風・東')));
 await p.waitForFunction(()=>document.querySelector('.win-banner-overlay')?.dataset.stage==='complete');assert.deepEqual((await p.evaluate(()=>window.voice71)).slice(0,4),result.voices);await p.screenshot({path:'/workspace/work/yakuhai71.png'});
 assert.deepEqual(errors,[]);fs.writeFileSync('/workspace/work/yakuhai71.json',JSON.stringify({passed:true,...result,rows,errors},null,2));console.log('PASS',result.checks,'and actual report row/voice alignment');
}finally{await b.close()}
