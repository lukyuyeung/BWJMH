/** Standalone art review renderer. Not imported by the game. */
import {createServer} from 'vite';
import {chromium} from 'playwright';
import {mkdirSync,copyFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=fileURLToPath(new URL('../../../../',import.meta.url));
const out=process.env.QA_OUTPUT_DIR??'/tmp/bunny-table-design-v2';
mkdirSync(out,{recursive:true});
const cache=path.join(root,'client/node_modules/.cache/table-design-v2');mkdirSync(cache,{recursive:true});
for(const f of ['preview.html','preview.js'])copyFileSync(new URL('./'+f,import.meta.url),path.join(cache,f));
copyFileSync(new URL('../peacock-1s-emblem.png',import.meta.url),path.join(cache,'peacock-1s-emblem.png'));
const vite=await createServer({root:path.join(root,'client'),server:{host:'127.0.0.1',port:0}});await vite.listen();
const browser=await chromium.launch({executablePath:process.env.QA_CHROMIUM_PATH??'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:3600,height:2350},deviceScaleFactor:1});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(vite.resolvedUrls.local[0]+'node_modules/.cache/table-design-v2/preview.html');
 await page.waitForFunction(()=>window.__diagramReady,null,{timeout:90000});
 if(errors.length)throw Error(errors.join('\n'));
 const data=await page.evaluate(()=>window.__diagram);
 await page.screenshot({path:path.join(out,'table-complete-preview.jpg'),fullPage:true,quality:97});
 await page.evaluate(()=>document.body.classList.add('gallery'));
 await page.locator('#gallery').screenshot({path:path.join(out,'all-37-tiles-preview.jpg'),quality:97});
 await page.evaluate(()=>document.body.classList.remove('gallery'));
 await page.locator('#material').screenshot({path:path.join(out,'peacock-and-material-preview.png')});
 writeFileSync(path.join(out,'geometry-checks.json'),JSON.stringify(data,null,2)+'\n');
 console.log(JSON.stringify(data,null,2));
}finally{await browser.close();await vite.close();}
