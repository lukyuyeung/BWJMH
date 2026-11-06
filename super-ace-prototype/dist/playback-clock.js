/** Reschedules in-flight presentation waits when playback speed changes. */
export function createPlaybackClock({now=()=>performance.now(),setTimer=setTimeout,clearTimer=clearTimeout}={}) {
 let scale=1;const pending=new Set();
 function schedule(entry){
  entry.started=now();entry.scale=scale;
  entry.timer=setTimer(()=>{pending.delete(entry);entry.resolve()},Math.max(0,entry.remaining*scale));
 }
 return {
  wait(milliseconds){
   if(!Number.isFinite(milliseconds)||milliseconds<0)throw new RangeError('Invalid presentation duration');
   return new Promise(resolve=>{const entry={remaining:milliseconds,resolve};pending.add(entry);schedule(entry)});
  },
  setScale(next){
   if(!Number.isFinite(next)||next<0)throw new RangeError('Invalid playback scale');
   if(next===scale)return;
   const time=now();
   for(const entry of pending){clearTimer(entry.timer);if(entry.scale>0)entry.remaining=Math.max(0,entry.remaining-(time-entry.started)/entry.scale)}
   scale=next;for(const entry of pending)schedule(entry);
  },
  get scale(){return scale}
 };
}
