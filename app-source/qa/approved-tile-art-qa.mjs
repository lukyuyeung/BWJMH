import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const b=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader']});
const p=await b.newPage({viewport:{width:1125,height:634}});p.setDefaultTimeout(60000);const errors=[],old=[];
p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());if(r.url().includes('/game-art/faces/'))old.push(r.url())});
try{
 await p.goto('http://127.0.0.1:5182');await p.waitForFunction(()=>window.__bunnyQA);await p.evaluate(()=>window.__bunnyQA.pause());
 await p.waitForSelector('.physical-renderer[data-tile-art="approved-atlases"]');
 const report=await p.evaluate(async()=>{const {approvedTileFaces,tileFaceUrl}=await import('/src/approved-tile-art.ts');const urls=[...approvedTileFaces.map(f=>tileFaceUrl(f)),...['5m','5p','5s'].map(f=>tileFaceUrl(f,true))];await Promise.all(urls.map(async url=>{const i=new Image();i.src=url;await i.decode();if(i.width!==352||i.height!==480)throw Error(url)}));return{loaded:urls.length,dom:[...document.querySelectorAll('.phone-tile:not(.phone-back) img')].every(i=>i.getAttribute('src').startsWith('/art/tiles/complete/'))}});
 assert.equal(report.loaded,37);assert(report.dom);await p.screenshot({path:'work/qa/approved-tile-table.png',timeout:60000});
 await p.evaluate(()=>window.__bunnyQA.scenario('meld-layout'));await p.waitForTimeout(500);assert(await p.locator('.phone-meld img[src^="/art/tiles/complete/"]').count()>0);
 await p.evaluate(()=>{window.__bunnyQA.scenario('mobile-result');window.__bunnyQA.finishCinematic()});await p.waitForSelector('.gala-result');assert(await p.locator('.gala-result .phone-tile img[src^="/art/tiles/complete/"]').count()>0);
 await p.screenshot({path:'work/qa/approved-tile-results.png',timeout:60000});assert.deepEqual(errors,[]);assert.deepEqual(old,[]);console.log(JSON.stringify({...report,melds:true,results:true,noOldArtRequests:true,errors}));
}finally{await b.close()}
