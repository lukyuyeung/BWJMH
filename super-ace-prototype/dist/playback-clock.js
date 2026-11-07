/** Presentation time only: speed changes and pauses never advance game results. */
export function createPlaybackClock({now=()=>performance.now(),setTimer=setTimeout,clearTimer=clearTimeout}={}) {
 let scale=1,paused=false;const pending=new Set();
 function schedule(entry){
  if(paused)return;
  entry.started=now();entry.scale=scale;const generation=++entry.generation;
  entry.timer=setTimer(()=>{
   if(paused||entry.generation!==generation||!pending.has(entry))return;
   pending.delete(entry);entry.timer=null;entry.resolve();
  },Math.max(0,entry.remaining*scale));
 }
 function suspend(entry,time){
  if(entry.timer===null)return;
  clearTimer(entry.timer);entry.timer=null;entry.generation++;
  if(entry.scale>0)entry.remaining=Math.max(0,entry.remaining-(time-entry.started)/entry.scale);
 }
 return {
  wait(milliseconds){
   if(!Number.isFinite(milliseconds)||milliseconds<0)throw new RangeError('Invalid presentation duration');
   return new Promise(resolve=>{const entry={remaining:milliseconds,resolve,timer:null,generation:0};pending.add(entry);schedule(entry)});
  },
  setScale(next){
   if(!Number.isFinite(next)||next<0)throw new RangeError('Invalid playback scale');
   if(next===scale)return;
   const time=now();for(const entry of pending)suspend(entry,time);
   scale=next;for(const entry of pending)schedule(entry);
  },
  pause(){
   if(paused)return;
   const time=now();for(const entry of pending)suspend(entry,time);
   paused=true;
  },
  resume(){
   if(!paused)return;
   paused=false;for(const entry of pending)schedule(entry);
  },
  get scale(){return scale},
  get paused(){return paused}
 };
}
