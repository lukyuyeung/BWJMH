import {chromium} from 'playwright';import assert from 'node:assert/strict';
const b=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader']});const p=await b.newPage({viewport:{width:848,height:384}});p.setDefaultTimeout(60000);const errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url())});
try{
 await p.goto('http://127.0.0.1:5182');await p.waitForFunction(()=>window.__bunnyQA);await p.evaluate(()=>window.__bunnyQA.pause());await p.waitForSelector('.physical-renderer[data-ready="true"][data-hand-rig="approved-round-paw"]');await p.screenshot({path:'work/qa/visual22-table.png',timeout:60000});
 for(const name of ['mobile-result','result-four-melds','result-kakan','result-closed-kan']){
  await p.evaluate(async name=>{await window.__bunnyQA.scenario(name);window.__bunnyQA.finishCinematic()},name);await p.waitForSelector('.gala-result .result-art-tile');await p.waitForTimeout(150);
  const geometry=await p.locator('.gr-winning-hand').evaluate(e=>{const panel=e.closest('.gr-tile-panel').getBoundingClientRect(),tiles=[...e.querySelectorAll('.result-art-tile')].map(t=>({id:t.dataset.tileId,r:t.getBoundingClientRect().toJSON()}));return{panel:panel.toJSON(),tiles,old:e.querySelectorAll('.phone-meld').length}});
  assert(geometry.tiles.length>=14);assert.equal(new Set(geometry.tiles.map(t=>t.id)).size,geometry.tiles.length);assert.equal(geometry.old,0);
  for(const t of geometry.tiles){assert(t.r.width>12&&t.r.height>12);assert(t.r.left>=geometry.panel.left-1&&t.r.right<=geometry.panel.right+1,'tile outside panel '+name);assert(t.r.top>=geometry.panel.top&&t.r.bottom<=geometry.panel.bottom+2,'vertical overflow '+name)}
  await p.screenshot({path:'work/qa/visual22-'+name+'.png',timeout:60000});
 }
 assert.deepEqual(errors,[]);console.log('VISUAL22 RESULTS PASSED: closed, four melds, added kan, concealed kan; unique tile IDs, bounds, no errors');
}finally{await b.close()}
