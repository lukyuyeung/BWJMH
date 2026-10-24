import {fileURLToPath} from 'node:url';
import {mkdirSync} from 'node:fs';
const root=fileURLToPath(new URL('../',import.meta.url)),out=root+'work/qa';mkdirSync(out,{recursive:true});
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
const dir=out;
const browser=await chromium.launch({headless:true,...(process.env.QA_CHROMIUM_PATH?{executablePath:process.env.QA_CHROMIUM_PATH}:{}),args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader']});
const page=await browser.newPage({viewport:{width:844,height:390},deviceScaleFactor:2,isMobile:true,hasTouch:true});
const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`)});
const snap=async name=>{console.log('SNAP',name);await page.screenshot({path:`${dir}/${name}.png`})};
const scenario=async name=>{await page.evaluate(async n=>{await window.__bunnyQA.scenario(n);window.__bunnyQA.pause()},name);await page.waitForTimeout(150)};
const within=async selector=>{const result=await page.evaluate(s=>{const stage={left:0,top:0,right:innerWidth,bottom:innerHeight};return [...document.querySelectorAll(s)].filter(e=>getComputedStyle(e).display!=='none').map(e=>{const r=e.getBoundingClientRect();return {text:e.textContent?.slice(0,40),ok:r.width>0&&r.height>0&&r.left>=stage.left-1&&r.top>=stage.top-1&&r.right<=stage.right+1&&r.bottom<=stage.bottom+1,r:r.toJSON()}})},selector);assert(result.length,selector+' exists');assert(result.every(x=>x.ok),JSON.stringify(result));};
try{
 await page.goto('http://127.0.0.1:5182');await page.waitForFunction(()=>window.__bunnyQA);await page.evaluate(()=>window.__bunnyQA.pause());await page.waitForSelector('.physical-renderer[data-ready=true]',{timeout:60000});await scenario('timer');
 if(!process.env.RESULTS_ONLY){
 assert.equal(await page.locator('.phone-opening,.phone-dice').count(),0);assert.equal(await page.locator('.physical-renderer').getAttribute('data-wall-tiles'),'0');await snap('04-playing');
 await within('.phone-hand,.phone-dora,.phone-options,.phone-menu,.phone-clock');
 assert.equal(await page.locator('.phone-options input').count(),4);
 const initial=await page.locator('[role=timer] b').textContent();await page.waitForTimeout(1100);assert(Number(await page.locator('[role=timer] b').textContent())<Number(initial),'countdown advances');
 const beforeDiscard=await page.evaluate(()=>{const s=window.__bunnyQA.snapshot();return s.hand.discards[s.you.seat].length});await page.locator('.phone-hand button:not(:disabled)').first().click();assert.equal(await page.evaluate(()=>{const s=window.__bunnyQA.snapshot();return s.hand.discards[s.you.seat].length}),beforeDiscard+1,'single click discards immediately');assert.equal(await page.locator('[data-action=discard-confirm]').count(),0);
 for(const name of ['pon','chi','daiminkan','ankan','kakan']){
  await scenario(name);await page.locator(`[data-action=${name==='daiminkan'?'kan':name}]`).first().click();
  await page.waitForSelector('.v9-call',{timeout:3000});await within('.v9-call');await snap('action-'+name);
  assert.equal(await page.locator('.phone-own-melds .phone-meld').count(),1,'exactly one own meld '+name);
  await page.waitForTimeout(750);
 }
 }else{await page.evaluate(()=>{window.__bunnyQA.pause();window.__bunnyQA.skipOpening()});}
 await scenario('riichi');await page.locator('[data-action=riichi-select]').click();const choice=page.locator('.phone-hand button.riichi-choice').first();await choice.click();assert.equal(await page.locator('[data-action=discard-confirm]').count(),0);await page.waitForSelector('.new-call-cutin[aria-label=RIICHI]');await page.waitForFunction(()=>{const e=document.querySelector('.new-call-cutin[aria-label=RIICHI]'),r=e?.getBoundingClientRect(),s=document.querySelector('.phone-stage').getBoundingClientRect();return r&&r.left>=s.left-1&&r.right<=s.right+1});await within('.new-call-cutin[aria-label=RIICHI]');await snap('action-riichi');
 await scenario('tsumo');await page.locator('[data-action=tsumo]').click();await page.evaluate(()=>window.__bunnyQA.finishCinematic());await page.waitForSelector('[aria-label="本局計算"]');await within('.phone-result,.phone-result footer button,.phone-score-changes');await snap('05-tsumo-result');
 assert((await page.locator('.phone-result-indicators').innerText()).includes('未立直'),'ura hidden for non-riichi win');
 const afterScores=await page.locator('.phone-score-changes').innerText();assert(!afterScores.includes('NaN'));assert.equal(await page.locator('.phone-score-changes>div').count(),4);
 await page.locator('[data-action=show-score-map]').click();await page.locator('[data-action=next-hand]').click();await page.waitForSelector('.phone-result',{state:'detached'});assert.equal(await page.locator('.phone-opening,.phone-dice').count(),0);await snap('06-next-hand');
 await scenario('ron');await page.locator('[data-action=ron]').click();await page.evaluate(()=>window.__bunnyQA.finishCinematic());await page.waitForSelector('.phone-result');await snap('07-ron-result');
 await scenario('exhaustive');await page.evaluate(()=>{window.__bunnyQA.pause(false)});await page.waitForSelector('.phone-result',{timeout:20000});await page.evaluate(()=>window.__bunnyQA.pause());await snap('08-draw-result');
 await scenario('pon');await page.locator('[data-action=pon]').click();await page.waitForTimeout(700);
 for(const [width,height] of [[667,375],[915,412],[390,844],[1440,900]]){await page.setViewportSize({width,height});await page.waitForFunction(()=>Math.abs(document.querySelector('.phone-stage').getBoundingClientRect().width-1125*Math.min(innerWidth/1125,innerHeight/634,2))<1);await page.waitForTimeout(150);await within('.phone-hand,.phone-dora,.phone-options,.phone-menu,.phone-clock');await snap(`layout-${width}x${height}`)}
 await page.setViewportSize({width:844,height:390});await scenario('nine-terminals');const count=await page.evaluate(()=>window.__bunnyQA.snapshot().hand.discards.east.length);await page.evaluate(()=>window.__bunnyQA.expire());assert.equal(await page.evaluate(()=>window.__bunnyQA.snapshot().hand.discards.east.length),count+1,'AFK discards safely');
 assert.deepEqual(errors,[]);writeFileSync(dir+'/report.json',JSON.stringify({ok:true,checks:['direct-start','no-physical-wall','timer','four-options','pon','chi','daiminkan','ankan','kakan','riichi','tsumo-result','ron-result','exhaustive-result','next-hand','4-viewports'],errors},null,2));console.log('ALL PASSED');
}catch(e){await snap('failure');throw e;}finally{console.log('ERRORS',errors);await browser.close()}
