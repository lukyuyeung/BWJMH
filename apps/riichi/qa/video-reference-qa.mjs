import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
const b=await chromium.launch({headless:true,executablePath:process.env.QA_CHROMIUM_PATH??'/usr/bin/chromium',args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader']});
const page=await b.newPage({viewport:{width:848,height:384}}),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url())});
const scenario=async name=>{await page.evaluate(async n=>{window.__bunnyQA.pause();await window.__bunnyQA.scenario(n)},name);await page.waitForTimeout(200)};
try{
 await page.goto('http://127.0.0.1:5182',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.__bunnyQA);await page.evaluate(()=>{window.__bunnyQA.pause();window.__bunnyQA.skipOpening()});await page.waitForSelector('.physical-renderer[data-ready=true]',{timeout:60000});
 let canvas=await page.locator('.physical-renderer canvas').boundingBox();assert(Math.abs(canvas.x)<1&&Math.abs(canvas.width-848)<1,'3D scene fills the wide phone without shrinking the core hand');
 await page.screenshot({path:'work/qa/video-aligned.png'});
 await scenario('timer');const before=await page.evaluate(()=>window.__bunnyQA.snapshot().hand.discards.east.length);await page.locator('.phone-hand button:not(:disabled)').first().click();assert.equal(await page.evaluate(()=>window.__bunnyQA.snapshot().hand.discards.east.length),before+1);await page.waitForFunction(()=>document.querySelector('.physical-renderer').dataset.lastDiscard);assert(await page.locator('.physical-last-marker').isVisible());
 await scenario('mobile-result');await page.evaluate(()=>window.__bunnyQA.finishCinematic());await page.locator('[data-action=show-score-map]').click();assert.equal(await page.locator('.score-map-seat').count(),4);await page.screenshot({path:'work/qa/video-score-map.png'});await page.locator('[data-action=next-hand]').click();await page.waitForSelector('.phone-opening');
 await scenario('final-ranking');await page.evaluate(()=>window.__bunnyQA.finishCinematic());await page.locator('[data-action=show-score-map]').click();await page.locator('[data-action=show-ranking]').click();assert.equal(await page.locator('.match-ranking li').count(),4);const scores=await page.locator('.match-ranking li>strong').allTextContents();const numbers=scores.map(v=>Number(v.replace(/[^0-9-]/g,'')));assert(numbers.every((v,i)=>i===0||numbers[i-1]>=v));await page.screenshot({path:'work/qa/video-final-ranking.png'});await page.locator('[data-action=restart-match]').click();await page.waitForSelector('.phone-opening');
 assert.deepEqual(errors,[]);writeFileSync('work/qa/video-reference-report.json',JSON.stringify({ok:true,viewport:'848x384',panorama:true,lastDiscard:true,scoreMap:true,finalRanking:numbers,nextHand:true,restart:true,errors},null,2));console.log('VIDEO REFERENCE PASSED');
}finally{await b.close()}
