import {compactMoney} from './money.js?v=hud-v4';
export const ANIMATION_DEFINITIONS = Object.freeze([
  {
    "id": "ANIM-01",
    "name": "待機",
    "group": "發牌與連鎖",
    "duration": 1800,
    "modes": {
      "normal": 1800,
      "fast": 900.0,
      "max": 0,
      "reduced": 140
    }
  },
  {
    "id": "ANIM-02",
    "name": "Spin按壓",
    "group": "發牌與連鎖",
    "duration": 160,
    "modes": {
      "normal": 160,
      "fast": 80.0,
      "max": 0,
      "reduced": 140
    }
  },
  {
    "id": "ANIM-03",
    "name": "舊牌退場",
    "group": "發牌與連鎖",
    "duration": 260,
    "modes": {
      "normal": 260,
      "fast": 130.0,
      "max": 0,
      "reduced": 140
    }
  },
  {
    "id": "ANIM-04",
    "name": "發牌器出牌",
    "group": "發牌與連鎖",
    "duration": 580,
    "modes": {
      "normal": 580,
      "fast": 290.0,
      "max": 0,
      "reduced": 140
    }
  },
  {
    "id": "ANIM-05",
    "name": "揭牌與逐列停牌",
    "group": "發牌與連鎖",
    "duration": 620,
    "modes": {
      "normal": 620,
      "fast": 310.0,
      "max": 0,
      "reduced": 140
    }
  },
  {
    "id": "ANIM-06",
    "name": "未中獎收尾",
    "group": "發牌與連鎖",
    "duration": 300,
    "modes": {
      "normal": 300,
      "fast": 150.0,
      "max": 0,
      "reduced": 140
    }
  },
  {
    "id": "ANIM-07",
    "name": "中獎高亮",
    "group": "發牌與連鎖",
    "duration": 600,
    "modes": {
      "normal": 600,
      "fast": 300.0,
      "max": 0,
      "reduced": 140
    }
  },
  {
    "id": "ANIM-08",
    "name": "單次獎勵數字",
    "group": "發牌與連鎖",
    "duration": 820,
    "modes": {
      "normal": 820,
      "fast": 410.0,
      "max": 0,
      "reduced": 820
    }
  },
  {
    "id": "ANIM-09",
    "name": "中獎牌消除",
    "group": "發牌與連鎖",
    "duration": 280,
    "modes": {
      "normal": 280,
      "fast": 140.0,
      "max": 0,
      "reduced": 140
    }
  },
  {
    "id": "ANIM-10",
    "name": "新牌自上方補入",
    "group": "發牌與連鎖",
    "duration": 580,
    "modes": {
      "normal": 580,
      "fast": 290.0,
      "max": 0,
      "reduced": 140
    }
  },
  {
    "id": "ANIM-11",
    "name": "倍率提升",
    "group": "發牌與連鎖",
    "duration": 420,
    "modes": {
      "normal": 420,
      "fast": 210.0,
      "max": 0,
      "reduced": 140
    }
  },
  {
    "id": "ANIM-12",
    "name": "連鎖結束及下局重置",
    "group": "發牌與連鎖",
    "duration": 340,
    "modes": {
      "normal": 340,
      "fast": 170.0,
      "max": 0,
      "reduced": 140
    }
  },
  {
    "id": "ANIM-13",
    "name": "金牌待機掃光",
    "group": "金牌與WILD",
    "duration": 1800,
    "modes": {
      "normal": 1800,
      "fast": 900.0,
      "max": 0,
      "reduced": 140
    }
  },
  {
    "id": "ANIM-14",
    "name": "金牌參與中獎",
    "group": "金牌與WILD",
    "duration": 520,
    "modes": {
      "normal": 520,
      "fast": 260.0,
      "max": 0,
      "reduced": 140
    }
  },
  {
    "id": "ANIM-15",
    "name": "金牌轉換翻面",
    "group": "金牌與WILD",
    "duration": 480,
    "modes": {
      "normal": 480,
      "fast": 240.0,
      "max": 0,
      "reduced": 140
    }
  },
  {
    "id": "ANIM-16",
    "name": "天使登場",
    "group": "金牌與WILD",
    "duration": 560,
    "modes": {
      "normal": 560,
      "fast": 280.0,
      "max": 0,
      "reduced": 140
    }
  },
  {
    "id": "ANIM-17",
    "name": "天使待機",
    "group": "金牌與WILD",
    "duration": 1800,
    "modes": {
      "normal": 1800,
      "fast": 900.0,
      "max": 0,
      "reduced": 140
    }
  },
  {
    "id": "ANIM-18",
    "name": "天使替代中獎",
    "group": "金牌與WILD",
    "duration": 550,
    "modes": {
      "normal": 550,
      "fast": 275.0,
      "max": 0,
      "reduced": 140
    }
  },
  {
    "id": "ANIM-19",
    "name": "惡魔登場",
    "group": "金牌與WILD",
    "duration": 620,
    "modes": {
      "normal": 620,
      "fast": 310.0,
      "max": 0,
      "reduced": 140
    }
  },
  {
    "id": "ANIM-20",
    "name": "惡魔蓄力",
    "group": "金牌與WILD",
    "duration": 420,
    "modes": {
      "normal": 420,
      "fast": 210.0,
      "max": 0,
      "reduced": 140
    }
  },
  {
    "id": "ANIM-21",
    "name": "合資格目標標記",
    "group": "金牌與WILD",
    "duration": 320,
    "modes": {
      "normal": 320,
      "fast": 160.0,
      "max": 0,
      "reduced": 140
    }
  },
  {
    "id": "ANIM-22",
    "name": "惡魔複製擴散",
    "group": "金牌與WILD",
    "duration": 650,
    "modes": {
      "normal": 650,
      "fast": 325.0,
      "max": 0,
      "reduced": 140
    }
  },
  {
    "id": "ANIM-23",
    "name": "WILD中獎及退場",
    "group": "金牌與WILD",
    "duration": 360,
    "modes": {
      "normal": 360,
      "fast": 180.0,
      "max": 0,
      "reduced": 140
    }
  },
  {
    "id": "ANIM-24",
    "name": "轉換完成後再次判定",
    "group": "金牌與WILD",
    "duration": 300,
    "modes": {
      "normal": 300,
      "fast": 150.0,
      "max": 0,
      "reduced": 140
    }
  },
  {
    "id": "ANIM-25",
    "name": "CARROT落位回彈",
    "group": "CARROT與免費遊戲",
    "duration": 620,
    "modes": {
      "normal": 620,
      "fast": 310.0,
      "max": 0,
      "reduced": 140
    }
  },
  {
    "id": "ANIM-26",
    "name": "CARROT低頻待機",
    "group": "CARROT與免費遊戲",
    "duration": 2000,
    "modes": {
      "normal": 2000,
      "fast": 1000.0,
      "max": 0,
      "reduced": 140
    }
  },
  {
    "id": "ANIM-27",
    "name": "兩個CARROT提示",
    "group": "CARROT與免費遊戲",
    "duration": 500,
    "modes": {
      "normal": 500,
      "fast": 250.0,
      "max": 0,
      "reduced": 140
    }
  },
  {
    "id": "ANIM-28",
    "name": "最後列懸念",
    "group": "CARROT與免費遊戲",
    "duration": 750,
    "modes": {
      "normal": 750,
      "fast": 375.0,
      "max": 0,
      "reduced": 140
    }
  },
  {
    "id": "ANIM-29",
    "name": "未觸發懸念收回",
    "group": "CARROT與免費遊戲",
    "duration": 360,
    "modes": {
      "normal": 360,
      "fast": 180.0,
      "max": 0,
      "reduced": 140
    }
  },
  {
    "id": "ANIM-30",
    "name": "第三個CARROT命中",
    "group": "CARROT與免費遊戲",
    "duration": 540,
    "modes": {
      "normal": 540,
      "fast": 270.0,
      "max": 0,
      "reduced": 140
    }
  },
  {
    "id": "ANIM-31",
    "name": "三CARROT觸發",
    "group": "CARROT與免費遊戲",
    "duration": 780,
    "modes": {
      "normal": 780,
      "fast": 390.0,
      "max": 0,
      "reduced": 140
    }
  },
  {
    "id": "ANIM-32",
    "name": "免費遊戲進入",
    "group": "CARROT與免費遊戲",
    "duration": 680,
    "modes": {
      "normal": 680,
      "fast": 340.0,
      "max": 0,
      "reduced": 140
    }
  },
  {
    "id": "ANIM-33",
    "name": "免費模式切換",
    "group": "CARROT與免費遊戲",
    "duration": 480,
    "modes": {
      "normal": 480,
      "fast": 240.0,
      "max": 0,
      "reduced": 140
    }
  },
  {
    "id": "ANIM-34",
    "name": "次數扣減及追加",
    "group": "CARROT與免費遊戲",
    "duration": 460,
    "modes": {
      "normal": 460,
      "fast": 230.0,
      "max": 0,
      "reduced": 140
    }
  },
  {
    "id": "ANIM-35",
    "name": "最後一次免費提示",
    "group": "CARROT與免費遊戲",
    "duration": 600,
    "modes": {
      "normal": 600,
      "fast": 300.0,
      "max": 0,
      "reduced": 140
    }
  },
  {
    "id": "ANIM-36",
    "name": "免費結算及返回",
    "group": "CARROT與免費遊戲",
    "duration": 800,
    "modes": {
      "normal": 800,
      "fast": 400.0,
      "max": 0,
      "reduced": 140
    }
  },
  {
    "id": "ANIM-37",
    "name": "普通獎勵",
    "group": "獎勵操作與教學",
    "duration": 650,
    "modes": {
      "normal": 650,
      "fast": 325.0,
      "max": 0,
      "reduced": 650
    }
  },
  {
    "id": "ANIM-38",
    "name": "大獎演出",
    "group": "獎勵操作與教學",
    "duration": 1800,
    "modes": {
      "normal": 1800,
      "fast": 900.0,
      "max": 0,
      "reduced": 140
    }
  },
  {
    "id": "ANIM-39",
    "name": "更高獎演出",
    "group": "獎勵操作與教學",
    "duration": 2400,
    "modes": {
      "normal": 2400,
      "fast": 1200.0,
      "max": 0,
      "reduced": 140
    }
  },
  {
    "id": "ANIM-40",
    "name": "點按加速計數與關閉",
    "group": "獎勵操作與教學",
    "duration": 180,
    "modes": {
      "normal": 180,
      "fast": 90.0,
      "max": 0,
      "reduced": 140
    }
  },
  {
    "id": "ANIM-41",
    "name": "蘿蔔餘額更新",
    "group": "獎勵操作與教學",
    "duration": 350,
    "modes": {
      "normal": 350,
      "fast": 175.0,
      "max": 0,
      "reduced": 140
    }
  },
  {
    "id": "ANIM-42",
    "name": "Auto設定開關",
    "group": "獎勵操作與教學",
    "duration": 260,
    "modes": {
      "normal": 260,
      "fast": 130.0,
      "max": 0,
      "reduced": 140
    }
  },
  {
    "id": "ANIM-43",
    "name": "Auto剩餘與停止",
    "group": "獎勵操作與教學",
    "duration": 320,
    "modes": {
      "normal": 320,
      "fast": 160.0,
      "max": 0,
      "reduced": 140
    }
  },
  {
    "id": "ANIM-44",
    "name": "正常快速極速切換",
    "group": "獎勵操作與教學",
    "duration": 240,
    "modes": {
      "normal": 240,
      "fast": 120.0,
      "max": 0,
      "reduced": 140
    }
  },
  {
    "id": "ANIM-45",
    "name": "下注10%上限提示",
    "group": "獎勵操作與教學",
    "duration": 500,
    "modes": {
      "normal": 500,
      "fast": 250.0,
      "max": 0,
      "reduced": 140
    }
  },
  {
    "id": "ANIM-46",
    "name": "玩法頁與分頁開關",
    "group": "獎勵操作與教學",
    "duration": 260,
    "modes": {
      "normal": 260,
      "fast": 130.0,
      "max": 0,
      "reduced": 140
    }
  },
  {
    "id": "ANIM-47",
    "name": "首次教學流程",
    "group": "獎勵操作與教學",
    "duration": 650,
    "modes": {
      "normal": 650,
      "fast": 325.0,
      "max": 0,
      "reduced": 140
    }
  },
  {
    "id": "ANIM-48",
    "name": "暫停連線與恢復",
    "group": "獎勵操作與教學",
    "duration": 500,
    "modes": {
      "normal": 500,
      "fast": 250.0,
      "max": 0,
      "reduced": 140
    }
  }
]);

