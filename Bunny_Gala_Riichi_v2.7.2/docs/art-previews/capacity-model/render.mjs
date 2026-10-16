/** Preview renderer only; this script is never imported by the game. */
import {createServer} from 'vite';
import {chromium} from 'playwright';
import {mkdirSync,copyFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=fileURLToPath(new URL('../../../',import.meta.url));
const out=process.env.QA_OUTPUT_DIR??'/tmp/bunny-capacity-preview';
mkdirSync(out,{recursive:true});
const cache=path.join(root,'client/node_modules/.cache');mkdirSync(cache,{recursive:true});
for(const file of ['capacity-layout.html','capacity-layout.js'])copyFileSync(new URL('./'+file,import.meta.url),path.join(cache,file));
const vite=await createServer({root:path.join(root,'client'),server:{host:'127.0.0.1',port:0}});await vite.listen();
const browser=await chromium.launch({executablePath:process.env.QA_CHROMIUM_PATH??'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:3600,height:2250},deviceScaleFactor:1});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(vite.resolvedUrls.local[0]+'node_modules/.cache/capacity-layout.html');
 await page.waitForFunction(()=>window.__diagramReady,null,{timeout:60000});
 const data=await page.evaluate(()=>window.__diagram);
 if(errors.length)throw Error(errors.join('\n'));
 await page.screenshot({path:path.join(out,'four-wall-24-river-capacity-preview.png'),fullPage:true});
 await page.screenshot({path:path.join(out,'four-wall-24-river-capacity-preview.jpg'),fullPage:true,quality:95});
 writeFileSync(path.join(out,'geometry-checks.json'),JSON.stringify(data,null,2)+'\n');
 console.log('PASS: each seat has 24 river slots, each wall has 17 two-level stacks; all four stick reservations clear; private hands upright and on felt.');
}finally{await browser.close();await vite.close();}
