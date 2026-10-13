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
 await page.goto(vite.resolvedUrls.local[0]);await page.getByText('你的手牌',{exact:true}).waitFor();assert.equal(await page.getByRole('button',{name:'建立房間',exact:true}).count(),0);
 const code=await page.locator('.table').getAttribute('data-room-code'),room=server.rooms.getRoomForTesting(code),player=room.players.find(p=>!p.isBot);
 assert.equal(room.players.length,4);assert.equal(room.players.filter(p=>p.isBot).length,3);
 const pause=()=>{clearTimeout(server.actionTimers.get(code));server.actionTimers.delete(code);};pause();
 assert.equal(await page.locator('[data-action=pass-claim]').count(),0);assert.equal(await page.locator('.round-counters,.center-winds').count(),0);assert.equal(await page.locator('.wall-count').innerText(),`${room.game.liveWall.length}\n剩餘牌數`);
 const menus=page.locator('.mobile-menus button');assert.deepEqual(await menus.evaluateAll(nodes=>nodes.map(n=>n.getAttribute('aria-label'))),['設定','牌譜','役種','全螢幕']);
 const sort=page.getByRole('button',{name:'自動理牌',exact:true});assert.equal(await sort.getAttribute('aria-pressed'),'true');await sort.click();assert.equal(await sort.getAttribute('aria-pressed'),'false');await sort.click();
 await page.getByRole('button',{name:'略過叫牌',exact:true}).click();assert.equal(await page.getByRole('button',{name:'略過叫牌',exact:true}).innerText(),'不鳴');await page.getByRole('button',{name:'略過叫牌',exact:true}).click();
 await page.getByRole('button',{name:'役種',exact:true}).click();await page.getByRole('heading',{name:'役種 · 和牌指南'}).waitFor();assert.equal(await page.locator('.yaku-guide details').count(),38);await page.getByRole('button',{name:'關閉設定',exact:true}).click();
 await page.getByRole('button',{name:'牌譜',exact:true}).click();await page.getByText('目前未儲存完整牌譜。',{exact:true}).waitFor();await page.getByRole('button',{name:'關閉設定',exact:true}).click();
 const railBounds=await page.locator('.automation-rail').boundingBox(),profileBounds=await page.locator('.scene-pos-3').boundingBox();assert(railBounds&&profileBounds&&profileBounds.x>=railBounds.x+railBounds.width,'left controls must not obscure the opponent profile');
 await page.screenshot({path:out+'/landscape-table.png'});
 for(const [scenario,action,type,count] of [['chi','chi','chi',3],['pon','pon','pon',3],['daiminkan','kan','kan',4],['ankan','ankan','ankan',4],['kakan','kakan','kakan',4]]){
  installScenario(server.rooms,room,scenario);server.broadcastPrivateGameStates(code);pause();const button=page.locator(`[data-action=${action}]:enabled`).first();await button.waitFor();await button.click();
  if(scenario==='kakan'){await page.locator('[data-action=kakan]').waitFor({state:'hidden'});if(room.game.phase==='awaiting_claim'){for(const other of room.players.filter(p=>p.id!==player.id))if(server.rooms.getPlayerGameState(code,other.id).hand.actions.canPassClaim)server.rooms.passClaim(code,other.id);server.broadcastPrivateGameStates(code);}}
  pause();
  const meld=page.locator(`.own-melds .meld[data-type=${type}]`);try{await meld.waitFor();}catch(error){console.log('MELD_DIAGNOSTIC',scenario,room.game.phase,room.game.melds.east.map(m=>({type:m.type,count:m.tiles.length,calledIndex:m.tiles.findIndex(t=>t.id===m.calledTile.id)})),await page.locator('.error').allTextContents(),await page.locator('.own-melds .meld').evaluateAll(nodes=>nodes.map(n=>n.dataset.type)));await page.screenshot({path:out+'/failure.png'});throw error;}assert.equal(await meld.locator('.tile,.tile-back').count(),count);
  if(type==='ankan'){assert.equal(await meld.locator('.tile-back').count(),2);}else{assert.equal(await meld.locator('.sideways').count(),type==='kakan'?2:1);}
  await page.getByRole('button',{name:'牌河 · 正面檢視',exact:true}).click();const dialog=page.getByRole('dialog',{name:'正面牌河'});await dialog.waitFor();assert.equal(await dialog.locator(`.flat-melds .meld[data-type=${type}]`).count(),1);
  await page.screenshot({path:out+`/meld-${type}.png`});await page.getByRole('button',{name:'關閉牌河',exact:true}).click();
 }
 installScenario(server.rooms,room,'exhaustive');server.broadcastPrivateGameStates(code);pause();await page.getByRole('button',{name:'牌河 · 正面檢視',exact:true}).click();
 const rivers=page.locator('.flat-river');for(let i=0;i<4;i++){const seat=['east','south','west','north'][i];assert.deepEqual(await rivers.nth(i).locator('[data-face]').evaluateAll(nodes=>nodes.map(n=>n.dataset.face)),room.game.discards[seat].map(t=>t.face));}
 await page.screenshot({path:out+'/populated-rivers.png'});await page.getByRole('button',{name:'關閉牌河',exact:true}).click();
 await page.reload();await page.getByText('你的手牌',{exact:true}).waitFor();assert.equal(await page.locator('.table').getAttribute('data-room-code'),code);assert.equal(server.rooms.snapshotRooms().length,1);pause();
 const session={code,playerId:player.id,resumeToken:player.resumeToken};await page.close();const context=await browser.newContext({viewport:{width:844,height:390}});await context.addInitScript(value=>{window.bunnyGalaSession=value;},session);const embedded=await context.newPage();await embedded.goto(vite.resolvedUrls.local[0]);await embedded.getByText('你的手牌',{exact:true}).waitFor();assert.equal(await embedded.locator('.table').getAttribute('data-room-code'),code);assert.equal(server.rooms.snapshotRooms().length,1);assert.deepEqual(errors,[]);
 console.log('PASS: direct entry, same-seat reload, supplied session, four rail controls, contextual buttons, 38 yaku, deferred records, all meld types, chronological four-player rivers');
}finally{await browser.close();await vite.close();await server.close();}
