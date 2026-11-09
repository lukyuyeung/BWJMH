/** Art-directed scene layers and perimeter light flow share the game's pausable effects clock. */
export function createCarrotScenes(effects){
 const stack=document.createElement('div');stack.className='scene-stack';stack.setAttribute('aria-hidden','true');document.body.prepend(stack);
 const layers=[];for(const free of[false,true])for(let heat=0;heat<4;heat++){const layer=document.createElement('div');layer.className=`scene-layer scene-${free?'free':'base'}-${heat}`;stack.append(layer);layers.push(layer)}
 let current=-1,generation=0,motions=[],runners=[];const history=[];
 function stopRunners(){for(const e of runners)e?.animation.cancel();runners=[];document.querySelectorAll('.perimeter-runner').forEach(e=>e.remove())}
 function lightFlow(heat,free){stopRunners();if(heat<1||effects.reducedMotion)return;const board=document.querySelector('.board-shell');if(!board)return;const w=board.clientWidth,h=board.clientHeight,count=Math.min(heat===3?(free?4:3):heat,effects.quality.level==='low'?1:effects.quality.level==='medium'?2:4),duration=heat===3?(free?1700:2100):heat===2?2600:3500;
  for(let i=0;i<count;i++){const img=document.createElement('img');img.className='perimeter-runner';img.src='assets/runtime/burst-f39fc36d-display512.webp';img.alt='';board.append(img);const e=effects.animate(img,[{transform:'translate(0,0)',opacity:.8},{transform:`translate(${w}px,0)`,opacity:1,offset:.25},{transform:`translate(${w}px,${h}px)`,opacity:.8,offset:.5},{transform:`translate(0,${h}px)`,opacity:1,offset:.75},{transform:'translate(0,0)',opacity:.8}],duration,{iterations:Infinity,delay:-i*duration/count,easing:'linear',cleanup:()=>img.remove()});runners.push(e)}
 }
 function set(heat,free=false){heat=Math.max(0,Math.min(3,heat));const next=(free?4:0)+heat;if(next===current)return Promise.resolve();const id=++generation;
  const previous=current;current=next;const starts=layers.map(el=>Number(getComputedStyle(el).opacity));for(const e of motions)e?.animation.cancel();motions=[];
  document.body.dataset.sceneFree=String(free);document.body.dataset.heat=String(heat);const app=document.querySelector('.app');app.dataset.heat=String(heat);app.dataset.sceneFree=String(free);
  history.push({heat,free,previous,next,at:performance.now()});
  layers.forEach((el,i)=>{const target=Number(i===next);if(previous<0){el.style.opacity=target;return}el.style.opacity=starts[i];if(Math.abs(starts[i]-target)<.001)return;const e=effects.animate(el,[{opacity:starts[i]},{opacity:target}],1100,{informational:true,cleanup:()=>{if(id===generation)el.style.opacity=target}});motions.push(e)});
  lightFlow(heat,free);return Promise.all(motions.map(e=>e.finished));
 }
 function resize(){if(current>=0)lightFlow(current%4,current>=4)}
 return{set,resize,history,get state(){return{heat:current%4,free:current>=4}}};
}
