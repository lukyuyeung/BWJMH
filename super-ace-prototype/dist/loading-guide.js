import {assetURL,loadImage} from './asset-cache.js?v=phone-guide-v1';
const slides=[
 {key:'ways',tag:'01 · WAYS WIN',title:'由左開始，連續三列中獎',body:'相同符號由最左列起，至少連續出現3列。',note:'不必在同一行。',mascot:'ways',art:'ways'},
 {key:'gold',tag:'02 · GOLD TO WILD',title:'金牌中獎後，翻成 WILD',body:'天使替代普通牌；惡魔還能擴散。',note:'WILD不替代CARROT。',mascot:'gold',art:'wild'},
 {key:'carrot',tag:'03 · FREE SPINS',title:'同一盤面3個 CARROT',body:'獲得10次免費遊戲；免費期間再觸發加5次。',note:'免費局沿用下注額，不扣蘿蔔。',mascot:'carrot',art:'carrot'},
 {key:'cascade',tag:'04 · CASCADE',title:'再中獎，倍率繼續升',body:'中獎牌消除、補入新牌；連鎖中獎提升倍率。',note:'普通×1／×2／×3／×5；免費為雙倍。',mascot:'ways',art:'cascade'}
];
const image=(src,cls='',alt='')=>`<img class="${cls}" src="${assetURL(src)}" alt="${alt}">`;
function diagram(type){
 if(type==='ways'){const rows=[['H','S','D','K'],['Q','H','C','A'],['D','J','H','S'],['K','D','S','Q'],['C','A','J','D']];return `<div class="guide-ways">${rows.map((col,c)=>`<div class="guide-lane"><small>${c+1}</small>${col.map(s=>`<div class="guide-mini-card ${s==='H'&&c<3?'match':''}">${image('assets/art/card-normal-'+s+'.png','','')}</div>`).join('')}</div>`).join('')}</div>`}
 if(type==='wild')return `<div class="guide-wilds"><div class="guide-gold-card">${image('assets/art/card-gold-K.png')}${image('assets/art/card-gold-overlay.png','guide-gold-border')}</div>${image('assets/art/v7/control-speed-normal-button.webp','guide-arrow')}${image('assets/art/wild-angel-fitted.svg','guide-wild')}${image('assets/art/wild-devil-fitted.svg','guide-wild')}</div>`;
 if(type==='carrot')return `<div class="guide-carrots">${[1,2,3].map(()=>image('assets/art/carrot-bonus.png')).join('')}<strong>10<span>FREE SPINS</span></strong></div>`;
 return '<div class="guide-cascade"><span>×1</span><span>×2</span><span>×3</span><span>×5</span><small>連鎖中獎，逐級提升</small></div>';
}
export function createLoadingGuide({root,onEnter=()=>{},autoEnter=false}={}){
 let index=0,ready=false,timer,closed=false,revision=0;
 root.innerHTML=`<div class="guide-brand">${image('assets/bunny-gala-transparent.png','','Bunny Gala')}<small>SUPER ACE · 基本玩法</small></div><div id="guideContent" class="guide-content"></div><nav class="guide-navigation" aria-label="玩法介紹頁面"><button id="guidePrev" aria-label="上一張">‹</button><div class="guide-dots">${slides.map((s,i)=>`<button data-guide="${i}" aria-label="第${i+1}張：${s.title}"></button>`).join('')}</div><button id="guideNext" aria-label="下一張">›</button></nav><div class="guide-loading"><p id="loadingText" role="status">正在準備遊戲…</p><progress id="loadingProgress" max="1" value="0" aria-label="遊戲圖片載入進度"></progress><button id="enterGame" class="btn primary" disabled>準備中…</button><button id="retryAssets" class="btn" hidden>重新載入圖片</button></div>`;
 const q=s=>root.querySelector(s);
 function restart(){clearInterval(timer);timer=setInterval(()=>{if(!closed&&!document.hidden)show((index+1)%slides.length)},5500)}
 async function show(next){index=(next+slides.length)%slides.length;const token=++revision,s=slides[index];const src='assets/art/v8/loading-bunny-'+s.mascot+'.webp';let mascotReady=true;try{await loadImage(src,{priority:'high'})}catch{mascotReady=false}if(token!==revision||closed)return;q('#guideContent').innerHTML=`<p class="guide-tag">${s.tag}</p><div class="guide-art">${mascotReady?`<img class="guide-mascot" src="${src}" alt="Bunny Gala 金帽兔子介紹玩法">`:''}<div class="guide-diagram">${diagram(s.art)}</div></div><h1>${s.title}</h1><p class="guide-body">${s.body}</p><p class="guide-note">${s.note}</p>`;q('#guideContent').dataset.slide=s.key;root.querySelectorAll('[data-guide]').forEach(b=>b.setAttribute('aria-current',String(Number(b.dataset.guide)===index)))}
 function go(delta){show(index+delta);restart()}
 q('#guidePrev').onclick=()=>go(-1);q('#guideNext').onclick=()=>go(1);root.querySelectorAll('[data-guide]').forEach(b=>b.onclick=()=>{show(Number(b.dataset.guide));restart()});
 function enter(){if(!ready||closed)return;closed=true;clearInterval(timer);revision++;onEnter()}
 q('#enterGame').onclick=enter;show(0);restart();
 return{show,enter,markReady(){ready=true;q('#loadingText').textContent='遊戲已準備好';q('#loadingProgress').value=q('#loadingProgress').max;q('#enterGame').disabled=false;q('#enterGame').textContent='進入遊戲';if(autoEnter)enter()},destroy(){closed=true;clearInterval(timer);revision++},get ready(){return ready}};
}
