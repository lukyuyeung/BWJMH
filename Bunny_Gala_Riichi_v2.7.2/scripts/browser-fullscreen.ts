import {chromium} from 'playwright';
import {createServer} from 'vite';
import {createGameServer} from '../server/src/index.js';
import {installScenario} from '../server/qa/scenarios.js';
import {mkdirSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const out=process.env.QA_OUTPUT_DIR??'docs/qa-v272';mkdirSync(out,{recursive:true});
const service=createGameServer();await new Promise<void>(r=>service.httpServer.listen(0,'127.0.0.1',r));
const port=(service.httpServer.address() as any).port;
const app=await createServer({root:'client',server:{host:'127.0.0.1',port:0},define:{'import.meta.env.VITE_SERVER_URL':JSON.stringify(`http://127.0.0.1:${port}`)}});await app.listen();
const browser=await chromium.launch({headless:true,...(process.env.QA_CHROMIUM_PATH?{executablePath:process.env.QA_CHROMIUM_PATH}:{}),args:['--no-sandbox','--disable-dev-shm-usage','--no-zygote','--use-gl=angle','--use-angle=swiftshader']});
const page=await browser.newPage({viewport:{width:844,height:390},hasTouch:true});page.setDefaultTimeout(30000);
const errors:string[]=[],checks:any[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
try{
 await page.goto(app.resolvedUrls!.local[0]!);await page.getByLabel('Player name').fill('Fullscreen QA');
 for(const name of ['Create Room','Fill with Bots','Ready'])await page.getByRole('button',{name,exact:true}).click();
 const code=await page.getByRole('heading',{name:/^[A-Z2-9]{6}$/}).innerText(),room=service.rooms.getRoomForTesting(code)!;
 service.rooms.setRules(code,room.hostPlayerId,{actionTimeoutMs:120000});await page.getByRole('button',{name:'Start Game',exact:true}).click();
 const pause=()=>{clearTimeout(service.actionTimers.get(code));service.actionTimers.delete(code);};pause();
 for(const size of [{width:844,height:390},{width:844,height:375},{width:667,height:375},{width:915,height:412}]){
  await page.setViewportSize(size);await page.waitForFunction(()=>document.querySelector<HTMLCanvasElement>('.tile-webgl')?.dataset.uprightErrors==='0');
  await page.waitForFunction(()=>{const r=document.querySelector('.scene-viewport')!.getBoundingClientRect();return Math.abs(r.width-innerWidth)<1&&Math.abs(r.height-innerHeight)<1;});
  await page.waitForFunction(()=>{const root=document.querySelector('.scene-canvas')!,canvas=document.querySelector<HTMLCanvasElement>('.tile-webgl'),hand=document.querySelector('.hand')!.getBoundingClientRect();return root.classList.contains('webgl-ready')&&Math.abs(Number(canvas?.dataset.tableScale)-Number(getComputedStyle(root).getPropertyValue('--table-scale')))<.001&&Math.abs(Number(canvas?.dataset.handTop)-hand.top)<1;});
  const bounds:any=await page.evaluate("(()=>{const rect=(q)=>{const b=document.querySelector(q).getBoundingClientRect();return {x:b.x,y:b.y,width:b.width,height:b.height};};return {stage:rect('.scene-viewport'),hand:rect('.hand'),tile:rect('.hand .tile'),center:rect('.round-center'),menus:rect('.mobile-menus'),action:rect('[data-action=pass-claim]'),timer:rect('.turn-timer'),scroll:document.documentElement.scrollHeight,viewport:innerHeight};})()");
  assert.equal(bounds.stage.x,0);assert.equal(bounds.stage.y,0);assert(bounds.scroll<=bounds.viewport);assert(bounds.action.y+bounds.action.height<=size.height+1);assert(bounds.timer.y+bounds.timer.height<=bounds.action.y+1);assert(bounds.center.y+bounds.center.height<=bounds.tile.y+1,'round information must not sit behind hand');assert(bounds.action.height>=43.9);
  assert(await page.locator('.hand .tile').count()>=13);assert.equal(await page.locator('.mobile-options:visible').count(),0);
  await page.screenshot({path:out+`/mobile-${size.width}x${size.height}.png`});checks.push({size,bounds});
 }
 await page.getByRole('button',{name:'Settings',exact:true}).click();await page.locator('.mobile-panel').getByLabel('Auto Ron',{exact:true}).check();await page.locator('.mobile-panel').getByLabel('Auto Ron',{exact:true}).uncheck();await page.getByRole('button',{name:'Close panel',exact:true}).click();
 await page.locator('.hand button:enabled').first().tap();await page.locator('[data-action=discard-confirm]').click();pause();
 installScenario(service.rooms,room,'chi');service.broadcastPrivateGameStates(code);pause();await page.locator('[data-action=chi]:enabled').first().waitFor();await page.screenshot({path:out+'/mobile-chi.png'});
 await page.locator('[data-action=chi]:enabled').first().click();pause();await page.waitForFunction(()=>document.querySelector('.own-melds .meld'));await page.screenshot({path:out+'/mobile-meld.png'});
 installScenario(service.rooms,room,'chinitsu');service.broadcastPrivateGameStates(code);pause();await page.locator('[data-action=tsumo]:enabled').click();await page.getByRole('dialog',{name:'Hand results'}).waitFor();const result=await page.getByRole('dialog',{name:'Hand results'}).boundingBox();assert(result&&result.x>=0&&result.y>=0&&result.x+result.width<=915+1&&result.y+result.height<=412+1);await page.getByRole('button',{name:'Next Hand',exact:true}).waitFor();await page.screenshot({path:out+'/mobile-results.png'});
 assert.deepEqual(errors,[]);writeFileSync(out+'/browser-results.json',JSON.stringify({ok:true,checks,errors},null,2));console.log(JSON.stringify({ok:true,viewports:checks.length,errors}));
}catch(e){await page.screenshot({path:out+'/failure.png'}).catch(()=>{});console.error(e);throw e;}finally{await browser.close();await app.close();await service.close();}
