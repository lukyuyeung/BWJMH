import {TABLE_TILE} from '../client/src/table-metrics.ts';
/** Live client visual regression: public face art, stable rivers and front deposits. */
import {chromium} from 'playwright';
import {createServer} from 'vite';
import {createGameServer} from '../server/src/index.ts';
import {installScenario} from '../server/qa/scenarios.ts';
import {mkdirSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const out=process.env.QA_OUTPUT_DIR??'/tmp/bunny-live-tile-art';mkdirSync(out,{recursive:true});
const service=createGameServer();await new Promise(r=>service.httpServer.listen(0,'127.0.0.1',r));
const vite=await createServer({root:'client',server:{host:'127.0.0.1',port:0},define:{'import.meta.env.VITE_SERVER_URL':JSON.stringify(`http://127.0.0.1:${service.httpServer.address().port}`)}});await vite.listen();
const browser=await chromium.launch({headless:true,executablePath:process.env.QA_CHROMIUM_PATH??'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:1902,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 const failedArt=[];page.on('response',r=>{if(r.url().includes('/art/tiles/')&&!r.ok())failedArt.push(r.url());});
 await page.goto(vite.resolvedUrls.local[0]);await page.locator('.hand button[data-face]').first().waitFor();
 const code=await page.locator('.table').getAttribute('data-room-code'),room=service.rooms.getRoomForTesting(code);
 clearTimeout(service.actionTimers.get(code));const register=service.actionTimers.set.bind(service.actionTimers);service.actionTimers.set=(key,timer)=>{clearTimeout(timer);return register(key,timer);};
 installScenario(service.rooms,room,'exhaustive');
 // Redistribute the same physical public tiles to exercise a 24-tile river.
 const seats=['east','south','west','north'],publicTiles=seats.flatMap(s=>room.game.discards[s]);
 room.game.discards.east=publicTiles.splice(0,24);for(const [i,s]of seats.slice(1).entries())room.game.discards[s]=publicTiles.splice(0,Math.ceil(publicTiles.length/(3-i)));
 for(const seat of seats){room.game.discardedFaces[seat]=room.game.discards[seat].map(t=>t.face);Object.assign(room.game.riichi[seat],{declared:true,declarationTileId:room.game.discards[seat][2].id});room.scores[seat]=24000;}
 room.riichiPot=4000;
 service.broadcastPrivateGameStates(code);
 const records=[];
 for(const size of [{width:1902,height:900},{width:844,height:390},{width:667,height:375},{width:915,height:412}]){
  await page.setViewportSize(size);
  await page.waitForFunction(({width,height})=>Number(document.querySelector('.tile-webgl')?.dataset.viewportWidth)===width&&Number(document.querySelector('.tile-webgl')?.dataset.viewportHeight)===height&&document.querySelector('.tile-webgl')?.dataset.tileArt==='lacquer-atlas-v1'&&document.querySelector('.tile-webgl')?.dataset.riichiSticks==='4'&&document.querySelector('.tile-webgl')?.dataset.carrotAnimating==='false'&&document.querySelectorAll('.pos-0 .river .tile[data-table-center]').length===24&&document.querySelectorAll('.river .sideways').length===4,size);
  const data=await page.evaluate(()=>{
   const canvas=document.querySelector('.tile-webgl'),sticks=JSON.parse(canvas.dataset.riichiPositions),hud=document.querySelector('.round-center').getBoundingClientRect();
   return{model:JSON.parse(canvas.dataset.tileModels),art:canvas.dataset.tileArt,contactErrors:canvas.dataset.publicContactErrors,sticks,seats:[0,1,2,3].map(seat=>({seat,first:JSON.parse(document.querySelector(`.pos-${seat} .river .tile`).dataset.tableCenter),faces:[...document.querySelectorAll(`.pos-${seat} .river .tile`)].map(el=>JSON.parse(el.dataset.faceBounds))})),hud:{x:hud.x,y:hud.y,width:hud.width,height:hud.height}};
  });
  assert.deepEqual(data.model,[[TABLE_TILE.width,TABLE_TILE.height,TABLE_TILE.depth]]);assert.equal(data.contactErrors,'0');
  const levels=await page.locator('.wall-stack').evaluateAll(nodes=>nodes.flatMap(n=>{const lower=n.querySelector('.wall-lower'),upper=n.querySelector('.tile-back');return lower?.dataset.tableCenter&&upper?.dataset.tableCenter?[JSON.parse(upper.dataset.tableCenter).z-JSON.parse(lower.dataset.tableCenter).z]:[];}));assert(levels.length>0);assert(levels.every(d=>d===TABLE_TILE.depth),'wall layers must touch');
  for(const stick of data.sticks){const first=data.seats.find(s=>s.seat===stick.seat).first;
   const h=data.hud;
   // Check actual voxel pieces; a single enclosing box includes empty space
   // below elevated leaves and falsely reports an occluded orange tip.
   for(const b of stick.parts){
    if(b.x<h.x+h.width&&b.x+b.width>h.x&&b.y<h.y+h.height&&b.y+b.height>h.y){await page.screenshot({path:`${out}/obstruction.jpg`,quality:97});console.log('HUD-DEPOSIT',JSON.stringify({size,seat:stick.seat,b,h}));throw Error('HUD must not hide a deposit');}
    const blockers=data.seats.flatMap(s=>s.faces).filter(f=>b.x<f.x+f.width&&b.x+b.width>f.x&&b.y<f.y+f.height&&b.y+b.height>f.y);
    if(blockers.length){await page.screenshot({path:`${out}/obstruction.jpg`,quality:97});console.log('DEPOSIT',JSON.stringify({size,seat:stick.seat,bounds:b,blockers}));}
    assert.equal(blockers.length,0,'a deposit must not be hidden by river faces');
   }
   // Include the carrot's width, rather than checking just its pivot point.
   if(stick.seat===0)assert(stick.v+32<first.v-TABLE_TILE.height/2,'own stick must be on center side');
   if(stick.seat===2)assert(stick.v-32>first.v+TABLE_TILE.height/2,'opposite stick must be on center side');
   if(stick.seat===1)assert(stick.u+32<first.u-TABLE_TILE.height/2,'right stick must be on center side');
   if(stick.seat===3)assert(stick.u-32>first.u+TABLE_TILE.height/2,'left stick must be on center side');
  }
  await page.screenshot({path:`${out}/${size.width}x${size.height}.jpg`,quality:97});
  const all=data.seats.flatMap(s=>s.faces);for(const r of all){assert(r.x>=0&&r.y>=0&&r.x+r.width<=size.width&&r.y+r.height<=size.height,'public face clipped');const h=data.hud;assert(!(r.x<h.x+h.width&&r.x+r.width>h.x&&r.y<h.y+h.height&&r.y+r.height>h.y),'HUD covers river');}
  records.push({size,...data});
 }
 // Removing a trailing row must not move any of the first six public tiles.
 const before=await page.locator('.pos-0 .river .tile').first().getAttribute('data-table-center');
 const removed=room.game.discards.east.splice(18);room.game.liveWall.push(...removed);service.broadcastPrivateGameStates(code);
 await page.waitForFunction(()=>document.querySelectorAll('.pos-0 .river .tile').length===18);
 assert.equal(await page.locator('.pos-0 .river .tile').first().getAttribute('data-table-center'),before,'first river row shifted');
 // Gallery is rendered by the live game's shared Face component, not a separate art mockup.
 await page.getByRole('button',{name:'役種',exact:true}).click();await page.locator('.yaku-guide').waitFor();
 assert.equal(await page.locator('.yaku-guide .tile-face-art').count(),await page.locator('.yaku-guide [data-face]').count());
 await page.screenshot({path:`${out}/live-yaku-art.jpg`,quality:97});
 await page.getByRole('button',{name:'關閉設定',exact:true}).click();installScenario(service.rooms,room,'mobile-result');service.broadcastPrivateGameStates(code);await page.locator('.bg-winning-hand').waitFor();assert.equal(await page.locator('.bg-winning-hand .tile-face-art').count(),await page.locator('.bg-winning-hand [data-face]').count());await page.screenshot({path:`${out}/live-result-art.jpg`,quality:97});
 assert.deepEqual(failedArt,[]);assert.deepEqual(errors,[]);writeFileSync(out+'/checks.json',JSON.stringify(records,null,2)+'\n');
 console.log('PASS: live artwork, four front riichi deposits, 24-tile river, stable first row, four viewport sizes, clear HUD, shared yaku faces.');
}finally{await browser.close();await vite.close();await service.close();}
