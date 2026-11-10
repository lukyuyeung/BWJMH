import{loadImage}from './asset-cache.js?v=guide-no-title-v1';
/** Runs only on an actual img error. Healthy cards never decode or poll here. */
export function installCardImageRecovery(root,{recoverFeed=()=>{}}={}){
 const attempts=new WeakMap(),events=[];
 const log=(kind,img)=>{events.push({kind,source:(img.dataset.cardSource||'').split('/').pop(),at:performance.now()});if(events.length>30)events.shift()};
 async function repair(img){
  if(!img.matches?.('img.art-card,img.gold-frame-art'))return;
  const flight=img.closest('.feed-viewport');if(flight){recoverFeed(Number(flight.dataset.feedIndex));log('flight-image-revealed-original',img);return}
  let state=attempts.get(img);if(!state){state={count:0,done:false,timer:null};attempts.set(img,state)}if(state.done){if(img.src.startsWith('data:')&&!state.originalRetried){state.originalRetried=true;img.src=img.dataset.cardSource;log('cached-uri-retry',img)}return;}
  clearTimeout(state.timer);const source=img.dataset.cardSource||img.getAttribute('src')?.split('?')[0];if(!source)return;
  if(state.count<2){state.count++;log('image-retry',img);img.src=source+(source.includes('?')?'&':'?')+'cardRetry='+state.count;state.timer=setTimeout(()=>{if(img.isConnected&&(!img.complete||!img.naturalWidth))repair(img)},1500);return}
  state.done=true;try{const cached=await loadImage(source);if(!img.isConnected||!cached.naturalWidth)return;
   const canvas=document.createElement('canvas'),width=Math.min(cached.naturalWidth,Math.max(256,Math.ceil(img.getBoundingClientRect().width*(devicePixelRatio||1))));canvas.width=width;canvas.height=Math.round(width*cached.naturalHeight/cached.naturalWidth);canvas.getContext('2d').drawImage(cached,0,0,canvas.width,canvas.height);img.src=canvas.toDataURL('image/png');log('cached-image-fallback',img);
  }catch{if(img.isConnected)img.src=source;log('image-unavailable',img)}
 }
 root.addEventListener('error',event=>repair(event.target),true);
 root.addEventListener('load',event=>{const state=attempts.get(event.target);if(state)clearTimeout(state.timer)},true);
 return{read:()=>events.slice()};
}
