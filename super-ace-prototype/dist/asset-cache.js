import {ASSET_MAP} from './asset-map.js?v=phone-guide-v1';
const images=new Map(),pending=new Map(),queue=[];let active=0,completed=0;const listeners=new Set();
export const assetURL=src=>ASSET_MAP[src.split('?')[0]]??src;
const notify=()=>listeners.forEach(fn=>fn({completed,total:completed+pending.size,active}));
function drain(){while(active<4&&queue.length){const job=queue.shift();active++;job().finally(()=>{active--;drain()})}}
export function loadImage(source,{priority='auto'}={}){
 const src=assetURL(source);if(images.has(src))return Promise.resolve(images.get(src));if(pending.has(src))return pending.get(src);
 const task=new Promise((resolve,reject)=>{const run=async()=>{try{let last;
  for(let attempt=0;attempt<3;attempt++){try{const img=new Image();img.decoding='async';img.fetchPriority=priority;
   await new Promise((done,fail)=>{const timer=setTimeout(()=>{img.src='';fail(new Error('圖片載入逾時'))},12000);img.onload=()=>{clearTimeout(timer);done()};img.onerror=()=>{clearTimeout(timer);fail(new Error('圖片載入失敗'))};img.src=src});await img.decode();images.set(src,img);completed++;resolve(img);return;
  }catch(e){last=e;if(attempt<2)await new Promise(r=>setTimeout(r,250*(attempt+1)))}}
  throw last;
 }catch(e){reject(e)}finally{pending.delete(src);notify()}};if(priority==='high')queue.unshift(run);else queue.push(run);queueMicrotask(drain)});
 pending.set(src,task);notify();return task;
}
export const prepareImages=sources=>Promise.all([...new Set(sources)].map(src=>loadImage(src)));
export function onAssetProgress(fn){listeners.add(fn);notify();return()=>listeners.delete(fn)}
export function assetStats(){return{decoded:images.size,pending:pending.size,queued:queue.length}}
export function preparedImage(source){const img=images.get(assetURL(source));return img?.cloneNode()??null}
// Keep decoded Image objects alive for the session instead of only retaining URL promises.
export function presentationSources(){return Object.keys(ASSET_MAP).filter(src=>
 src.startsWith('assets/art/effects/')||src.startsWith('assets/art/ui/')||src.startsWith('assets/art/v4/')||src.startsWith('assets/art/v6/')||
 ['assets/carrot.png','assets/back.png','assets/bunny-gala-transparent.png','assets/art/v2/board-felt.png','assets/art/v3/numeric-hud.svg','assets/art/scene/portrait-background.png','assets/art/v5/carrot-world.png','assets/art/v5/carrot-pile.svg','assets/art/v5/mega-win.svg','assets/art/reward-big.svg','assets/art/control-square.svg','assets/art/card-win-glow.png'].includes(src)).concat(['assets/art/v7/control-auto-button.webp','assets/art/v7/control-speed-normal-button.webp','assets/art/v7/control-speed-fast-button.webp']);}
