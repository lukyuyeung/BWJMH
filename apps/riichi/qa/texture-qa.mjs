import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
const browser=await chromium.launch({headless:true,executablePath:process.env.QA_CHROMIUM_PATH??'/usr/bin/chromium',args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader']});
const page=await browser.newPage({viewport:{width:1125,height:634},deviceScaleFactor:1}),errors=[];page.on('pageerror',e=>errors.push(e.message));
try{
 await page.goto('http://127.0.0.1:5182',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.__bunnyQA);await page.evaluate(()=>window.__bunnyQA.pause());await page.waitForSelector('.physical-renderer[data-ready=true]',{timeout:60000});
 await page.evaluate(()=>window.__bunnyQA.scenario('riichi'));await page.waitForTimeout(350);
 const rects=await page.locator('.phone-hand-tiles>button').evaluateAll(elements=>elements.map(e=>{const r=e.getBoundingClientRect(),t=e.querySelector('.phone-tile');return{face:t.dataset.face,red:t.dataset.red==='true',x:r.x,y:r.y,width:r.width,height:r.height}}).filter(r=>!r.red&&(r.face.endsWith('m')||['E','S','W','N','F'].includes(r.face))));
 const screenshot=await page.screenshot();
 const results=await page.evaluate(async({rects,screen})=>{
  const load=async src=>{const i=new Image();i.src=src;await i.decode();return i};
  const capture=await load(screen),results=[];
  const ink=(data,i)=>{const [r,g,b]=[data[i],data[i+1],data[i+2]];return Math.max(r,g,b)<155||r>g*1.2&&r>b*1.15||g>r*1.12&&Math.max(r,g,b)<190?1:0};
  for(const rect of rects){
   const original=await load('/gala-v9/game-art/faces/'+rect.face+'.png'),w=Math.round(rect.width-2),h=Math.round(rect.height-2),actual=document.createElement('canvas'),reference=document.createElement('canvas');actual.width=reference.width=w;actual.height=reference.height=h;
   actual.getContext('2d').drawImage(capture,rect.x+1,rect.y+1,w,h,0,0,w,h);reference.getContext('2d').drawImage(original,0,0,w,h);
   const a=actual.getContext('2d').getImageData(0,0,w,h).data,b=reference.getContext('2d').getImageData(0,0,w,h).data;
   function score(mirror){let best=1;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){let bad=0,count=0;for(let y=5;y<h-5;y++)for(let x=5;x<w-5;x++){const xx=mirror?w-1-x:x;bad+=Math.abs(ink(a,((y+dy)*w+x+dx)*4)-ink(b,(y*w+xx)*4));count++}best=Math.min(best,bad/count)}return best}
   results.push({face:rect.face,normal:score(false),mirrored:score(true)});
  }
  return results;
 },{rects,screen:'data:image/png;base64,'+screenshot.toString('base64')});
 console.log(JSON.stringify(results));
 const normal=results.reduce((n,r)=>n+r.normal,0)/results.length,mirrored=results.reduce((n,r)=>n+r.mirrored,0)/results.length;
 mkdirSync('work/qa',{recursive:true});writeFileSync('work/qa/texture-report.json',JSON.stringify({ok:normal<mirrored*.7,normal,mirrored,results,errors},null,2));writeFileSync('work/qa/tile-orientation.png',screenshot);
 assert(normal<mirrored*.7,'rendered glyphs must match the original artwork better than its mirror image');assert.deepEqual(errors,[]);console.log('TILE ORIENTATION PASSED');
}finally{await browser.close()}
