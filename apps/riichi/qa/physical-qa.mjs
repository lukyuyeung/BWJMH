import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {writeFileSync,mkdirSync} from 'node:fs';
const browser=await chromium.launch({headless:true,executablePath:process.env.QA_CHROMIUM_PATH??'/usr/bin/chromium',args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader']});
const page=await browser.newPage({viewport:{width:1125,height:634}}),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url())});
const snapshot=()=>page.evaluate(()=>window.__bunnyQA.snapshot());
const scenario=async name=>{await page.evaluate(async n=>{window.__bunnyQA.pause();await window.__bunnyQA.scenario(n)},name);await page.waitForTimeout(100)};
try{
 await page.goto('http://127.0.0.1:5182');await page.waitForFunction(()=>window.__bunnyQA);await page.evaluate(()=>window.__bunnyQA.pause());await page.waitForSelector('.physical-renderer[data-ready=true]',{timeout:60000});
 const diagnostic=await page.locator('.physical-renderer').evaluate(e=>({...e.dataset}));assert.equal(diagnostic.camera,'shared-projective');assert(Math.abs(Number(diagnostic.tileThickness)/Number(diagnostic.tileWidth)-.44)<.005);
 await scenario('exhaustive');assert.equal(await page.locator('[role=timer]').count(),0,'no countdown for south');assert(await page.locator('.lamp-1').evaluate(e=>e.classList.contains('lit')),'south has the active direction light');
 await scenario('timer');assert.equal(await page.locator('[role=timer]').count(),1);assert.equal(await page.locator('.turn-lamp.lit').count(),1);assert(await page.locator('.lamp-0').evaluate(e=>e.classList.contains('lit')));
 await page.locator('.phone-hand button:not(:disabled)').first().click();assert.equal(await page.locator('[role=timer]').count(),0,'no countdown for someone else or their claim window');
 const observed=new Set([0,1]);
 for(let i=0;i<14;i++){
  const state=await snapshot(),phase=state.hand.phase,order=['east','south','west','north'],relative=(order.indexOf(state.hand.currentSeat)-order.indexOf(state.you.seat)+4)%4;
  const active=!['awaiting_claim','won','exhaustive_draw','abortive_draw'].includes(phase);
  assert.equal(await page.locator('.turn-lamp.lit').count(),active?1:0,'one real active seat, none during claims');
  if(active){assert(await page.locator('.lamp-'+relative).evaluate(e=>e.classList.contains('lit')));observed.add(relative)}
  const ownDecision=phase==='awaiting_discard'&&state.hand.currentSeat===state.you.seat||phase==='awaiting_claim'&&(state.hand.actions.canPassClaim||state.hand.actions.canRon||state.hand.actions.canPon||state.hand.actions.canKan||state.hand.actions.chiSequences.length>0);
  assert.equal(await page.locator('[role=timer]').count(),ownDecision?1:0,'timer follows your legal decision only');
  await page.evaluate(()=>window.__bunnyQA.expire());await page.waitForTimeout(80);
 }
 assert(observed.size>=2,'own and opposing direction indicators verified');
 await scenario('pon');assert.equal(await page.locator('[role=timer]').count(),1);assert.equal(await page.locator('.turn-lamp.lit').count(),0);assert.equal(await page.locator('.lamp-0.claim-lit').count(),1);await page.locator('[data-action=pon]').click();assert.equal(await page.locator('.phone-own-melds .phone-meld').count(),1);
 await page.screenshot({path:'work/qa/physical-validated.png'});
 assert.deepEqual(errors,[]);mkdirSync('work/qa',{recursive:true});writeFileSync('work/qa/physical-report.json',JSON.stringify({ok:true,diagnostic,observedSeats:[...observed],timer:'local decisions only',turnLights:'authoritative seat, separate claim state',errors},null,2));console.log('PHYSICAL TABLE PASSED');
}finally{await browser.close()}
