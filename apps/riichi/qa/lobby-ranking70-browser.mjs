import {chromium} from 'playwright';import assert from 'node:assert/strict';
const b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
try{
 const p=await b.newPage({viewport:{width:1125,height:634}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://127.0.0.1:5195/design/lobby/index.html');await p.getByRole('button',{name:'大廳聲音設定'}).click();
 const close=p.locator('dialog[aria-label="大廳聲音設定"] .audio-close');await close.waitFor();
 const colors=await close.evaluate(e=>{const s=getComputedStyle(e);return {fg:s.color,bg:s.backgroundColor,h:e.getBoundingClientRect().height}});
 const luminance=rgb=>{const c=rgb.match(/[\d.]+/g).slice(0,3).map(Number).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4});return c[0]*.2126+c[1]*.7152+c[2]*.0722};
 const a=luminance(colors.fg),z=luminance(colors.bg),contrast=(Math.max(a,z)+.05)/(Math.min(a,z)+.05);assert(contrast>=4.5);assert(colors.h>=44);await p.screenshot({path:'/workspace/work/lobby-audio70.png'});await close.click();assert.equal(await p.locator('dialog[aria-label="大廳聲音設定"]').evaluate(e=>e.open),false);
 await p.setViewportSize({width:844,height:390});await p.getByRole('button',{name:'大廳聲音設定'}).click();await close.scrollIntoViewIfNeeded();await close.click();console.log('PASS lobby close text/background contrast',contrast.toFixed(1), 'desktop and mobile close');
 await p.addInitScript(()=>{const o=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(t,...a){return /webgl/.test(t)?null:o.call(this,t,...a)}});await p.setViewportSize({width:1125,height:634});await p.goto('http://127.0.0.1:5195/?mode=bot');await p.locator('#startup-curtain').waitFor({state:'detached',timeout:60000});await p.evaluate(()=>window.__bunnyQA.pause());
 for(const role of ['yellow','king','ninja','wizard']){await p.getByRole('button',{name:'和牌演出 Demo',exact:true}).click();await p.locator('[data-demo-character='+role+']').click();await p.locator('[data-demo="final-ranking"]').click();await p.locator('.final-ranking-screen').waitFor();assert.equal(await p.locator('.fr-your-result').count(),0);assert.equal(await p.locator('.fr-net').count(),4);await p.locator('.fr-character').evaluate(im=>im.decode());await p.screenshot({path:'/workspace/work/ranking70-'+role+'.png'});await p.locator('[data-action=restart-match]').click();}
 assert.deepEqual(errors,[]);console.log('PASS actual rankings for all 4 characters without duplicated carrot panel');
}finally{await b.close()}
