import {chromium} from 'playwright';
import {preview} from 'vite';
import {createGameServer} from '../server/dist/index.js';
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
const out=process.env.QA_OUTPUT_DIR??'docs/qa-v271/production';mkdirSync(out,{recursive:true});
const server=createGameServer();await new Promise(r=>server.httpServer.listen(3001,'127.0.0.1',r));
const app=await preview({root:'client',preview:{host:'127.0.0.1',port:4173,strictPort:true}});
const browser=await chromium.launch({headless:true,...(process.env.QA_CHROMIUM_PATH?{executablePath:process.env.QA_CHROMIUM_PATH}:{}),args:['--no-sandbox','--disable-dev-shm-usage','--no-zygote','--use-gl=angle','--use-angle=swiftshader']});
const errors=[];const page=await browser.newPage({viewport:{width:1920,height:1080}});page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});page.setDefaultTimeout(60000);
try{
 assert.equal((await fetch('http://127.0.0.1:3001/health')).status,200);
 await page.goto('http://127.0.0.1:4173');await page.getByLabel('玩家名稱').fill('Production Solo');
 for(const name of ['建立房間','加入機械人','準備','開始遊戲'])await page.getByRole('button',{name,exact:true}).click();
 await page.getByText('你的手牌',{exact:true}).waitFor();await page.waitForFunction(()=>document.querySelector('.tile-webgl')?.dataset.uprightErrors==='0');
 const code=await page.locator('.room-pill').first().innerText();const room=server.rooms.getRoomForTesting(code.match(/[A-Z2-9]{6}/)[0]);
 assert(room);assert.equal(room.players.filter(p=>p.isBot).length,3);
 assert.equal(await page.locator('.qa-scenario').count(),0);
 await page.screenshot({path:out+'/production-desktop.png'});
 const turn=room.game.turnNumber;await page.locator('.hand button:enabled').last().click();
 await page.waitForFunction(()=>document.querySelector('.hand button:enabled'));
 const end=Date.now()+25000;while(room.game.turnNumber<=turn+1&&Date.now()<end)await new Promise(r=>setTimeout(r,100));
 assert(room.game.turnNumber>turn+1,'Bots must advance real turn order');
 await page.setViewportSize({width:844,height:390});await page.waitForFunction(()=>{const root=document.querySelector('.scene-canvas'),canvas=document.querySelector('.tile-webgl'),hand=document.querySelector('.hand')?.getBoundingClientRect();return document.documentElement.scrollHeight<=innerHeight&&root?.classList.contains('webgl-ready')&&Math.abs(Number(canvas?.dataset.tableScale)-Number(getComputedStyle(root).getPropertyValue('--table-scale')))<.001&&hand&&Math.abs(Number(canvas?.dataset.handTop)-hand.top)<1&&hand.top>=0&&hand.bottom<=innerHeight;});
 await page.screenshot({path:out+'/production-mobile.png'});
 assert.equal((await page.request.get('http://127.0.0.1:4173/cinematics/chinitsu.mp4')).status(),200);
 assert.deepEqual(errors,[]);const report={ok:true,compiledServer:true,compiledClient:true,soloBots:3,turnBefore:turn,turnAfter:room.game.turnNumber,productionQaUiAbsent:true,viewport:[1920,1080,844,390],errors};writeFileSync(out+'/production-runtime.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
}finally{await browser.close();await new Promise(r=>app.httpServer.close(r));await server.close();}
