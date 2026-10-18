import React,{useEffect,useMemo,useRef,useState} from 'react';
import {galaSnapshot} from './gala-state.js';
import type {Game,Seat} from './main.js';

export function GalaScene({game,reduce,motion,riichiTiles,onReady,hoverFace}:{game:Game;reduce:boolean;motion:boolean;riichiTiles:Partial<Record<Seat,string>>;onReady:(ready:boolean)=>void;hoverFace:string|null}){
 const frame=useRef<HTMLIFrameElement>(null),[ready,setReady]=useState(false);
 const snapshot=useMemo(()=>{
  return {...galaSnapshot(game,reduce||matchMedia('(prefers-reduced-motion: reduce)').matches,motion,riichiTiles),hoverFace};
 },[game,reduce,motion,riichiTiles,hoverFace]);
 useEffect(()=>{
  const receive=(e:MessageEvent)=>{
   if(e.source!==frame.current?.contentWindow||e.origin!==location.origin)return;
   if(e.data?.type==='bunny:gala-ready')setReady(true);
   if(e.data?.type==='bunny:gala-error')setReady(false);
  };
  window.addEventListener('message',receive);return()=>window.removeEventListener('message',receive);
 },[]);
 useEffect(()=>{
  const viewport=frame.current?.parentElement;
  viewport?.classList.toggle('gala-v9-ready',ready);onReady(ready);
  return()=>viewport?.classList.remove('gala-v9-ready');
 },[ready,onReady]);
 useEffect(()=>{if(ready)frame.current?.contentWindow?.postMessage({type:'bunny:gala-state',snapshot},location.origin)},[ready,snapshot]);
 return <iframe ref={frame} className="gala-v9-frame" src="/gala-v9/live.html" title="Bunny Gala 3D 牌桌" tabIndex={-1} aria-hidden="true"/>;
}
