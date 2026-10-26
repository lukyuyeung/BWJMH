import {useEffect,useState} from 'react';
type Entry={image:HTMLImageElement;ready:boolean;promise:Promise<boolean>};
const images=new Map<string,Entry>();
export function imageReady(url:string){return images.get(url)?.ready??false}
/** Retain decoded images and coalesce requests. Critical portraits precede optional large artwork. */
export function warmImage(url:string,priority:'high'|'low'='low'):Promise<boolean>{
 const cached=images.get(url);if(cached)return cached.promise;
 const image=new Image();image.decoding='async';image.fetchPriority=priority;
 const entry:Entry={image,ready:false,promise:Promise.resolve(false)};images.set(url,entry);image.src=url;
 entry.promise=image.decode().then(()=>{entry.ready=true;return true},()=>{if(images.get(url)===entry)images.delete(url);return false});return entry.promise;
}
export function useReadyImage(url:string,priority:'high'|'low'='high'){
 const [ready,setReady]=useState(()=>imageReady(url));
 useEffect(()=>{let live=true;setReady(imageReady(url));void warmImage(url,priority).then(value=>{if(live)setReady(value)});return()=>{live=false}},[url,priority]);return ready;
}
export async function warmImagesInOrder(urls:string[],concurrency=2){let next=0;await Promise.all(Array.from({length:concurrency},async()=>{while(next<urls.length)await warmImage(urls[next++]!,'low')}))}
