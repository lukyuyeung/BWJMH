import {chromium} from 'playwright';
import {createServer} from 'vite';
import {createGameServer} from '../server/src/index.ts';
import {installScenario} from '../server/qa/scenarios.ts';
import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
const out=process.env.QA_OUTPUT_DIR??'/tmp/bunny-table-ui-qa';mkdirSync(out,{recursive:true});
const server=createGameServer();await new Promise(r=>server.httpServer.listen(0,'127.0.0.1',r));const port=server.httpServer.address().port;
const vite=await createServer({root:'client',server:{host:'127.0.0.1',port:0},define:{'import.meta.env.VITE_SERVER_URL':JSON.stringify(`http://127.0.0.1:${port}`)}});await vite.listen();
const browser=await chromium.launch({headless:true,...(process.env.QA_CHROMIUM_PATH?{executablePath:process.env.QA_CHROMIUM_PATH}:{}),args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:844,height:390},hasTouch:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));page.setDefaultTimeout(30000);
 await page.goto(vite.resolvedUrls.local[0]);await page.locator('.hand button[data-face]').first().waitFor();assert.equal(await page.getByRole('button',{name:'建立房間',exact:true}).count(),0);
 const code=await page.locator('.table').getAttribute('data-room-code'),room=server.rooms.getRoomForTesting(code),player=room.players.find(p=>!p.isBot);
 assert.equal(room.players.length,4);assert.equal(room.players.filter(p=>p.isBot).length,3);
 // Freeze bot timeouts in this fixture; legal claims are resolved explicitly below.
 const registerTimer=server.actionTimers.set.bind(server.actionTimers);server.actionTimers.set=(key,timer)=>{clearTimeout(timer);return registerTimer(key,timer);};
 const pause=()=>{clearTimeout(server.actionTimers.get(code));server.actionTimers.delete(code);};pause();
 assert.equal(await page.locator('[data-action=pass-claim]').count(),0);assert.equal(await page.locator('.round-counters,.center-winds').count(),0);assert.equal(await page.locator('.wall-count').innerText(),`餘${room.game.liveWall.length}張`);
 const menus=page.locator('.mobile-menus button');assert.deepEqual(await menus.evaluateAll(nodes=>nodes.map(n=>n.getAttribute('aria-label'))),['設定','牌譜','役種','全螢幕']);
 const sort=page.getByRole('button',{name:'自動理牌',exact:true});assert.equal(await sort.getAttribute('aria-pressed'),'true');await sort.click();assert.equal(await sort.getAttribute('aria-pressed'),'false');await sort.click();
 await page.getByRole('button',{name:'略過叫牌',exact:true}).click();assert.equal(await page.getByRole('button',{name:'略過叫牌',exact:true}).innerText(),'不鳴');await page.getByRole('button',{name:'略過叫牌',exact:true}).click();
 await page.getByRole('button',{name:'役種',exact:true}).click();await page.getByRole('heading',{name:'役種 · 和牌指南'}).waitFor();assert.equal(await page.locator('.yaku-guide details').count(),38);assert.equal(await page.locator('.yaku-example').count(),38);await page.locator('.yaku-guide details').nth(5).locator('summary').click();assert.equal(await page.locator('.yaku-guide details').nth(5).locator('[data-face=C]').count(),3);await page.getByRole('button',{name:'關閉設定',exact:true}).click();
 await page.getByRole('button',{name:'牌譜',exact:true}).click();await page.getByText('目前未儲存完整牌譜。',{exact:true}).waitFor();await page.getByRole('button',{name:'關閉設定',exact:true}).click();
 await page.screenshot({path:out+'/initial.png'});
 const railBounds=await page.locator('.automation-rail').boundingBox(),profileBounds=await page.locator('.scene-pos-3').boundingBox();assert(railBounds&&profileBounds&&profileBounds.x>=railBounds.x+railBounds.width,'left controls must not obscure the opponent profile');
 await page.screenshot({path:out+'/landscape-table.png'});
 const beforeDiscard=room.revision;await page.locator('.hand button:enabled').first().tap();await page.locator('[data-action=discard-confirm]').click();
 await page.waitForFunction(()=>document.querySelectorAll('.board .river .latest-discard').length===1);pause();
 const latestFace=await page.locator('.board .river .latest-discard').getAttribute('data-face');
 if(room.game.phase==='awaiting_claim')for(const other of room.players.filter(p=>p.id!==player.id))if(server.rooms.getPlayerGameState(code,other.id).hand.actions.canPassClaim)server.rooms.passClaim(code,other.id);
 if(room.game.phase==='awaiting_draw'){const next=room.players.find(p=>p.seat===room.game.currentSeat);server.rooms.draw(code,next.id);server.broadcastPrivateGameStates(code);pause();}
 assert.equal(await page.locator('.board .river .latest-discard').getAttribute('data-face'),latestFace);assert(room.revision>beforeDiscard);
 await page.waitForFunction(()=>!!document.querySelector('.board .river .latest-discard')?.dataset.faceBounds);
 const discardedRect=await page.locator('.board .river .latest-discard').evaluate(el=>JSON.parse(el.dataset.faceBounds));
 const model=await page.locator('.tile-webgl').getAttribute('data-tile-models');assert.deepEqual(JSON.parse(model),[[44,60,18]],'all physical tiles must use one model');
 const handWidth=(await page.locator('.hand .tile:not(.mini)').first().boundingBox()).width;assert(handWidth>0);assert.equal(await page.locator('.tile-webgl').getAttribute('data-camera-count'),'1');
 const nearWall=await page.locator('.wall-pos-0 .tile-back,.wall-pos-0 .wall-lower').evaluateAll(nodes=>nodes.filter(n=>n.dataset.faceBounds).map(n=>JSON.parse(n.dataset.faceBounds)));
 assert(nearWall.every(w=>!(discardedRect.x<w.x+w.width&&discardedRect.x+discardedRect.width>w.x&&discardedRect.y<w.y+w.height&&discardedRect.y+discardedRect.height>w.y)),'near wall must not cover the discarded face');
 await page.screenshot({path:out+'/latest-discard-on-table.png'});
 for(const [scenario,action,type,count] of [['chi','chi','chi',3],['pon','pon','pon',3],['daiminkan','kan','kan',4],['ankan','ankan','ankan',4],['kakan','kakan','kakan',4]]){
  installScenario(server.rooms,room,scenario);server.broadcastPrivateGameStates(code);pause();const button=page.locator(`[data-action=${action}]:enabled`).first();await button.waitFor();await page.evaluate(()=>{window.__tableSizes=[];const until=performance.now()+1000;const sample=()=>{const r=document.querySelector('.scene-viewport').getBoundingClientRect();window.__tableSizes.push([r.x,r.y,r.width,r.height,getComputedStyle(document.querySelector('.scene-viewport')).transform]);if(performance.now()<until)requestAnimationFrame(sample);};sample();});await button.click();
  if(scenario==='kakan'){await page.locator('[data-action=kakan]').waitFor({state:'hidden'});if(room.game.phase==='awaiting_claim'){for(const other of room.players.filter(p=>p.id!==player.id))if(server.rooms.getPlayerGameState(code,other.id).hand.actions.canPassClaim)server.rooms.passClaim(code,other.id);server.broadcastPrivateGameStates(code);}}
  pause();
  const meld=page.locator(`.own-melds .meld[data-type=${type}]`);try{await meld.waitFor();}catch(error){console.log('MELD_DIAGNOSTIC',scenario,room.game.phase,room.game.melds.east.map(m=>({type:m.type,count:m.tiles.length,calledIndex:m.tiles.findIndex(t=>t.id===m.calledTile.id)})),await page.locator('.error').allTextContents(),await page.locator('.own-melds .meld').evaluateAll(nodes=>nodes.map(n=>n.dataset.type)));await page.screenshot({path:out+'/failure.png'});throw error;}assert.equal(await meld.locator('.tile,.tile-back').count(),count);
  if(type==='ankan'){assert.equal(await meld.locator('.tile-back').count(),2);}else{assert.equal(await meld.locator('.sideways').count(),type==='kakan'?2:1);}
  await page.screenshot({path:out+`/meld-${type}.png`});const frames=await page.evaluate(()=>window.__tableSizes);assert(frames.length>0);assert(frames.every(f=>f[0]===0&&f[1]===0&&f[2]===844&&f[3]===390&&f[4]==='none'),'meld events must not zoom or resize the table');
 }
 installScenario(server.rooms,room,'exhaustive');server.broadcastPrivateGameStates(code);pause();
 await page.waitForFunction(count=>document.querySelectorAll('.board .river .tile').length===count,Object.values(room.game.discards).reduce((n,r)=>n+r.length,0));
 const rivers=page.locator('.board .river');for(let i=0;i<4;i++){const seat=['east','south','west','north'][i];assert.deepEqual(await rivers.nth(i).locator('[data-face]').evaluateAll(nodes=>nodes.map(n=>n.dataset.face)),room.game.discards[seat].map(t=>t.face));}
 assert.equal(await page.locator('.public-tile-tools,.river-open,.discard-glance,.river-dialog').count(),0);
 await page.waitForFunction(()=>Array.from(document.querySelectorAll('.board .river .tile')).every(el=>!!el.dataset.faceBounds));
 await page.screenshot({path:out+'/populated-before-check.png'});
 const faceRects=await page.locator('.board .river .tile:not(.sideways)').evaluateAll(nodes=>nodes.map(n=>JSON.parse(n.dataset.faceBounds)));
 assert.equal(await page.locator('.scene-viewport').evaluate(el=>el.scrollTop),0,'calling must not scroll the table out of view');
 assert(faceRects.every(r=>r.x>=0&&r.y>=0&&r.x+r.width<=844&&r.y+r.height<=390),'all public faces must be inside the screen');
 assert(faceRects.length>50);assert.equal(await page.locator('.tile-webgl').getAttribute('data-camera-count'),'1');assert.deepEqual(JSON.parse(await page.locator('.tile-webgl').getAttribute('data-tile-models')),[[44,60,18]],'wall, hands, rivers and melds must share one physical size');
 const hud=await page.locator('.round-center').boundingBox();assert(faceRects.every(r=>!(r.x<hud.x+hud.width&&r.x+r.width>hud.x&&r.y<hud.y+hud.height&&r.y+r.height>hud.y)),'HUD must not cover actual WebGL river faces');
 assert.equal(await page.locator('.scene-actor').count(),3);assert(await page.locator('.scene-pos-2 .avatar img').evaluate(img=>getComputedStyle(img).opacity==='1'&&img.complete&&img.naturalWidth>0));
 await page.screenshot({path:out+'/populated-rivers.png'});
 await page.reload();await page.locator('.hand button[data-face]').first().waitFor();assert.equal(await page.locator('.table').getAttribute('data-room-code'),code);assert.equal(server.rooms.snapshotRooms().length,1);pause();
 const session={code,playerId:player.id,resumeToken:player.resumeToken};await page.close();const context=await browser.newContext({viewport:{width:844,height:390}});await context.addInitScript(value=>{window.bunnyGalaSession=value;},session);const embedded=await context.newPage();await embedded.goto(vite.resolvedUrls.local[0]);await embedded.locator('.hand button[data-face]').first().waitFor();assert.equal(await embedded.locator('.table').getAttribute('data-room-code'),code);assert.equal(server.rooms.snapshotRooms().length,1);assert.deepEqual(errors,[]);
 console.log('PASS: direct entry, same-seat reload, supplied session, four rail controls, contextual buttons, 38 yaku, deferred records, all meld types, chronological four-player rivers');
}finally{await browser.close();await vite.close();await server.close();}
