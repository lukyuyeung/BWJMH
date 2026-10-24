import React,{useEffect,useRef,useState} from 'react';
import type {RiichiReveal} from './riichi-reveal';
import {completeTileUrl} from './approved-tile-art';
import './riichi-scratch.css';
export function RiichiScratch({reveal,canTsumo,reduce}:{reveal:RiichiReveal;canTsumo:boolean;reduce:boolean}){
 const canvas=useRef<HTMLCanvasElement>(null),[revealed,setRevealed]=useState(false),[seconds,setSeconds]=useState(10);
 useEffect(()=>{
  const node=canvas.current,ctx=node?.getContext('2d',{willReadFrequently:true});if(!node||!ctx){reveal.complete();return;}
  let done=false,pointer:number|null=null,last:{x:number;y:number}|null=null,moves=0,frame=0,finishTimer:ReturnType<typeof setTimeout>|undefined;
  const mask=document.createElement('canvas');mask.width=45;mask.height=63;const mc=mask.getContext('2d',{willReadFrequently:true})!;
  const finish=()=>{if(done)return;done=true;setRevealed(true);finishTimer=setTimeout(reveal.complete,reduce?180:550)};
  ctx.clearRect(0,0,360,504);ctx.globalCompositeOperation='source-over';const g=ctx.createLinearGradient(0,0,360,504);g.addColorStop(0,'#343037');g.addColorStop(.35,'#17151b');g.addColorStop(.8,'#22212a');g.addColorStop(1,'#3e2d35');ctx.fillStyle=g;ctx.fillRect(0,0,360,504);ctx.strokeStyle='#c4a06b';ctx.lineWidth=3;ctx.strokeRect(13,13,334,478);ctx.strokeStyle='#94745b66';ctx.lineWidth=1;ctx.strokeRect(23,23,314,458);ctx.globalCompositeOperation='destination-out';ctx.strokeStyle='#000';ctx.fillStyle='#000';
  const tick=()=>{const left=Math.max(0,reveal.deadline-Date.now());setSeconds(Math.ceil(left/1000));if(left<=0)finish();if(!done)frame=requestAnimationFrame(tick)};
  const point=(e:PointerEvent)=>{const r=node.getBoundingClientRect();return{x:(e.clientX-r.left)/r.width*360,y:(e.clientY-r.top)/r.height*504}};
  const draw=(e:PointerEvent)=>{if(done||pointer!==e.pointerId)return;if(Date.now()>=reveal.deadline){finish();return;}const p=point(e);ctx.lineWidth=64;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(last?.x??p.x,last?.y??p.y);ctx.lineTo(p.x,p.y);ctx.stroke();ctx.beginPath();ctx.arc(p.x,p.y,32,0,Math.PI*2);ctx.fill();last=p;node.dataset.scratched='true';if(++moves%3===0){mc.clearRect(0,0,45,63);mc.drawImage(node,0,0,45,63);const data=mc.getImageData(0,0,45,63).data;let clear=0;for(let i=3;i<data.length;i+=4)if(data[i]<80)clear++;if(clear/(45*63)>=.48)finish()}};
  const down=(e:PointerEvent)=>{if(done||!e.isPrimary)return;e.preventDefault();pointer=e.pointerId;last=null;node.setPointerCapture(pointer);draw(e)};
  const end=(e:PointerEvent)=>{if(pointer===e.pointerId){pointer=null;last=null}};
  const skip=()=>finish();const visibility=()=>{if(!document.hidden&&Date.now()>=reveal.deadline)finish()};
  node.addEventListener('pointerdown',down);node.addEventListener('pointermove',draw);for(const event of ['pointerup','pointercancel','lostpointercapture'] as const)node.addEventListener(event,end);node.addEventListener('bunny:reveal',skip);document.addEventListener('visibilitychange',visibility);tick();
  return()=>{cancelAnimationFrame(frame);clearTimeout(finishTimer);node.removeEventListener('pointerdown',down);node.removeEventListener('pointermove',draw);for(const event of ['pointerup','pointercancel','lostpointercapture'] as const)node.removeEventListener(event,end);node.removeEventListener('bunny:reveal',skip);document.removeEventListener('visibilitychange',visibility)};
 },[reveal.key,reveal.deadline,reveal.complete,reduce]);
 return <section className={'riichi-scratch-modal'+(revealed?' revealed':'')+(reduce?' reduced':'')} role="dialog" aria-modal="true" aria-label="立直摸牌刮牌" onContextMenu={e=>e.preventDefault()}><div className="rs-content"><span className="rs-eyebrow">RIICHI · DRAW</span><h2>立直摸牌</h2><p>{revealed?'牌面揭曉':'按住牌面，慢慢刮開'}</p><div className="rs-tile"><img src={completeTileUrl(reveal.tile!.face,!!reveal.tile!.red)} alt={revealed?'新摸牌 '+reveal.tile!.face:'待揭曉的新摸牌'} draggable={false}/><canvas ref={canvas} width="360" height="504" aria-label="按住並滑動刮開牌面"/><span className="rs-time" role="timer" aria-label={'刮牌剩餘 '+seconds+' 秒'}>{seconds}<small>秒</small></span></div><p className="rs-outcome">{revealed?canTsumo?'可以自摸':'繼續摸切':'最多十秒 · 時間到自動揭曉'}</p><button disabled={revealed} onClick={()=>canvas.current?.dispatchEvent(new Event('bunny:reveal'))}>直接揭曉</button></div></section>;
}
