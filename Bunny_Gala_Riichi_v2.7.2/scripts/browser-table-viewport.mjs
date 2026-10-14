import {chromium} from 'playwright';
import {createServer} from 'vite';
import {createGameServer} from '../server/src/index.ts';
import {installScenario} from '../server/qa/scenarios.ts';
import {mkdirSync} from 'node:fs';
import assert from 'node:assert/strict';
const out=process.env.QA_OUTPUT_DIR??'/tmp/bunny-table-viewport';mkdirSync(out,{recursive:true});
const service=createGameServer();await new Promise(r=>service.httpServer.listen(0,'127.0.0.1',r));const vite=await createServer({root:'client',server:{host:'127.0.0.1',port:0},define:{'import.meta.env.VITE_SERVER_URL':JSON.stringify(`http://127.0.0.1:${service.httpServer.address().port}`)}});await vite.listen();
const browser=await chromium.launch({headless:true,executablePath:process.env.QA_CHROMIUM_PATH??'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader']});
try{const page=await browser.newPage({hasTouch:true});await page.goto(vite.resolvedUrls.local[0]);await page.locator('.hand button[data-face]').first().waitFor();const code=await page.locator('.table').getAttribute('data-room-code'),room=service.rooms.getRoomForTesting(code);clearTimeout(service.actionTimers.get(code));const add=service.actionTimers.set.bind(service.actionTimers);service.actionTimers.set=(k,t)=>{clearTimeout(t);return add(k,t);};
 for(const size of [{width:844,height:390},{width:667,height:375},{width:915,height:412},{width:932,height:430}]){await page.setViewportSize(size);installScenario(service.rooms,room,'exhaustive');service.broadcastPrivateGameStates(code);await page.waitForFunction(()=>document.querySelector('.tile-webgl')?.dataset.actors3d==='3'&&document.querySelector('.scene-canvas').classList.contains('webgl-ready'));await page.screenshot({path:out+`/${size.width}x${size.height}.png`});
 const faces=await page.locator('.board .river .tile').evaluateAll(nodes=>nodes.map(n=>JSON.parse(n.dataset.faceBounds)));assert(faces.every(r=>r.x>=0&&r.y>=0&&r.x+r.width<=size.width&&r.y+r.height<=size.height),'all river faces must fit');assert.equal(await page.locator('.tile-webgl').getAttribute('data-contact-errors'),'0');assert.equal(await page.locator('.tile-webgl').getAttribute('data-public-contact-errors'),'0');assert.equal(await page.locator('.tile-webgl').getAttribute('data-table-geometry'),'opaque-3d');
 installScenario(service.rooms,room,'riichi');service.broadcastPrivateGameStates(code);const action=page.locator('[data-action=riichi-select]');await action.waitFor();const b=await action.boundingBox();assert(b.height>=43.9&&b.y+b.height<=size.height+1);assert.equal(await page.locator('[data-action=discard-confirm]').count(),0);
 }
 console.log('PASS: four phone landscape sizes, visible river faces, grounded hands, real table geometry, 44px contextual controls, single tap flow');
}finally{await browser.close();await vite.close();await service.close();}
