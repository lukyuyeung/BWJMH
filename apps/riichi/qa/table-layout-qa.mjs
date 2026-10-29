import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
mkdirSync('work/qa',{recursive:true});
const b=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader']});
const p=await b.newPage({viewport:{width:1125,height:634}});p.setDefaultTimeout(120000);const errors=[],report=[];p.on('pageerror',e=>errors.push(e.message));
try{
 await p.goto('http://127.0.0.1:5182');await p.waitForFunction(()=>window.__bunnyQA);await p.evaluate(()=>window.__bunnyQA.pause());await p.waitForSelector('.physical-renderer[data-ready=true]');
 for(const name of ['table-layout','exhaustive','pon']){
  await p.evaluate(async n=>window.__bunnyQA.scenario(n),name);
  if(name==='pon')await p.locator('[data-action=pon]').click();
  const expected=await p.evaluate(()=>window.__bunnyQA.snapshot().hand.wallSlots.filter(t=>t.occupied).length);
  await p.waitForFunction(()=>document.querySelector('.physical-renderer').dataset.wallTiles==='0');
  await p.waitForTimeout(500);
  const geometry=await p.locator('.physical-renderer').evaluate(e=>JSON.parse(e.dataset.layout));
  assert.equal(geometry.filter(t=>t.kind==='wall').length,0,'physical walls removed from presentation');assert.equal(await p.locator('.physical-renderer').getAttribute('data-wall-tiles'),'0');
  assert(geometry.every(t=>t.insideFelt),'wall, concealed and discard geometry lies on felt');
  const panel=await p.locator('.phone-round').boundingBox();
  const overlaps=geometry.filter(t=>t.kind==='river'&&t.right>panel.x-3&&t.left<panel.x+panel.width+3&&t.bottom>panel.y-3&&t.top<panel.y+panel.height+3);
  assert.equal(overlaps.length,0,'center display never covers a discard');
  await p.screenshot({path:`work/qa/table-fixed-${name}.png`,timeout:120000});
  report.push({name,wallTiles:0,engineWallTiles:expected,riverTiles:geometry.filter(t=>t.kind==='river').length,centralOverlap:overlaps.length});
 }
 await p.setViewportSize({width:848,height:384});await p.waitForTimeout(1000);await p.screenshot({path:'work/qa/table-fixed-wide.png',timeout:120000});
 const hand=await p.locator('.phone-hand').boundingBox();assert(hand.y+hand.height<=387,'hand stays in viewport');
 assert.deepEqual(errors,[]);writeFileSync('work/qa/table-layout-report.json',JSON.stringify({report,errors},null,2));console.log('TABLE LAYOUT PASSED',JSON.stringify(report));
}finally{await b.close()}