const ASSET_BASE='assets/art/effects/';
const profile=[1,.5,0];
const formatting=compactMoney;
const key=id=>typeof id==='number'?`ANIM-${String(id).padStart(2,'0')}`:id;
export function createEffects({clock,root=document,getSpeed=()=>0}={}){
 const doc=root.ownerDocument||root;const q=s=>root.querySelector(s),all=s=>[...root.querySelectorAll(s)];
 const app=q('.app')||doc.body;const stage=doc.createElement('div');stage.className='fx-stage';stage.setAttribute('aria-hidden','true');app.append(stage);
 const ready=Promise.all(['aura','bubble','burst','halo','sweep','trail'].map(name=>{const img=new Image();img.src=ASSET_BASE+name+'.svg';return img.decode().catch(()=>{})}));
 const history=[];const active=new Set(),idle=new Set(),counters=new Set();let idleTimer,paused=!!clock?.paused,mode=getSpeed(),idleEnabled=false,forceReduced=null;
 const reduced=()=>forceReduced??doc.defaultView.matchMedia('(prefers-reduced-motion: reduce)').matches;
 function applyFont(){const sample=q('.balance-bar strong');if(sample){app.style.setProperty('--fx-numeric-font',getComputedStyle(sample).fontFamily);doc.documentElement.style.setProperty('--fx-numeric-font',getComputedStyle(sample).fontFamily)}}applyFont();
 function cells(indices){const nodes=all('#board .cell');return (indices?.length?indices.map(i=>nodes[i]):nodes).filter(Boolean)}
 function selected(detail,fallback){return cells(detail.indices?.length?detail.indices:fallback)}
 function element(target,fallback){return typeof target==='string'?q(target):target||q(fallback)}
 function scale(){return profile[mode]??1}
 function track(el,frames,duration,{iterations=1,delay=0,easing='cubic-bezier(.2,.7,.3,1)',persistent=false,informational=false,cleanup}={}){
  if(!el)return null;
  const s=scale();if(reduced()){const decoration=el.matches('.fx-art,.fx-slot-light,.fx-flight,.fx-credit-carrot,.fx-celebration-carrot');frames=frames.map(frame=>({opacity:decoration?0:(frame.opacity??1),...(frame.offset===undefined?{}:{offset:frame.offset})}))}const animation=el.animate(frames,{duration:Math.max(1,reduced()&&!informational?Math.min(duration,140):duration),iterations,delay,easing,fill:'both'});
  const entry={animation,duration,iterations,persistent,cleanup};active.add(entry);if(persistent)idle.add(entry);
  animation.playbackRate=s===0?100000:1/s;
  if(paused)animation.pause();
  const finished=animation.finished.catch(()=>{}).then(()=>{if(!persistent){active.delete(entry);cleanup?.();animation.cancel()}});
  entry.finished=finished;return entry;
 }
 function art(host,name,className='fx-art',style={}){
  if(!host)return null;const img=doc.createElement('img');img.className=className;img.src=ASSET_BASE+name+'.svg';img.alt='';img.setAttribute('aria-hidden','true');Object.assign(img.style,style);host.append(img);return img;
 }
 function overlay(host,name,frames,duration,style={},options={}){const img=art(host,name,'fx-art',style);return track(img,frames,duration,{...options,cleanup:()=>img?.remove()})}
 function pulse(el,d=500,strength=1.035,options={}){return track(el,[{transform:'scale(1)',filter:'brightness(1)'},{transform:`scale(${strength})`,filter:'brightness(1.25)',offset:.45},{transform:'scale(1)',filter:'brightness(1)'}],d,options)}
 function glow(nodes,d=600,color='gold'){
  const entries=[];for(const el of nodes){const img=doc.createElement('img');img.className='fx-slot-light';img.src='assets/art/card-win-glow.png';img.alt='';el.append(img);entries.push(track(img,[{opacity:0,transform:'scale(.96)'},{opacity:color==='purple'?.8:.95,transform:'scale(1.03)',offset:.45},{opacity:0,transform:'scale(1.04)'}],d,{cleanup:()=>img.remove()}))}return entries;
 }
 function burst(el,d=600,magnitude=1){return overlay(el,'burst',[{opacity:0,transform:'scale(.35)'},{opacity:.78,transform:`scale(${magnitude})`,offset:.38},{opacity:0,transform:`scale(${magnitude*1.3})`}],d,{inset:'-18%',width:'136%',height:'136%'})}
 function halo(el,d=700){return overlay(el,'aura',[{opacity:0,transform:'scale(.5) rotate(-14deg)'},{opacity:.9,transform:'scale(1) rotate(3deg)',offset:.45},{opacity:0,transform:'scale(1.18) rotate(12deg)'}],d,{inset:'-10%',width:'120%',height:'120%'})}
 function sweep(el,d=1100,options={}){return overlay(el,'sweep',[{opacity:0,transform:'translateX(-70%)'},{opacity:.55,offset:.35},{opacity:0,transform:'translateX(70%)'}],d,{mixBlendMode:'screen'},options)}
 function cardMotion(nodes,frames,d){return nodes.map(el=>track(el.querySelector('.fx-preview-symbol')||el.querySelector('.card')||el,frames,d))}
 function numberTarget(host){if(!host)return null;if(host.matches('input'))return null;let span=host.querySelector('.fx-counter-value');if(!span){span=doc.createElement('span');span.className='fx-counter-value';const text=[...host.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent).join('');[...host.childNodes].filter(n=>n.nodeType===3).forEach(n=>n.remove());span.textContent=text.trim();host.append(span)}return span}
 function counter(host,from,to,duration,{preview=false}={}){
  const span=numberTarget(host);if(!span)return null;const original=span.textContent;if(reduced()){span.textContent=formatting(to);const e=track(span,[{opacity:.8},{opacity:1}],140);e?.finished.then(()=>{if(preview)span.textContent=original});return e}const fromNumber=Number(from)||0,toNumber=Number(to)||0;const entry=track(span,[{opacity:1},{opacity:1}],duration);if(!entry)return null;
  const record={entry,finish(){try{entry.animation.finish()}catch{}span.textContent=formatting(toNumber)},target:span};counters.add(record);
  function tick(){if(!active.has(entry))return;const t=Math.min(1,Math.max(0,Number(entry.animation.currentTime||0)/duration));span.textContent=formatting(fromNumber+(toNumber-fromNumber)*(1-Math.pow(1-t,3)));if(t<1)doc.defaultView.requestAnimationFrame(tick)}
  tick();entry.finished.then(()=>{counters.delete(record);span.textContent=preview?original:formatting(toNumber)});return entry;
 }
 function numberPlaque(detail,d=820){
  const board=q('.board-shell'),host=q('#winPop');if(!board||!host)return[];const rect=board.getBoundingClientRect(),nodes=selected(detail,[5,6,7]);const boxes=nodes.map(n=>n.getBoundingClientRect());
  const cx=rect.width/2,cy=rect.height/2;
  const width=Math.min(244,rect.width*.82,Math.max(132,formatting(detail.amount||80).length*22+64)),height=50;host.classList.add('fx-win-amount');host.classList.remove('show');host.style.cssText=`left:${Math.max(5,Math.min(rect.width-width-5,cx-width/2))}px;top:${Math.max(12,Math.min(rect.height-height-12,cy-height/2))}px;width:${width}px;height:${height}px;`;host.innerHTML='<span class="fx-win-prefix">＋</span><span class="fx-counter-value"></span>';host.setAttribute('aria-label',`本次中獎 ${formatting(detail.amount)} 蘿蔔`);
  const value=host.querySelector('.fx-counter-value');value.textContent=formatting(detail.amount||80);host.style.fontFamily=getComputedStyle(q('.balance-bar strong')).fontFamily;
  let size=Math.min(34,rect.width*.095);host.style.fontSize=size+'px';while(size>14&&host.scrollWidth>host.clientWidth){size--;host.style.fontSize=size+'px'}
  return[track(host,[{opacity:1,transform:'scale(.88)'},{opacity:1,transform:'scale(1.025)',offset:.17},{opacity:1,transform:'translateY(0) scale(1)',offset:.78},{opacity:1,transform:'scale(1)'}],d,{informational:true,cleanup:()=>{host.classList.remove('fx-win-amount');host.style.opacity='0'}})];
 }
 function flyCopies(copies,duration=650){const entries=[];const sr=stage.getBoundingClientRect();for(const{source,index}of copies){const a=cells([source])[0],b=cells([index])[0];if(!a||!b)continue;const ar=a.getBoundingClientRect(),br=b.getBoundingClientRect(),dx=br.x-ar.x,dy=br.y-ar.y;const img=art(stage,'trail','fx-flight',{left:`${ar.x+ar.width/2-sr.x-24}px`,top:`${ar.y+ar.height/2-sr.y-18}px`,width:'48px',height:'36px'});entries.push(track(img,[{opacity:0,transform:'translate(0,0) scale(.4)'},{opacity:1,transform:`translate(${dx*.48}px,${dy*.48-18}px) scale(1)`,offset:.48},{opacity:0,transform:`translate(${dx}px,${dy}px) scale(.6)`}],duration,{cleanup:()=>img.remove()}));entries.push(burst(b,duration,.7));}return entries}
 function coinsToBalance(detail,d=650){const src=element(detail.target,'.board-shell'),dest=q('#balance');if(!src||!dest)return[];const a=src.getBoundingClientRect(),b=dest.getBoundingClientRect(),sr=stage.getBoundingClientRect();const entries=[];for(let i=0;i<8;i++){const img=doc.createElement('img');img.src='assets/carrot.png';img.className='fx-credit-carrot';img.alt='';const x=a.x+a.width*(.25+(i%4)*.16)-sr.x,y=a.y+a.height*.6-sr.y;Object.assign(img.style,{left:x+'px',top:y+'px'});stage.append(img);entries.push(track(img,[{opacity:0,transform:'translate(0,0) scale(.5)'},{opacity:1,transform:`translate(${(i-4)*7}px,-24px) scale(1)`,offset:.23},{opacity:0,transform:`translate(${b.x+b.width/2-sr.x-x}px,${b.y+b.height/2-sr.y-y}px) scale(.5)`}],d,{delay:i*24,cleanup:()=>img.remove()}))}return entries}
 function celebrate(detail,d,level=1){
  const host=element(detail.target,'.reward-amount')||q('#modalContent');if(!host)return[];const parent=host.parentElement,entries=[];host.classList.add('fx-number-host');
  entries.push(counter(host,detail.from??0,detail.amount??detail.to??280,level===2?3600:2600,{preview:detail.preview}));
  entries.push(overlay(parent,'aura',[{opacity:0,transform:'scale(.6)'},{opacity:.85,transform:'scale(1)',offset:.3},{opacity:.3,transform:'scale(1.15)'}],1500,{top:'-20%',height:'140%',zIndex:'0'}));
  const title=parent.querySelector('.feature-title');if(title)entries.push(track(title,[{opacity:0,transform:'scale(.6)'},{opacity:1,transform:'scale(1.07)',offset:.7},{opacity:1,transform:'scale(1)'}],550));return entries;
 }
 function startWaterfall(host,{mega=false}={}){
  const layer=doc.createElement('div');layer.className='carrot-waterfall';layer.setAttribute('aria-hidden','true');host.prepend(layer);const entries=[],count=reduced()?0:mega?180:110;let stopped=false;
  const width=host.clientWidth,height=host.clientHeight;
  for(let i=0;i<count;i++){const img=doc.createElement('img');img.src='assets/carrot.png';img.alt='';img.className='waterfall-carrot';const depth=i%3,size=depth===0?12+i%7:depth===1?24+i%11:38+i%17;
   // Near particles favour the sides, preserving the title and amount in front.
   const fraction=depth===2?(i%2?.77+(i%13)/65:.04+(i%13)/65):((i*47)%101)/100,x=fraction*width;
   Object.assign(img.style,{width:size+'px',height:size+'px',left:x+'px',top:'-70px',opacity:depth===0?'.4':depth===1?'.75':'1',zIndex:String(depth)});layer.append(img);
   const duration=depth===0?3300+(i%5)*160:depth===1?2400+(i%5)*100:1800+(i%5)*100;
   entries.push(track(img,[{transform:`translate(0,0) rotate(${i*29%180}deg)`},{transform:`translate(${(i%7-3)*9}px,${height+155}px) rotate(${260+i*37%300}deg)`}],duration,{iterations:Infinity,delay:-(i*137%duration),easing:'linear',cleanup:()=>img.remove()}));
  }
  layer.style.opacity='0';entries.push(track(layer,[{opacity:0},{opacity:1}],500,{delay:200,cleanup:()=>{if(!stopped)layer.style.opacity='1'}}));
  for(let i=0;i<(reduced()?0:12);i++){const img=doc.createElement('img');img.src='assets/carrot.png';img.alt='';img.className='waterfall-burst';layer.append(img);const dx=(i-5.5)*29;entries.push(track(img,[{opacity:0,transform:'translate(0,0) scale(.5)'},{opacity:1,transform:`translate(${dx*.6}px,-220px) scale(1)`,offset:.45},{opacity:0,transform:`translate(${dx}px,-110px) rotate(${dx}deg) scale(.7)`}],850,{delay:i%4*35,cleanup:()=>img.remove()}))}
  history.push({id:'CARROT-WATERFALL',count,mega,at:performance.now()});
  return{count,stop(){if(stopped)return;stopped=true;entries.forEach(e=>e?.animation.cancel());layer.remove()}};
 }
 const idles={1:()=>track(q('.dealer'),[{filter:'brightness(1)'},{filter:'brightness(1.08)',offset:.5},{filter:'brightness(1)'}],1800,{persistent:true,iterations:Infinity}),13:()=>all('.card.gold:not(.special)').map((n,i)=>sweep(n,3000,{persistent:true,iterations:Infinity,delay:i*140})),17:()=>all('.cell[data-face^="ANGEL"] .card').map(n=>pulse(n,2000,1.012,{persistent:true,iterations:Infinity})),26:()=>all('.cell.carrot .art-card').map(n=>track(n,[{transform:'translateY(0) rotate(-1deg)'},{transform:'translateY(-3px) rotate(1deg)'},{transform:'translateY(0) rotate(-1deg)'}],2400,{persistent:true,iterations:Infinity}))};
 function play(input,detail={}){
  const id=key(input),definition=ANIMATION_DEFINITIONS.find(a=>a.id===id);if(!definition)throw new RangeError('Unknown effect '+input);const n=Number(id.slice(-2)),d=definition.duration;const entries=[];const add=e=>{if(Array.isArray(e))e.forEach(add);else if(e)entries.push(e)};const nodes=selected(detail,[0,6,12]);const target=element(detail.target);
  history.push({id,at:performance.now(),indices:detail.indices?[...detail.indices]:[],preview:!!detail.preview,...(n===5||n===10?{slow:!!detail.slow}:{})});if(history.length>2000)history.splice(0,history.length-2000);
  switch(n){
   case 1:add(track(target||q('.dealer'),[{filter:'brightness(1)'},{filter:'brightness(1.1)',offset:.5},{filter:'brightness(1)'}],d));add(sweep(q('.dealer'),d));break;
   case 2:add(track(target||q('#spin'),[{transform:'scale(1)'},{transform:'scale(.9)',offset:.35},{transform:'scale(1)'}],d));break;
   case 3:add(cardMotion(nodes,[{opacity:1,transform:'translateY(0) scale(1)'},{opacity:0,transform:'translateY(12px) scale(.92)'}],d));break;
   case 4:all('.mouth>.dealer-outlet-art').forEach((el,i)=>add(track(el,[{filter:'brightness(1)'},{filter:'brightness(1.45)',offset:.55},{filter:'brightness(1)'}],d,{delay:i*35})));add(sweep(q('.dealer'),d));break;
   case 5:case 10:{
    const sr=stage.getBoundingClientRect();
    nodes.forEach(el=>{const card=el.querySelector('.card');if(!card)return;const index=Number(el.dataset.index),box=el.getBoundingClientRect(),outlet=all('.mouth')[index%5]?.getBoundingClientRect();if(!outlet)return;
     const top=outlet.bottom-2,travel=box.top-top,token=String(performance.now())+':'+index;el.dataset.feedToken=token;el.classList.add('feed-waiting');
     const viewport=doc.createElement('div');viewport.className='feed-viewport';Object.assign(viewport.style,{left:`${box.left-sr.left}px`,top:`${top-sr.top}px`,width:`${box.width}px`,height:`${travel+box.height+5}px`});
     const flight=doc.createElement('div');flight.className='cell feed-card'+(el.classList.contains('carrot')?' carrot':el.classList.contains('wild')?' wild':'');Object.assign(flight.style,{width:`${box.width}px`,height:`${box.height}px`});flight.append(card.cloneNode(true));viewport.append(flight);stage.append(viewport);
     add(track(flight,[{transform:`translateY(${-box.height+5}px)`,opacity:1},{transform:`translateY(${travel+3}px)`,opacity:1,offset:.88},{transform:`translateY(${travel}px)`,opacity:1}],detail.slow?480:220,{delay:(3-Math.floor(index/5))*(detail.slow?40:20)+(n===10?index%5*12:0),easing:'cubic-bezier(.3,.02,.35,1)',cleanup:()=>{viewport.remove();if(el.dataset.feedToken===token){el.classList.remove('feed-waiting');delete el.dataset.feedToken}}}));
    });break;
   }
   case 6:add(track(q('#message'),[{opacity:.4,transform:'translateY(4px)'},{opacity:1,transform:'translateY(0)'}],d));break;
   case 7:add(glow(nodes,d));add(cardMotion(nodes,[{filter:'brightness(1)'},{filter:'brightness(1.18)',offset:.45},{filter:'brightness(1)'}],d));break;
   case 8:add(numberPlaque(detail,d));break;
   case 9:add(cardMotion(nodes,[{opacity:1,transform:'scale(1)'},{opacity:.8,transform:'scale(1.03)',offset:.25},{opacity:0,transform:'scale(.7) rotateY(70deg)'}],d));nodes.forEach(el=>add(burst(el,d,.65)));break;
   case 11:{add(pulse(target||q('#multipliers .active'),d,1.12));add(sweep(q('.multipliers'),d));add(sweep(q('.dealer'),d));if(q('.app')?.dataset.heat==='3'){const b=q('.board-shell')?.getBoundingClientRect(),s=stage.getBoundingClientRect();if(b){const img=art(stage,'burst','fx-flight',{left:`${b.left-s.left-10}px`,top:`${b.top-s.top-10}px`,width:'20px',height:'20px'});add(track(img,[{opacity:0,transform:'translate(0,0)'},{opacity:1,transform:`translate(${b.width}px,0)`,offset:.25},{opacity:1,transform:`translate(${b.width}px,${b.height}px)`,offset:.5},{opacity:1,transform:`translate(0,${b.height}px)`,offset:.75},{opacity:0,transform:'translate(0,0)'}],900,{cleanup:()=>img.remove()}))}}break;}
   case 12:add(track(q('#multipliers'),[{filter:'brightness(1.15)'},{filter:'brightness(1)'}],d));add(track(q('#message'),[{opacity:.4},{opacity:1}],d));break;
   case 13:nodes.forEach(el=>add(sweep(el.querySelector('.card')||el,d)));break;
   case 14:add(glow(nodes,d));nodes.forEach(el=>add(sweep(el,d)));break;
   case 15:add(cardMotion(nodes,[{transform:'rotateY(0)',filter:'brightness(1)'},{transform:'rotateY(90deg)',filter:'brightness(1.5)',offset:.5},{transform:'rotateY(0)',filter:'brightness(1)'}],d));break;
   case 16:add(cardMotion(nodes,[{opacity:0,transform:'rotateY(-90deg) scale(.96)'},{opacity:1,transform:'rotateY(0) scale(1.035)',offset:.7},{opacity:1,transform:'rotateY(0) scale(1)'}],d));nodes.forEach(el=>add(halo(el,d)));break;
   case 17:add(cardMotion(nodes,[{transform:'translateY(0)'},{transform:'translateY(-2px)',offset:.5},{transform:'translateY(0)'}],d));nodes.forEach(el=>add(overlay(el,'halo',[{opacity:.2,transform:'translateY(-18%) scale(.7)'},{opacity:.8,transform:'translateY(-22%) scale(.8)',offset:.5},{opacity:.2,transform:'translateY(-18%) scale(.7)'}],d,{height:'30%',top:'-5%'})));break;
   case 18:add(glow(nodes,d));nodes.forEach(el=>add(halo(el,d)));break;
   case 19:add(cardMotion(nodes,[{opacity:0,transform:'rotateY(-90deg) scale(.9)'},{opacity:1,transform:'rotateY(0) scale(1.04)',offset:.6},{opacity:1,transform:'rotateY(0) scale(1)'}],d));nodes.forEach(el=>add(overlay(el,'bubble',[{opacity:0,transform:'scale(.3)'},{opacity:.6,transform:'scale(1)',offset:.4},{opacity:0,transform:'scale(1.25)'}],d)));break;
   case 20:add(cardMotion(nodes,[{transform:'scale(1)'},{transform:'scale(.96)',offset:.4},{transform:'scale(1.025)'}],d));nodes.forEach(el=>add(overlay(el,'bubble',[{opacity:0,transform:'scale(.3)'},{opacity:.75,transform:'scale(1)'}],d)));break;
   case 21:add(glow(nodes,d,'purple'));nodes.forEach(el=>add(overlay(el,'aura',[{opacity:0,transform:'scale(.9)'},{opacity:.9,transform:'scale(.7)'},{opacity:0,transform:'scale(.8)'}],d)));break;
   case 22:add(flyCopies(detail.copies?.length?detail.copies:[{source:6,index:8},{source:6,index:13}],d));break;
   case 23:add(glow(nodes,d));add(cardMotion(nodes,[{opacity:1,transform:'scale(1)'},{opacity:1,transform:'scale(1.045)',offset:.4},{opacity:0,transform:'scale(.78)'}],d));break;
   case 24:add(track(q('.board-shell'),[{filter:'brightness(1.1)'},{filter:'brightness(1)'}],d));break;
   case 25:add(cardMotion(nodes,[{transform:'translateY(-12px) scale(.9)'},{transform:'translateY(4px) scale(1.035)',offset:.5},{transform:'translateY(-3px) scale(.99)',offset:.78},{transform:'translateY(0) scale(1)'}],d));break;
   case 26:add(cardMotion(nodes,[{transform:'translateY(0) rotate(-1deg)'},{transform:'translateY(-4px) rotate(2deg)',offset:.5},{transform:'translateY(0) rotate(-1deg)'}],d));break;
   case 27:nodes.forEach(el=>add(halo(el,d)));add(pulse(q('#freePill')||q('#message'),d,1.04));break;
   case 28:add(glow(selected(detail,[4,9,14,19]),d));add(track(q('.dealer'),[{filter:'brightness(1)'},{filter:'brightness(1.35)',offset:.6},{filter:'brightness(1)'}],d));break;
   case 29:add(track(q('.board-shell'),[{filter:'brightness(1.12)'},{filter:'brightness(1)'}],d));break;
   case 30:nodes.forEach(el=>add(burst(el,d,.9)));add(cardMotion(nodes,[{transform:'scale(.9)'},{transform:'scale(1.09)',offset:.45},{transform:'scale(1)'}],d));break;
   case 31:nodes.forEach(el=>{add(burst(el,d,1));add(halo(el,d))});add(coinsToBalance(detail,d));break;
   case 32:add(track(target||q('#modalContent'),[{opacity:0,transform:'translateY(18px) scale(.94)'},{opacity:1,transform:'translateY(0) scale(1)'}],d));add(halo(target||q('#modalContent'),d));break;
   case 33:add(sweep(q('#multipliers'),d));add(pulse(q('.balance-bar'),d,1.015));break;
   case 34:add(pulse(target||q('#freePill')||q('#freeLabel'),d,1.15));break;
   case 35:add(pulse(target||q('#freePill')||q('#message'),d,1.12));break;
   case 36:add(celebrate(detail,d,1));add(coinsToBalance(detail,d));break;
   case 37:add(numberPlaque(detail,d));add(coinsToBalance(detail,d));break;
   case 38:add(celebrate(detail,d,1));break;
   case 39:add(celebrate(detail,d,2));break;
   case 40:add(pulse(target||q('#rewardGo')||q('#totalGo')||q('#winPop'),d,.96));break;
   case 41:add(counter(target||q('#balance'),detail.from??0,detail.to??detail.amount??2000,d,{preview:detail.preview}));add(pulse(q('.balance-currency'),d,1.16));break;
   case 42:add(track(target||q('#modalContent'),detail.closing?[{opacity:1,transform:'translateY(0)'},{opacity:0,transform:'translateY(12px)'}]:[{opacity:0,transform:'translateY(14px) scale(.97)'},{opacity:1,transform:'translateY(0) scale(1)'}],d));break;
   case 43:add(pulse(target||q('#auto'),d,detail.stopped?1.04:.94));break;
   case 44:add(track(target||q('#speed'),[{transform:'scale(.88)',filter:'brightness(1.4)'},{transform:'scale(1)',filter:'brightness(1)'}],d));break;
   case 45:add(track(target||q('.balance-bar'),[{transform:'translateX(0)'},{transform:'translateX(-3px)',offset:.2},{transform:'translateX(3px)',offset:.45},{transform:'translateX(-2px)',offset:.7},{transform:'translateX(0)'}],d));add(glow([q('.balance-bar')].filter(Boolean),d));break;
   case 46:add(track(target||q('#modalContent'),detail.closing?[{opacity:1,transform:'translateY(0)'},{opacity:0,transform:'translateY(8px)'}]:[{opacity:.2,transform:'translateX(10px)'},{opacity:1,transform:'translateX(0)'}],d));break;
   case 47:add(track(target||q('#modalContent'),[{opacity:.1,transform:'translateY(10px)'},{opacity:1,transform:'translateY(0)'}],d));add(pulse(q('.tutorial-progress .active'),d,1.5));break;
   case 48:add(track(target||q('.game'),detail.resuming?[{opacity:.65,filter:'saturate(.4)'},{opacity:1,filter:'saturate(1)'}]:[{opacity:1,filter:'saturate(1)'},{opacity:.65,filter:'saturate(.4)'}],d));break;
  }
  // Every ID creates a finite, observable handle even if its target is temporarily absent.
  if(!entries.length)add(track(target||q('.board-shell'),[{opacity:.96},{opacity:1}],Math.min(d,240)));
  const handle={id,duration:d,element:target||nodes[0]||q('.board-shell'),finished:Promise.all(entries.map(e=>e.finished)),cancel(){for(const e of entries){e.animation.cancel();active.delete(e);e.cleanup?.()}}};return handle;
 }
 function stopIdle(){idleEnabled=false;clearTimeout(idleTimer);for(const entry of idle){entry.animation.cancel();active.delete(entry);entry.cleanup?.()}idle.clear()}
 function startIdle(){stopIdle();idleEnabled=true;if(scale()===0||reduced()||paused)return;for(const [id,fn] of Object.entries(idles)){const result=fn();if(Array.isArray(result)?result.length:result)history.push({id:key(Number(id)),at:performance.now(),indices:[],preview:false})}idleTimer=setTimeout(()=>{if(idleEnabled)startIdle()},7000)}
 function clear(){stopIdle();for(const entry of active){entry.animation.cancel();entry.cleanup?.()}active.clear();stage.replaceChildren();const host=q('#winPop');if(host){host.classList.remove('fx-win-amount');host.style.opacity='0'}}
 function setPlaybackRate(value){const next=Number(value);if(next===mode)return;mode=next;const s=scale();for(const entry of [...active]){if(s===0){if(entry.iterations===Infinity){entry.animation.cancel();active.delete(entry);idle.delete(entry);entry.cleanup?.()}else try{entry.animation.finish()}catch{}}else entry.animation.updatePlaybackRate(1/s)}if(s>0&&idleEnabled&&!idle.size&&!paused)startIdle()}
 function setReducedMotion(value){forceReduced=value===null?null:!!value;const enabled=idleEnabled;stopIdle();idleEnabled=enabled;for(const e of [...active]){if(e.iterations!==Infinity)try{e.animation.finish()}catch{}}if(enabled&&!reduced()&&scale()>0&&!paused)startIdle()}
 function pause(){paused=true;for(const e of active)e.animation.pause()}
 function resume(){paused=false;for(const e of active){if(e.animation.playState==='paused')e.animation.play()}if(idleEnabled&&!idle.size)startIdle()}
 function finishCounters(){const had=counters.size>0;for(const c of counters)c.finish();return had}
 function preview(input){
  const id=key(input),n=Number(id.slice(-2));
  const detail={preview:true,indices:[0,6,12],amount:n===39?2400:n===37?80:280,from:0,to:2280,copies:[{source:6,index:8},{source:6,index:13}]};
  const temporary=[],restore=[],timers=[];let cleaned=false;
  function clean(){if(cleaned)return;cleaned=true;timers.forEach(clearTimeout);temporary.forEach(el=>el.remove());restore.forEach(fn=>fn())}
  function symbol(index,src,carrot=false){const el=cells([index])[0];if(!el)return null;const card=el.querySelector('.card');if(card){const prior=card.style.visibility;card.style.visibility='hidden';restore.push(()=>card.style.visibility=prior)}const img=doc.createElement('img');img.className='fx-preview-symbol';img.src=src;img.alt='動畫示意';if(carrot)Object.assign(img.style,{inset:'auto',left:'-18%',top:'-6%',width:'136%',height:'116%'});if(carrot||src.includes('wild-')){const original=el.className;el.classList.add(carrot?'carrot':'wild');restore.push(()=>el.className=original)}if(src.includes('wild-'))img.style.objectFit='fill';el.append(img);temporary.push(img);return img}
  function setPill(text){const pill=q('#freePill'),hidden=pill.hidden,original=pill.textContent;pill.hidden=false;pill.textContent=text;restore.push(()=>{pill.hidden=hidden;pill.textContent=original});return pill}
  if(n===13)detail.indices=[1,12,18];
  if([3,5].includes(n))detail.indices=Array.from({length:20},(_,i)=>i);
  if([7,8,9,14,15].includes(n)){
   // A valid left-to-right three-reel J combination; only the middle J is gold.
   for(const index of [0,6,12])symbol(index,`assets/art/card-${index===6&&n>=14?'gold':'normal'}-J.png`);
   if(n===14||n===15)detail.indices=[6];
   if(n===15){const img=cells([6])[0].querySelector('.fx-preview-symbol');timers.push(setTimeout(()=>{if(!cleaned)img.src='assets/art/wild-angel-fitted.svg'},Math.max(0,durationForPreview(id)*scale()*.5)))}
  }
  if(n>=16&&n<=23){
   detail.indices=[6,12,18];
   if(n<=18)detail.indices.forEach(index=>symbol(index,'assets/art/wild-angel-fitted.svg'));
   else if(n===21||n===22){symbol(6,'assets/art/wild-devil-fitted.svg');detail.indices=n===21?[8,13]:[6]}
   else {if(n===20)detail.indices=[6];detail.indices.forEach(index=>symbol(index,'assets/art/wild-devil-fitted.svg'))}
  }
  if(n>=25&&n<=31){
   const indices=n===25?[5]:n<=29?[5,7]:[5,7,9];indices.forEach(index=>symbol(index,'assets/art/carrot-bonus.png',true));detail.indices=indices;
   if(n===28){detail.indices=[4,9,14,19];detail.indices.forEach(index=>symbol(index,'assets/back.png'))}
   if(n===30)detail.indices=[9];
  }
  if(n===6||n===12){const host=q('#message'),original=host.textContent;host.textContent=n===6?'本局沒有中獎。':'連鎖結束，下一局倍率重設。';restore.push(()=>host.textContent=original)}
  if(n===33){const rail=q('#multipliers'),original=rail.innerHTML;rail.innerHTML='<span class="active">×2</span><span>×4</span><span>×6</span><span>×10</span>';restore.push(()=>rail.innerHTML=original);setPill('免費 10 次')}
  if(n===34||n===35){detail.target=setPill(n===35?'最後 1 次免費':'免費 ＋5 次');if(n===35)detail.indices=Array.from({length:20},(_,i)=>i)}
  if([32,36,38,39,40,42,46,47,48].includes(n)){
   const panel=doc.createElement('section');panel.className='fx-preview-panel';
   if(n===32)panel.innerHTML='<h2>FREE SPINS</h2><div class="feature-carrots">'+[1,2,3].map(()=>'<img src="assets/art/carrot-bonus.png" alt="CARROT">').join('')+'</div><div class="feature-title">10 FREE SPINS</div><button class="btn primary" type="button">開始免費遊戲</button>';
   else if(n===42)panel.innerHTML='<h2>Auto Play</h2><div class="chips"><button>10</button><button class="selected">20</button><button>30</button></div><p>旋轉次數、獎勵倍數、餘額上下限</p><div class="btn-row"><button class="btn">取消</button><button class="btn primary">開始</button></div>';
   else if(n===46)panel.innerHTML='<h2>玩法與計算</h2><div class="tabs"><button class="active">玩法</button><button>賠付與例子</button></div><p>由最左列開始，至少連續 3 列相同符號即可中獎。</p><button class="btn primary">明白</button>';
   else if(n===47)panel.innerHTML='<h2>新手教學</h2><div class="tutorial-cards">'+[1,2,3].map(()=>'<img src="assets/art/card-normal-J.png" alt="J">').join('')+'</div><p>左至右連續三列，認識第一次中獎。</p><div class="tutorial-progress"><i class="active"></i><i></i><i></i><i></i></div>';
   else if(n===48)panel.innerHTML='<h2>牌局已暫停</h2><p>恢復後繼續同一局已保存的結果，不重新扣除下注或重複發放獎勵。</p><button class="btn primary">繼續牌局</button>';
   else panel.innerHTML=`<h2>${n===36?'TOTAL WIN':n===39?'EPIC WIN':'BIG WIN'}</h2><div class="reward-amount"><img class="currency-inline" src="assets/carrot.png" alt="蘿蔔"> ${formatting(detail.amount)}</div><button class="btn primary" type="button">收下獎勵</button>`;
   app.append(panel);temporary.push(panel);detail.target=[32,42,46,47,48].includes(n)?panel:panel.querySelector('.reward-amount');
   if(n===40){const award=play(38,{...detail,target:panel.querySelector('.reward-amount')});let resolve;const finished=new Promise(r=>resolve=r);timers.push(setTimeout(()=>{if(cleaned)return;finishCounters();play(40,{preview:true,target:panel.querySelector('button')});timers.push(setTimeout(()=>{const exit=track(panel,[{opacity:1},{opacity:0}],260);exit.finished.then(()=>{award.cancel();clean();resolve()})},400))},350));return{id,duration:1200,element:panel,finished,cancel(){award.cancel();clean();resolve()}}}
  }
  if(n===41){detail.target=q('#balance');detail.from=Number(detail.target.textContent.replace(/,/g,''))||2000;detail.to=detail.from+280}
  if(n===11){const rail=q('#multipliers'),original=rail.innerHTML;rail.innerHTML='<span>×1</span><span class="active">×2</span><span>×3</span><span>×5</span>';restore.push(()=>rail.innerHTML=original);detail.target=q('#multipliers .active')}
  if(n===43){const button=q('#auto'),label=button.querySelector('small'),original=label.textContent,on=button.classList.contains('on');button.classList.add('on');label.textContent='9';restore.push(()=>{label.textContent=original;button.classList.toggle('on',on)});detail.target=button}if(n===48)detail.resuming=true;
  const handle=play(id,detail);handle.finished.then(clean);const cancel=handle.cancel;handle.cancel=()=>{cancel();clean()};return handle;
 }
 function durationForPreview(id){const d=ANIMATION_DEFINITIONS.find(a=>a.id===id)?.duration??0;return reduced()?Math.min(d,140):d}

 return{startWaterfall,animate:track,get reducedMotion(){return reduced()},ready,play,setReducedMotion,startIdle,stopIdle,clear,setPlaybackRate,pause,resume,finishCounters,get isCounting(){return counters.size>0},history,durationFor:input=>ANIMATION_DEFINITIONS.find(d=>d.id===key(input))?.duration??0,previews:()=>ANIMATION_DEFINITIONS.map(a=>({...a})),preview};
}
