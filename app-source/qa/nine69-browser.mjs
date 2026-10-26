import {chromium} from 'playwright';import assert from 'node:assert/strict';
const b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
try{
 const p=await b.newPage({viewport:{width:1125,height:634}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.addInitScript(()=>{const orig=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(t,...a){return /webgl/.test(t)?null:orig.call(this,t,...a)}});
 await p.goto('http://127.0.0.1:5195/?mode=bot');await p.locator('#startup-curtain').waitFor({state:'detached',timeout:60000});await p.evaluate(()=>window.__bunnyQA.pause());
 await p.evaluate(()=>{window.calls69=[];window.BunnyAudio.voices=(role,events,scope)=>window.calls69.push({role,events,scope});});
 await p.evaluate(()=>window.__bunnyQA.scenario('nine-terminals'));
 const btn=p.getByRole('button',{name:'九種九牌',exact:true});await btn.waitFor();await btn.locator('img').evaluate(im=>im.decode());
 assert.match(await btn.locator('img').getAttribute('src'),/nine-terminals.png/);assert.equal(await btn.evaluate(e=>getComputedStyle(e).backgroundImage),'none');assert.equal(await btn.evaluate(e=>getComputedStyle(e).borderTopWidth),'0px');
 await p.screenshot({path:'/workspace/work/nine69-button.png'});await btn.click();
 await p.waitForFunction(()=>window.__bunnyQA.snapshot().hand.abortiveReason==='nine_terminals');
 await p.waitForFunction(()=>window.calls69.some(c=>c.events.includes('nine_terminals')));
 assert.deepEqual(await p.evaluate(()=>window.calls69.filter(c=>c.events.includes('nine_terminals')).map(c=>c.role)),['yellow']);
 // Let the actual flow reach score transfer; the declaration must not repeat there.
 await p.locator('.simple-score-overlay').waitFor({timeout:15000});
 assert.equal(await p.evaluate(()=>window.calls69.filter(c=>c.events.includes('nine_terminals')).length),1);
 console.log('PASS actual legal button, server-confirmed declaration, one voice, no repeat on score transfer');
 // Also verify a declaration by each remote seat uses that seat's character.
 await p.evaluate(async()=>{const R=await import('/node_modules/.vite/deps/react.js'),D=await import('/node_modules/.vite/deps/react-dom_client.js'),A=await import('/src/game-audio.tsx'),S=await import('/src/seat-character.ts');const el=document.createElement('div');document.body.append(el);window.qa69={R:R.default??R,root:(D.createRoot??D.default.createRoot)(el),A,S};});
 for(const seat of ['east','south','west','north']){
  const expected=await p.evaluate(seat=>{const {R,root,A,S}=window.qa69,g=structuredClone(window.__bunnyQA.snapshot());g.hand.currentSeat=seat;g.room.code+='-'+seat;window.calls69=[];root.render(R.createElement(A.TableAudio,{game:g,remaining:0,yourDecision:false,riichiTiles:{}}));return S.seatCharacter(g,seat)},seat);
  await p.waitForFunction(()=>window.calls69.some(c=>c.events.includes('nine_terminals')));assert.deepEqual(await p.evaluate(()=>window.calls69.filter(c=>c.events.includes('nine_terminals')).map(c=>c.role)),[expected]);
 }
 assert.deepEqual(errors,[]);console.log('PASS all four declarer-seat voices and no browser errors');
}finally{await b.close()}
