/** TYCOON entry is separate; Bunny's startup/lobby never runs in this profile. */
import './tycoon-table.css';
const casino='https://bunny-club-design-1029.almondcrab34.chatgpt.site';
const query=new URLSearchParams(location.search),requested=query.get('room')??'A-01';
const room=/^[A-Z0-9-]{1,24}$/.test(requested)?requested:'A-01';
const friend=query.get('type')==='friends';
query.set('mode','bot');query.set('difficulty','master');query.delete('lesson');query.delete('character');
query.set('room',room);history.replaceState(null,'','/?'+query);
const candidates=['松月','青嵐','墨白','山海','觀瀾','秋水','雲舟','知竹','南山','聽雨','星河','霧島'];
const shuffled=candidates.map(name=>({name,sort:crypto.getRandomValues(new Uint32Array(1))[0]!})).sort((a,b)=>a.sort-b.sort);
let names=shuffled.slice(0,3).map(x=>x.name);try{const saved=JSON.parse(localStorage.getItem('tycoon-riichi-bot-save-v1:'+room)??'null');const bots=saved?.room?.players?.filter((p:any)=>p.isBot);if(saved?.room?.rules?.tier==='master'&&bots?.length===3&&bots.every((p:any)=>/^[\u4e00-\u9fff]{2,4} · AI$/.test(p.name)))names=bots.map((p:any)=>p.name.replace(' · AI',''))}catch{}
(window as any).TycoonRoom={id:room,names};
let roster=[{name:'你',bot:false}],playing=false;
function publish(){const state={type:'tycoon-room-state',room,players:roster,phase:playing?'playing':'waiting',at:Date.now()};try{if(window.opener&&!window.opener.closed)window.opener.postMessage(state,casino)}catch{}}
window.addEventListener('tycoon:seats',event=>{roster=(event as CustomEvent).detail;publish()});
const root=document.querySelector<HTMLDivElement>('#root')!;
root.innerHTML=`<main class="tycoon-match"><header><a href="${casino}/mahjong.html">← 返回公開牌桌</a><span>TYC∞N · RIICHI</span><small>${friend?'好友房':'公開牌桌'} / ${room}</small></header><div class="match-table"><div class="match-centre"><span>東風局 · 四人立直</span><h1>入席，靜候好局。</h1><p id="match-status" role="status">正在準備牌桌</p><div class="match-progress"><i></i></div><small>最遲 30 秒內自動補位開局</small></div><div id="match-seats"></div></div><footer><span>雀聖級電腦補位 · 練習點數不具現金價值</span><span>${friend?'好友房連線待接入 · 目前為本機牌桌':'本機牌桌 · 真人配對待接入'}</span></footer></main>`;
const begin=performance.now();let started=false;
function render(){document.querySelector('#match-seats')!.innerHTML=Array.from({length:4},(_,i)=>`<div class="match-seat seat-${i}"><i aria-hidden="true"></i><b>${i===0?'你':i<roster.length?names[i-1]:'等候入席'}</b><small>${i===0?'已入席':i<roster.length?'雀聖 · AI':'空席'}</small></div>`).join('');document.querySelector('#match-status')!.textContent=`${roster.length} / 4 已入席 · ${Math.max(0,30-Math.floor((performance.now()-begin)/1000))} 秒內開局`;publish()}
render();
const timer=setInterval(()=>{const age=performance.now()-begin;const count=Math.min(4,1+Math.floor(age/3000));while(roster.length<count)roster.push({name:names[roster.length-1]!,bot:true});render();if(age>=10500&&!started){started=true;clearInterval(timer);void start()}},250);
async function script(src:string){await new Promise<void>((resolve,reject)=>{const el=document.createElement('script');el.src=src;el.onload=()=>resolve();el.onerror=()=>reject(Error('載入失敗'));document.head.append(el)})}
async function start(){try{
 await script('/bot-save.js');await script('/game-settings.js');await script('/audio/player.js');
 localStorage.setItem('tycoon-riichi-interface-guide-v1','1');
 window.__bunnyLoading=true;
 window.BunnyStartup={progress:()=>{},fail:()=>{const status=document.querySelector('#match-status');if(status){status.textContent='牌桌載入較慢。';const retry=document.createElement('button');retry.textContent='重新載入';retry.onclick=()=>location.reload();status.append(retry)}},finish:()=>{window.__bunnyLoading=false;window.dispatchEvent(new Event('bunny:table-ready'));document.querySelector('#tycoon-wait')?.remove();playing=true;publish()}};
 const wait=document.createElement('div');wait.id='tycoon-wait';while(root.firstChild)wait.append(root.firstChild);document.body.append(wait);
 await import('./main');
 const deadline=setTimeout(()=>{if(window.__bunnyLoading)window.BunnyStartup?.fail()},19000);
 window.addEventListener('bunny:table-ready',()=>clearTimeout(deadline),{once:true});
 }catch{const status=document.querySelector('#match-status');if(status){status.textContent='無法載入牌桌。';const retry=document.createElement('button');retry.textContent='重新載入';retry.onclick=()=>location.reload();status.append(retry)}}}
const heartbeat=setInterval(publish,2000);
window.addEventListener('pagehide',()=>{roster=[];publish();clearInterval(heartbeat);clearInterval(timer)});
