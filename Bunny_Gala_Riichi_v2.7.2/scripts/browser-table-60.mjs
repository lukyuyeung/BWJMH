/** Real-client visual proof: true camera, four opposite melds behind a full wall. */
import {chromium} from 'playwright';
import {createServer} from 'vite';
import {createGameServer} from '../server/src/index.ts';
import {installScenario,assertPhysical} from '../server/qa/scenarios.ts';
import {PerspectiveCamera,Vector3} from 'three';
import {feltScreenPoint} from '../client/src/felt-projection.ts';
import {TABLE_SIZE,TABLE_VIEW} from '../client/src/table-metrics.ts';
import {mkdirSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
// Compare the production CSS projection against an independent Three.js camera.
for(const height of [727,710,864]){
 const c=TABLE_SIZE/2,cam=new PerspectiveCamera(TABLE_VIEW.verticalFov,1536/height,1,20000);cam.up.set(0,0,1);
 cam.position.set(c,-c-TABLE_VIEW.distance*Math.cos(TABLE_VIEW.elevation),TABLE_VIEW.distance*Math.sin(TABLE_VIEW.elevation));cam.lookAt(c,-c,0);cam.updateMatrixWorld(true);
 for(const [u,v,z]of [[0,0,0],[TABLE_SIZE,0,0],[TABLE_SIZE,TABLE_SIZE,0],[0,TABLE_SIZE,0],[c,c,136]]){
  const expected=new Vector3(u,-v,z).project(cam),actual=feltScreenPoint(u,v,z,height);
  assert(Math.abs(actual.x-(expected.x+1)*1536/2)<1e-8&&Math.abs(actual.y-(1-expected.y)*height/2)<1e-8,'shared projection must equal a real 60 degree pinhole camera');
 }
}
const out=process.env.QA_OUTPUT_DIR??'/tmp/bunny-table-60';mkdirSync(out,{recursive:true});
const service=createGameServer();await new Promise(r=>service.httpServer.listen(0,'127.0.0.1',r));
const vite=await createServer({root:'client',server:{host:'127.0.0.1',port:0},define:{'import.meta.env.VITE_SERVER_URL':JSON.stringify(`http://127.0.0.1:${service.httpServer.address().port}`)}});await vite.listen();
const browser=await chromium.launch({headless:true,executablePath:'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:1902,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(vite.resolvedUrls.local[0]+'?inspectTable=1');await page.locator('.hand button[data-face]').first().waitFor();
 const code=await page.locator('.table').getAttribute('data-room-code'),room=service.rooms.getRoomForTesting(code);
 clearTimeout(service.actionTimers.get(code));const register=service.actionTimers.set.bind(service.actionTimers);service.actionTimers.set=(key,timer)=>{clearTimeout(timer);return register(key,timer);};
 const records=[];
 for(const scenario of ['initial','four-melds']){
  if(scenario==='four-melds'){installScenario(service.rooms,room,'four-melds');assertPhysical(room);service.broadcastPrivateGameStates(code);}
  for(const size of [{width:1902,height:900},{width:844,height:390},{width:667,height:375}]){
   await page.setViewportSize(size);
   await page.waitForFunction(({size,four})=>{const c=document.querySelector('.tile-webgl');return c?.dataset.cameraElevation==='60'&&Number(c.dataset.viewportWidth)===size.width&&Number(c.dataset.viewportHeight)===size.height&&c.dataset.actors3d==='3'&&(!four||JSON.parse(c.dataset.meldVisibility??'{}').checked>=12);},{size,four:scenario==='four-melds'});
   await page.screenshot({path:`${out}/${scenario}-${size.width}x${size.height}.jpg`,quality:97});
   const data=await page.evaluate(()=>{
    const c=document.querySelector('.tile-webgl'),r=el=>{const b=el.getBoundingClientRect();return{x:b.x,y:b.y,width:b.width,height:b.height};};
    return{elevation:c.dataset.cameraElevation,type:c.dataset.cameraType,contact:c.dataset.contactErrors,publicContact:c.dataset.publicContactErrors,gold:c.dataset.goldSeam,riichi:c.dataset.riichiMaterial,models:JSON.parse(c.dataset.tileModels),meldVisibility:JSON.parse(c.dataset.meldVisibility??'{}'),melds:[...document.querySelectorAll('.pos-2 .meld')].map(m=>({type:m.dataset.type,faces:[...m.querySelectorAll('[data-face]')].map(t=>({face:t.dataset.face,center:JSON.parse(t.dataset.tableCenter),samples:Number(t.dataset.visibleSamples),blockers:t.dataset.faceBlockers,bounds:JSON.parse(t.dataset.faceBounds)}))})),oppositeWall:document.querySelectorAll('.wall-pos-2 .tile-back,.wall-pos-2 .wall-lower,.wall-pos-2 .wall-indicator').length,hud:[...document.querySelectorAll('.scene-profile,.scene-own-profile,.dora,.round-center,.scene-nav,.scene-actions')].map(r),dora:[...document.querySelectorAll('.dora .tile,.dora .tile-back')].map(r)};
   });
   writeFileSync(out+'/latest-diagnostics.json',JSON.stringify({scenario,size,...data},null,2));
   assert.equal(data.contact,'0');assert.equal(data.publicContact,'0');assert.equal(data.type,'true-perspective');
   assert(data.dora.every(r=>Math.abs(r.width/r.height-100/136)<.015),'HUD face and back slots must share real tile ratio');
   if(scenario==='four-melds'){
    assert.equal(data.melds.length,4);assert.equal(data.oppositeWall,34,'fixture must retain a complete opposite wall');
    for(const meld of data.melds)for(const face of meld.faces){assert.equal(face.samples,9,`opposite ${meld.type} ${face.face} occluded by ${face.blockers}`);const r=face.bounds;assert(r.x>=0&&r.y>=0&&r.x+r.width<=size.width&&r.y+r.height<=size.height);assert(data.hud.every(h=>!(r.x<h.x+h.width&&r.x+r.width>h.x&&r.y<h.y+h.height&&r.y+r.height>h.y)),`HUD covers ${meld.type} ${face.face}`);}
    assert.equal(await page.locator('.pos-2 .concealed [data-face]').count(),0,'never invent opponent faces');
   }
   records.push({scenario,size,...data});
  }
 }
 // The same four groups also need to fit beside local and side concealed racks.
 for(const [target,relative]of [['south',1],['north',3],['east',0]]){
  installScenario(service.rooms,room,'four-melds');const g=room.game,seats=['east','south','west','north'],delta=(seats.indexOf(target)-2+4)%4;
  [g.hands[target],g.hands.west]=[g.hands.west,g.hands[target]];[g.melds[target],g.melds.west]=[g.melds.west,g.melds[target]];
  for(const meld of g.melds[target])meld.from=seats[(seats.indexOf(meld.from)+delta)%4];
  g.currentSeat=target;g.lastDrawSeat=target;
  const ids=g.physicalWall.tileIds,start=seats.indexOf(target)*34;
  for(let i=0;i<34;i++)[ids[start+i],ids[68+i]]=[ids[68+i],ids[start+i]];
  assertPhysical(room);service.broadcastPrivateGameStates(code);await page.setViewportSize({width:844,height:390});
  const selector=relative===0?'.own-melds':`.pos-${relative} .melds`;
  await page.waitForFunction(selector=>{const nodes=[...document.querySelectorAll(selector+' [data-face]')];return nodes.length===12&&nodes.every(n=>n.dataset.visibleSamples==='9');},selector);
  const bounds=await page.locator(selector+' [data-face]').evaluateAll(nodes=>nodes.map(n=>JSON.parse(n.dataset.faceBounds)));assert(bounds.every(r=>r.x>=0&&r.y>=0&&r.x+r.width<=844&&r.y+r.height<=390),'four side/local groups clipped');
  await page.screenshot({path:`${out}/four-melds-seat-${relative}-844x390.jpg`,quality:97});records.push({scenario:'four-melds-seat-'+relative,size:{width:844,height:390},visibleFaceSamples:bounds.length*9});
 }
 assert.deepEqual(errors,[]);writeFileSync(out+'/checks.json',JSON.stringify({view:TABLE_VIEW,tableSize:TABLE_SIZE,records},null,2)+'\n');
 console.log('PASS: real 60° camera, seated actors, matching HUD ratios, full opposite wall and four exposed melds visible at all 9 face samples on desktop and two phones.');
}finally{await browser.close();await vite.close();await service.close();}
