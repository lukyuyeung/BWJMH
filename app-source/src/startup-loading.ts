import {useEffect,useState} from 'react';
declare global{interface Window{__bunnyLoading?:boolean;BunnyStartup?:{progress:(n:number)=>void;fail:()=>void;finish:()=>void}}}
function timeout<T>(promise:Promise<T>,ms=20000):Promise<T>{return new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Startup timeout')),ms);promise.then(value=>{clearTimeout(timer);resolve(value)},error=>{clearTimeout(timer);reject(error)})})}
function rendererReady(){return !!document.querySelector('.physical-renderer[data-ready=true]')||document.querySelector<HTMLElement>('.phone-stage')?.dataset.tileRenderer==='fallback'}
/** Only the playable first frame gates entry. Optional cinematic art loads separately. */
export function useStartupLoading(){const [ready,setReady]=useState(()=>!window.__bunnyLoading);useEffect(()=>{let live=true,busy=false;const done=()=>setReady(true);window.addEventListener('bunny:table-ready',done);
 const begin=async()=>{if(busy||!window.__bunnyLoading)return;busy=true;window.BunnyStartup?.progress(0);try{
 const started=Date.now();while(!rendererReady()){if(!live)return;if(Date.now()-started>20000)throw Error('Renderer timeout');await new Promise(resolve=>setTimeout(resolve,60))}if(!live)return;window.BunnyStartup?.progress(75);
 const visible=[...document.querySelectorAll<HTMLImageElement>('.phone-stage img')].filter(img=>img.getBoundingClientRect().width>0&&img.getBoundingClientRect().height>0&&!img.closest('.rank-art-gallery,.seat-emotes,.phone-player'));
 await timeout(Promise.all(visible.map(img=>img.decode())));if(!live)return;window.BunnyStartup?.progress(100);
 await new Promise<void>(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve())));if(live){window.BunnyStartup?.finish();setReady(true)}
 }catch{if(live)window.BunnyStartup?.fail()}finally{busy=false}};
 const retry=()=>void begin();window.addEventListener('bunny:retry-loading',retry);void begin();return()=>{live=false;window.removeEventListener('bunny:table-ready',done);window.removeEventListener('bunny:retry-loading',retry)};},[]);return ready}
