import {fileURLToPath} from 'node:url';
import {mkdirSync} from 'node:fs';
const root=fileURLToPath(new URL('../',import.meta.url)),out=root+'work/qa';mkdirSync(out,{recursive:true});
import {chromium} from 'playwright';
import {preview} from 'vite';
import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
const app=await preview({root,preview:{host:'127.0.0.1',port:5183,strictPort:true}});
const browser=await chromium.launch({headless:true,...(process.env.QA_CHROMIUM_PATH?{executablePath:process.env.QA_CHROMIUM_PATH}:{}),args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader']});
const page=await browser.newPage({viewport:{width:844,height:390},deviceScaleFactor:2,isMobile:true,hasTouch:true});
const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`)});
await page.addInitScript(()=>localStorage.setItem('bunny-options',JSON.stringify({autoSort:true,autoRon:true,disableCalls:true,autoDiscard:true,skipAnimation:false,reduceEffects:false})));

try{
 await page.goto('http://127.0.0.1:5183',{waitUntil:'domcontentloaded'});
 assert.equal(await page.evaluate(()=>typeof window.__bunnyQA),'undefined');
 assert.equal(await page.locator('.phone-opening,.phone-dice').count(),0);console.log('DIRECT START PASSED');
 await page.waitForSelector('.physical-renderer[data-ready=true]',{timeout:60000});if(await page.locator('[role=timer]').count()){const turn=await page.locator('.phone-round').getAttribute('data-turn');assert(turn==='0'||await page.locator('.lamp-0.claim-lit').count()===1,'a visible timer belongs to your decision');}
 await page.screenshot({path:out+'/production-playing.png',timeout:90000});console.log('PLAYING');
 await page.waitForSelector('.phone-result',{timeout:180000});console.log('SETTLED');
 await page.screenshot({path:out+'/production-result.png',timeout:90000});
 assert.equal(await page.locator('.phone-score-changes>div').count(),4);
 assert(!(await page.locator('.phone-result').innerText()).includes('NaN'));
 const totals=await page.locator('.phone-score-changes strong').allTextContents();const sum=totals.map(x=>Number(x.replaceAll(',',''))).reduce((a,b)=>a+b,0);const counters=await page.locator('.soul-center-core > span').innerText();const pot=Number(counters.match(/供託 (\d+)/)?.[1]??0);assert.equal(sum+pot,100000,'four scores and carried pot conserve points');
 await page.locator('[data-action=show-score-map]').click();await page.locator('[data-action=next-hand]').click();await page.waitForSelector('.phone-result',{state:'detached'});assert.equal(await page.locator('.phone-opening,.phone-dice').count(),0);assert.equal(await page.locator('.physical-renderer').getAttribute('data-wall-tiles'),'0');
 assert.deepEqual(errors,[]);writeFileSync(out+'/production-report.json',JSON.stringify({ok:true,compiled:true,qaHooksAbsent:true,directStartWithoutDiceOrWall:true,realAutoplayReachesSettlement:true,nextHandWorks:true,scores:totals,errors},null,2));console.log('PRODUCTION PASSED');
}finally{console.log('ERRORS',errors);await browser.close();await new Promise(r=>app.httpServer.close(r));}
