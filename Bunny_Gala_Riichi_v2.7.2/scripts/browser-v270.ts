import {chromium,type Page} from 'playwright';
import {createServer as createViteServer} from 'vite';
import {createGameServer} from '../server/src/index.js';
import {installScenario,assertPhysical,type Scenario} from '../server/qa/scenarios.js';
import {SEATS} from '@bunny/riichi-engine';
import {mkdirSync,writeFileSync,readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const out=process.env.QA_OUTPUT_DIR??'docs/qa-v270/browser';mkdirSync(out,{recursive:true});
const service=createGameServer();await new Promise<void>(r=>service.httpServer.listen(0,'127.0.0.1',r));
const port=(service.httpServer.address() as any).port;
const vite=await createViteServer({root:'client',server:{host:'127.0.0.1',port:0},define:{'import.meta.env.VITE_SERVER_URL':JSON.stringify(`http://127.0.0.1:${port}`)}});await vite.listen();
const browser=await chromium.launch({headless:true,...(process.env.QA_CHROMIUM_PATH?{executablePath:process.env.QA_CHROMIUM_PATH}:{}),args:['--no-sandbox','--disable-dev-shm-usage','--no-zygote','--use-gl=angle','--use-angle=swiftshader','--disable-background-timer-throttling','--disable-renderer-backgrounding','--disable-backgrounding-occluded-windows']});
const pages:Page[]=[],states:any[]=[],errors:string[]=[],expectedErrors:string[]=[],steps:string[]=[],assets:any[]=[];let injectedVideoFailure=false;
const pass=(s:string)=>{steps.push(s);console.log('PASS '+s);};
async function click(p:Page,name:string){await p.bringToFront();await p.getByRole('button',{name,exact:true}).click();}
function pause(code:string){const t=service.actionTimers.get(code);if(t)clearTimeout(t);service.actionTimers.delete(code);}
async function waitState(index:number,predicate:(s:any)=>boolean,timeout=15000){const until=Date.now()+timeout;while(Date.now()<until){if(states[index]&&predicate(states[index]))return states[index];await new Promise(r=>setTimeout(r,50));}throw Error('state timeout '+index);}
try{
 for(let i=0;i<4;i++){
  const context=await browser.newContext({viewport:{width:1920,height:1080},hasTouch:true});const p=await context.newPage();pages.push(p);p.setDefaultTimeout(45000);p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error'){if(injectedVideoFailure&&m.text().includes('net::ERR_FAILED'))expectedErrors.push(m.text());else errors.push(m.text());}});p.on('websocket',ws=>ws.on('framereceived',f=>{const t=String(f.payload);if(t.startsWith('42')){try{const [event,s]=JSON.parse(t.slice(2));if(event==='game:state')states[i]=s;}catch{}}}));await p.goto(vite.resolvedUrls!.local[0]!+'?lobby=1');await p.getByLabel('玩家名稱').fill('Bunny '+i);
 }
 await click(pages[0]!,'建立房間');const code=await pages[0]!.getByRole('heading',{name:/^[A-Z2-9]{6}$/}).innerText();
 for(let i=1;i<4;i++){await pages[i]!.getByLabel('房間碼').fill(code);await click(pages[i]!,'加入房間');}
 const room=service.rooms.getRoomForTesting(code)!;service.rooms.setRules(code,room.hostPlayerId,{actionTimeoutMs:120000});
 for(const p of pages)await click(p,'準備');await click(pages[0]!,'開始遊戲');pause(code);
 for(let i=0;i<4;i++){await waitState(i,s=>s.hand.revision===1);await pages[i]!.bringToFront();await pages[i]!.waitForFunction(()=>document.querySelector<HTMLCanvasElement>('.tile-webgl')?.dataset.uprightErrors==='0',{},{polling:100,timeout:60000});}
 pass('Four concurrent browser contexts create/join/Ready/start and load actual 3D scene');
 const p=pages[0]!;await p.bringToFront();if(process.env.QA_REDUCE_BACKGROUND==='1')for(const other of pages.slice(1))await other.emulateMedia({reducedMotion:'reduce'});
 for(const [file,hash] of JSON.parse(readFileSync('client/public/art/v5/asset-manifest.json','utf8')).map((e:any)=>[e.file,e.sha256])){
  const path='/art/v5/'+file;const response=await p.request.get(vite.resolvedUrls!.local[0]!.replace(/\/$/,'')+path);assert.equal(response.status(),200);assert.equal(createHash('sha256').update(await response.body()).digest('hex'),hash);await p.evaluate(async(path)=>{const i=new Image();i.src=path;await i.decode();if(!i.naturalWidth)throw Error('asset decode');},path);assets.push({path,status:200,sha256:hash,decoded:true});
 }
 const response=await p.request.get(vite.resolvedUrls!.local[0]!.replace(/\/$/,'')+'/cinematics/chinitsu.mp4');assert.equal(response.status(),200);assert.equal(createHash('sha256').update(await response.body()).digest('hex'),'2d513f10dc635c363e27f0c6003da1eab368a549eec24f06229913fc31574986');pass('All eight supplied master bytes served and decoded; official video byte hash verified over HTTP');
 for(const size of [{width:1920,height:1080},{width:1366,height:768},{width:844,height:390},{width:667,height:375},{width:915,height:412}]){
  await p.setViewportSize(size);await p.waitForFunction(()=>document.querySelector<HTMLCanvasElement>('.tile-webgl')?.dataset.contactErrors==='0',{},{polling:100});
  assert.equal(await p.locator('.wall-side').count(),4);assert.equal(await p.locator('.wall-stack').count(),68);assert.equal(await p.locator('.concealed [data-face]').count(),0);
  const geometry=await p.evaluate(()=>{const canvas=document.querySelector<HTMLCanvasElement>('.tile-webgl')!;const timer=document.querySelector('.turn-timer')!.getBoundingClientRect(),button=document.querySelector('[data-action=pass-claim]')!.getBoundingClientRect();return {up:canvas.dataset.uprightErrors,contact:canvas.dataset.contactErrors,clip:canvas.dataset.clippedTileBodies,timerAbove:timer.bottom<=button.top,noScroll:document.documentElement.scrollHeight<=innerHeight,buttonHeight:button.height};});
  assert.equal(geometry.up,'0');assert.equal(geometry.contact,'0');assert.equal(geometry.clip,'0');assert(geometry.timerAbove);if(size.height<500){assert(geometry.noScroll);assert(geometry.buttonHeight>=40);}
  await p.screenshot({path:out+`/gameplay-${size.width}x${size.height}.png`});
 }
 pass('Desktop 1920/1366 and mobile 844x390/667x375/915x412: four walls, upright axes/contact/clipping, timer above PASS, no mobile scrolling');
 await p.setViewportSize({width:1920,height:1080});const stage=await p.locator('.scene-viewport').boundingBox();assert(stage);for(const [seat,x,y,w,h] of [['wizard',.05,.35,.32,.32],['king',.63,.35,.32,.32],['ninja',.25,.20,.50,.17],['local',.02,.68,.94,.20]] as const)await p.screenshot({path:out+'/'+seat+'-hand.png',clip:{x:stage.x+x*stage.width,y:stage.y+y*stage.height,width:w*stage.width,height:h*stage.height}});
 // Enter debug camera via reload; same server hand and same physical meshes.
 await p.goto(vite.resolvedUrls!.local[0]!+'?lobby=1&debugCamera=side');await p.locator('.hand button[data-face]').first().waitFor();await p.waitForFunction(()=>document.querySelector<HTMLCanvasElement>('.tile-webgl')?.dataset.camera==='side',{},{polling:100,timeout:60000});await p.screenshot({path:out+'/upright-side-camera.png'});await p.goto(vite.resolvedUrls!.local[0]!+'?lobby=1');await p.locator('.hand button[data-face]').first().waitFor();pause(code);pass('Actual side-camera rendering and close-ups captured for all four hands');
 // Public wire includes only own identities, indicator faces and wall occupancy.
 for(let i=0;i<4;i++){const s=states[i],json=JSON.stringify(s);for(const other of SEATS.filter(x=>x!==s.you.seat))for(const tile of room.game!.hands[other])assert(!json.includes('"'+tile.id+'"'));for(const tile of room.game!.liveWall)assert(!json.includes('"'+tile.id+'"'));}
 pass('Actual four-player Socket.IO payloads contain no opposing concealed IDs or live wall IDs');
 const load=async(name:Scenario)=>{pause(code);installScenario(service.rooms,room,name);service.broadcastPrivateGameStates(code);pause(code);await waitState(0,s=>s.hand.revision===room.revision);await p.bringToFront();console.log('SCENARIO',name,JSON.stringify({revision:room.revision,actions:states[0].hand.actions,phase:room.game!.phase}));};
 for(const [name,action] of [['chi','chi'],['pon','pon'],['daiminkan','kan'],['ankan','ankan'],['kakan','kakan']] as const){await load(name);const button=p.locator(`.scene-actions button[data-action=${action}]:enabled`).first();await button.waitFor();assert(await button.locator('.action-tiles .tile').count()>0);await button.click();await waitState(0,s=>s.hand.melds.east.length===1);pause(code);assertPhysical(room);await p.screenshot({path:out+'/'+name+'-meld.png'});}
 pass('Valid physical fixtures: graphical Chi/Pon/Daiminkan/Ankan/Kakan controls execute through Socket.IO; seat-relative right melds');
 await load('riichi');await click(p,'立直');await p.locator('.hand button[data-face="2p"]').hover();assert(await p.locator('.waiting-preview').isVisible());await p.locator('.hand button[data-face="2p"]').click();await waitState(0,s=>s.room.riichiPot===1000);pause(code);assertPhysical(room);pass('Riichi discard highlights and public-information waiting previews; exact 1000-point deposit');
 await load('chi');await p.setViewportSize({width:844,height:390}); await p.locator('[data-action=chi]').first().click();await waitState(0,s=>s.hand.currentSeat==='east'&&s.hand.actions.canDiscard);pause(code);
 const t=p.locator('.hand button:enabled').first(),b=await t.boundingBox();assert(b);const rev=room.revision;await p.touchscreen.tap(b.x+b.width/2,b.y+b.height/2);await waitState(0,s=>s.hand.revision>rev);pause(code);pass('Mobile single touch submits a legal discard without a confirmation button');
 await p.setViewportSize({width:1920,height:1080});for(const page of pages)await page.emulateMedia({reducedMotion:'no-preference'});await load('chinitsu');assert.equal(await p.locator('.global-cinematic').count(),0);await click(p,'自摸');const event=room.cinematic!;assert(event&&event.trigger==='CHINITSU');
 for(let i=0;i<4;i++){await waitState(i,s=>s.hand.cinematic?.id===event.id&&s.hand.cinematic.phase==='playing');assert.equal(states[i].hand.cinematic.character,'yellow');assert.equal(states[i].hand.cinematic.endsAt,event.endsAt);}
 await p.locator('.global-cinematic video').waitFor();await p.waitForFunction(()=>{const v=document.querySelector<HTMLVideoElement>('.global-cinematic video');return !!v&&v.readyState>=2&&v.currentTime>.1;},{},{polling:100});assert.equal(await p.locator('.result-overlay').count(),0);await p.screenshot({path:out+'/chinitsu-official-video.png'});
 const reconnect=pages[3]!;await reconnect.reload({waitUntil:'domcontentloaded'});await reconnect.bringToFront();
 // Initial reconnect state may arrive in Socket.IO HTTP polling before WebSocket upgrade.
 // Verify the real UI rather than requiring the WebSocket-only diagnostic collector to see that packet.
 await reconnect.locator('.global-cinematic, .result-overlay').first().waitFor();
 if(await reconnect.locator('.global-cinematic').count()){assert.equal(await reconnect.locator('.result-overlay').count(),0);}
 await reconnect.getByRole('dialog',{name:'本局結算'}).waitFor({timeout:20000});
 for(const page of pages){await page.bringToFront();await page.getByRole('dialog',{name:'本局結算'}).waitFor();assert.equal(await page.locator('.global-cinematic').count(),0);}
 pass('Confirmed Chinitsu: all four share event/deadline, original MP4 actually plays, reload returns the current server presentation/results phase, server transitions all to results');
 await p.setViewportSize({width:844,height:390});await p.bringToFront();assert(await p.getByRole('button',{name:'下一局 ❯',exact:true}).isVisible());assert(await p.evaluate(()=>{const r=document.querySelector('.result-overlay')!.getBoundingClientRect();return r.bottom<=innerHeight&&r.right<=innerWidth;}));await p.screenshot({path:out+'/mobile-win-results.png'});await click(p,'下一局 ❯');await waitState(0,s=>!s.hand.cinematic&&!s.hand.result);pause(code);pass('Mobile fullscreen winning results and server-approved Next Hand clear prior cinematic');
 // Independent failure/Skip run: clients remain synchronized even with an unavailable video.
 await p.setViewportSize({width:1366,height:768});injectedVideoFailure=true;await p.route('**/cinematics/chinitsu.mp4',route=>route.abort('failed'));
 await load('chinitsu');await click(p,'自摸');const fallback=room.cinematic!;const peer=pages[1]!;await peer.bringToFront();await peer.locator('.global-cinematic').getByRole('button',{name:'跳過動畫',exact:true}).click();assert.equal(room.cinematic!.phase,'playing');assert.equal(await peer.locator('.result-overlay').count(),0);
 await p.bringToFront();await p.waitForFunction(()=>document.querySelector('.global-cinematic')?.classList.contains('quiet'),{},{polling:100});assert.equal(await p.locator('.result-overlay').count(),0);await p.screenshot({path:out+'/video-failure-fallback.png'});
 for(let i=0;i<4;i++)await waitState(i,s=>s.hand.cinematic?.id===fallback.id&&s.hand.cinematic.phase==='results',15000);
 await p.getByRole('dialog',{name:'本局結算'}).waitFor();await p.unroute('**/cinematics/chinitsu.mp4');injectedVideoFailure=false;
 pass('Actual video network failure + another client Skip: no premature results or client-driven advance; all four reach server results');
 assert.deepEqual(errors,[]);writeFileSync(out+'/browser-results.json',JSON.stringify({ok:true,browser:await browser.version(),steps,assets,consoleErrors:errors,intentionallyInjectedErrors:expectedErrors},null,2));console.log(JSON.stringify({ok:true,checks:steps.length,errors},null,2));
}catch(error){for(let i=0;i<pages.length;i++)try{await pages[i]!.screenshot({path:out+`/failure-${i}.png`});}catch{}const renderers=await Promise.all(pages.map(p=>p.evaluate(()=>({canvas:document.querySelector<HTMLCanvasElement>('.tile-webgl')?.dataset,root:document.querySelector<HTMLElement>('.game-scene')?.dataset,canvases:document.querySelectorAll('canvas').length})).catch(e=>({error:String(e)}))));writeFileSync(out+'/failure.json',JSON.stringify({error:String(error),steps,errors,renderers},null,2));throw error;}finally{await browser.close();await vite.close();await service.close();}
