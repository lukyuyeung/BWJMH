import {chromium} from 'playwright';import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:956,height:440},hasTouch:true,isMobile:true});await page.addInitScript(()=>localStorage.setItem('bunny-interface-guide-v1','seen'));
if(!process.env.QA_WEBGL)await page.addInitScript(()=>{HTMLCanvasElement.prototype.getContext=()=>null});const errors=[];page.on('pageerror',e=>errors.push(e.message));
try{
 await page.goto('http://127.0.0.1:5182/?mode=bot');await page.waitForFunction(()=>window.__bunnyQA);await page.evaluate(()=>window.__bunnyQA.pause());await page.waitForFunction(()=>document.documentElement.dataset.startupState==='ready');await page.locator('#startup-curtain').waitFor({state:'detached'});
 const cdp=await page.context().newCDPSession(page);
 const touch=(type,p)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:p?[{x:p.x,y:p.y}]:[]});
 const center=async locator=>{const r=await locator.boundingBox();return{x:r.x+r.width/2,y:r.y+r.height/2}};
 const snap=()=>page.evaluate(()=>JSON.stringify(window.__bunnyQA.snapshot().hand.discards));
 await page.evaluate(()=>window.__bunnyQA.scenario('inspect-idle'));
 const first=page.locator('.phone-hand-tiles>button').first(),next=page.locator('.phone-hand-tiles>button').nth(1);
 const a=await center(first),b=await center(next),before=await snap();
 await touch('touchStart',a);await page.locator('.hand-inspection-info').waitFor();assert.equal(await page.locator('.hand-inspection-info strong').textContent(),'3');assert.equal(await first.evaluate(e=>e.classList.contains('selected')),true);assert(await page.locator('.phone-river .matching').count()>0,'Idle touch highlights visible matching discards');
 await page.waitForTimeout(180);await page.screenshot({path:process.env.QA_WEBGL?'/workspace/work/inspect79-webgl.png':'/workspace/work/inspect79-fallback.png'});await touch('touchMove',b);await page.waitForFunction(()=>document.querySelector('.hand-inspection-info strong')?.textContent==='0');assert.equal(await next.evaluate(e=>e.classList.contains('selected')),true);assert.equal(await page.locator('.phone-hand-tiles>button.selected').count(),1);assert.equal(await page.locator('.phone-river .matching').count(),0,'Scrub updates face');
 await touch('touchMove',a);await page.waitForFunction(()=>document.querySelector('.phone-river .matching'));
 await touch('touchEnd');assert.equal(await page.locator('.phone-river .matching').count(),0);assert.equal(await snap(),before);assert.equal(await page.locator('.hand-inspection-info').count(),0);assert.equal(await page.locator('.phone-hand-tiles>button.selected').count(),0);
 // Legal turn: inspection must never become a discard, including native synthesized click.
 await page.evaluate(()=>window.__bunnyQA.scenario('riichi'));
 const legal=await page.evaluate(()=>window.__bunnyQA.snapshot().hand.discardTileIds[0]);
 const button=page.locator('[data-tile-id="'+legal+'"]'),point=await center(button),legalBefore=await snap();
 await touch('touchStart',point);await page.waitForTimeout(380);await touch('touchEnd');await page.waitForTimeout(100);assert.equal(await snap(),legalBefore,'Hold release never discards');
 await touch('touchStart',point);await touch('touchMove',{x:point.x,y:point.y-100});await touch('touchMove',point);await touch('touchEnd');assert.equal(await snap(),legalBefore,'Leaving and returning cancels tap');
 await touch('touchStart',point);await touch('touchCancel');assert.equal(await snap(),legalBefore,'Cancel never discards');
 await page.waitForFunction(()=>document.documentElement.dataset.tableMotionBusy!=='true');const tapTime=Date.now()/1000;await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[point],timestamp:tapTime});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[],timestamp:tapTime+.06});await page.waitForFunction(id=>window.__bunnyQA.snapshot().hand.discards.east.some(t=>t.id===id),legal);assert.equal(await page.evaluate(id=>window.__bunnyQA.snapshot().hand.discards.east.filter(t=>t.id===id).length,legal),1,'Quick tap discards exactly once');
 await page.evaluate(()=>window.__bunnyQA.scenario('inspect-idle'));await page.mouse.move(a.x,a.y);await page.waitForFunction(()=>document.querySelector('.phone-river .matching'));
 assert.deepEqual(errors,[]);console.log('PASS native touch: idle scrub highlight, release clears, hold/move-out/cancel never discard, quick tap exactly once; desktop hover preserved');
}finally{await browser.close()}
