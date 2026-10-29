import {useEffect,useState} from 'react';
type Entry={image:HTMLImageElement;ready:boolean;promise:Promise<boolean>;used:number;refs:number;bytes:number};
const images=new Map<string,Entry>(),budget=64*1024*1024;
function trim(protect?:string){let total=[...images.values()].reduce((n,e)=>n+e.bytes,0);for(const [url,e] of [...images.entries()].sort((a,b)=>a[1].used-b[1].used)){if(total<=budget)break;if(url===protect||e.refs||!e.ready)continue;images.delete(url);total-=e.bytes}}
export function artCacheStats(){return{entries:images.size,decodedBytes:[...images.values()].reduce((n,e)=>n+e.bytes,0),budget}}
export function imageReady(url:string){return images.get(url)?.ready??false}
/** Coalesced decode cache. Release old, unused image references after 64 MiB. */
export function warmImage(url:string,priority:'high'|'low'='low'):Promise<boolean>{
 const cached=images.get(url);if(cached){cached.used=performance.now();if(priority==='high')cached.image.fetchPriority='high';return cached.promise}
 const image=new Image();image.decoding='async';image.fetchPriority=priority;
 const entry:Entry={image,ready:false,promise:Promise.resolve(false),used:performance.now(),refs:0,bytes:0};images.set(url,entry);image.src=url;
 entry.promise=image.decode().then(()=>{entry.ready=true;entry.bytes=image.naturalWidth*image.naturalHeight*4;trim(url);return true},()=>{if(images.get(url)===entry)images.delete(url);return false});return entry.promise;
}
export function useReadyImage(url:string,priority:'high'|'low'='high'){
 const [state,setReady]=useState(()=>({url,ready:imageReady(url)}));
 useEffect(()=>{let live=true;setReady({url,ready:imageReady(url)});const promise=warmImage(url,priority),entry=images.get(url);if(entry)entry.refs++;void promise.then(value=>{if(live)setReady({url,ready:value})});return()=>{live=false;if(entry)entry.refs--;trim()};},[url,priority]);return state.url===url?state.ready:imageReady(url);
}
export async function warmImagesInOrder(urls:string[],concurrency=2){let next=0;await Promise.all(Array.from({length:concurrency},async()=>{while(next<urls.length)await warmImage(urls[next++]!,'low')}))}

/** Keep shared call art decoded for the lifetime of the table. */
export function retainImages(urls:string[]){const entries=urls.map(url=>{void warmImage(url,'high');const e=images.get(url);if(e)e.refs++;return e});return()=>{for(const e of entries)if(e)e.refs--;trim()}}
