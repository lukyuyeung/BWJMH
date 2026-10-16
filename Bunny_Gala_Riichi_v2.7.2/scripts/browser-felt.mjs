import {feltScreenPoint} from '../client/src/felt-projection.ts';
import {TABLE_SIZE,TABLE_TILE} from '../client/src/table-metrics.ts';
import {chromium} from 'playwright';
import {createServer} from 'vite';
import {createGameServer} from '../server/src/index.ts';
import {installScenario} from '../server/qa/scenarios.ts';
import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
const out=process.env.QA_OUTPUT_DIR??'/tmp/bunny-felt-qa';mkdirSync(out,{recursive:true});
const server=createGameServer();await new Promise(r=>server.httpServer.listen(0,'127.0.0.1',r));
const vite=await createServer({root:'client',server:{host:'127.0.0.1',port:0},define:{'import.meta.env.VITE_SERVER_URL':JSON.stringify(`http://127.0.0.1:${server.httpServer.address().port}`)}});await vite.listen();
const browser=await chromium.launch({headless:true,executablePath:process.env.QA_CHROMIUM_PATH??'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader']});
try{
 const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(vite.resolvedUrls.local[0]);await page.locator('.hand button[data-face]').first().waitFor();
 const code=await page.locator('.table').getAttribute('data-room-code'),room=server.rooms.getRoomForTesting(code);
 const timer=server.actionTimers.get(code);clearTimeout(timer);server.actionTimers.delete(code);
 installScenario(server.rooms,room,'exhaustive');server.broadcastPrivateGameStates(code);clearTimeout(server.actionTimers.get(code));server.actionTimers.delete(code);
 for(const size of [{width:1902,height:900},{width:844,height:390},{width:915,height:412}]){
  await page.setViewportSize(size);
  await page.waitForFunction(()=>Array.from(document.querySelectorAll('.board .river .tile')).length>50&&Array.from(document.querySelectorAll('.board .river .tile')).every(n=>n.dataset.faceBounds)&&document.querySelector('.scene-canvas').classList.contains('webgl-ready')&&document.querySelector('.tile-webgl').dataset.actors3d==='3');
  await page.screenshot({path:`${out}/${size.width}x${size.height}.png`});
  const faces=await page.locator('.board .river .tile').evaluateAll(nodes=>nodes.map(n=>JSON.parse(n.dataset.faceBounds)));
  assert(faces.every(r=>r.x>=0&&r.y>=0&&r.x+r.width<=size.width&&r.y+r.height<=size.height),'public tiles must be onscreen');
  const scale=size.width/1536,height=size.height/scale;
  const corners=[[0,0],[TABLE_SIZE,0],[TABLE_SIZE,TABLE_SIZE],[0,TABLE_SIZE]].map(([u,v])=>{const p=feltScreenPoint(u,v,0,height);return{x:p.x*scale,y:p.y*scale};});
  for(const face of faces){const x=face.x+face.width/2,y=face.y+face.height/2;assert(corners.every((p,i)=>{const q=corners[(i+1)%4];return(q.x-p.x)*(y-p.y)-(q.y-p.y)*(x-p.x)>=0;}),'public tile centers must sit inside the calibrated felt');}

  const dealer=(room.handMatch??room.match).dealer;const seats=['east','south','west','north'];const self=room.players.find(p=>!p.isBot).seat;const wind=['東','南','西','北'][(seats.indexOf(self)-seats.indexOf(dealer)+4)%4];assert.equal(await page.locator('.seat-wind').innerText(),'自風 '+wind);
  assert.deepEqual(JSON.parse(await page.locator('.tile-webgl').getAttribute('data-tile-models')),[[TABLE_TILE.width,TABLE_TILE.height,TABLE_TILE.depth]]);assert.equal(await page.locator('.tile-webgl').getAttribute('data-camera-count'),'1');assert.equal(await page.locator('.tile-webgl').getAttribute('data-camera-type'),'true-perspective');assert((await page.locator('.table-backdrop').evaluate(el=>getComputedStyle(el).backgroundImage)).includes('gala-table-60-empty.png'),'new view of the original ornate table must be active');
  const handRect=await page.locator('.hand .tile:not(.mini)').first().boundingBox();assert(handRect.width>0&&handRect.height>0,'grounded private tiles must retain usable controls');
  const hud=await page.locator('.round-center').boundingBox();assert(faces.every(r=>!(r.x<hud.x+hud.width&&r.x+r.width>hud.x&&r.y<hud.y+hud.height&&r.y+r.height>hud.y)),'center cannot cover river faces');
  assert.equal(await page.locator('.play-controls>.hint:visible').count(),0);
  assert.equal(await page.locator('.tile-webgl').getAttribute('data-upright-errors'),'0');
  assert.equal(await page.locator('.tile-webgl').getAttribute('data-contact-errors'),'0');
  assert.equal(await page.locator('.tile-webgl').getAttribute('data-public-contact-errors'),'0','flat public tile bodies must touch the felt');
  console.log(size, 'smallest face',Math.min(...faces.map(r=>r.width)),Math.min(...faces.map(r=>r.height)));
 }
 assert.deepEqual(errors,[]);console.log('PASS: populated live rivers, full desktop and phone screens, grounded upright tiles, unobscured center, no debug bar');
}finally{await browser.close();await vite.close();await server.close();}
